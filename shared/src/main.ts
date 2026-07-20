(() => {
  let glCanvas: HTMLCanvasElement;
  let outCanvas: HTMLCanvasElement;
  let lastTimestamp = 0;
  let started = false;
  let showDone = false;
  const playId = document.body.dataset.playId ?? 'unknown';
  const initialSet = document.body.dataset.initialSet ?? '';

  function requiredElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing required element #${id}`);
    return element as T;
  }

  function configurePresentation(): void {
    const params = new URLSearchParams(location.search);
    if (params.get('embed') === '1') document.body.dataset.embedded = 'true';
    document.body.dataset.language = params.get('lang') ?? document.body.dataset.defaultLanguage ?? 'zh';
  }

  function report(type: string, progress?: number): void {
    if (window.parent === window) return;
    window.parent.postMessage({ type: `pocket-theatre:${type}`, progress, play: playId }, location.origin);
  }

  function setProgress(value: number): void {
    const progress = clamp01(value);
    window.__THEATRE_PROGRESS__ = progress;
    requiredElement<HTMLElement>('progressFill').style.transform = `scaleX(${progress})`;
    requiredElement<HTMLElement>('progressPercent').textContent = `${Math.round(progress * 100)}%`;
    requiredElement<HTMLElement>('showProgress').setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    report('progress', progress);
  }

  function fitStage(): void {
    const wrap = requiredElement<HTMLElement>('stageWrap');
    const availableWidth = window.innerWidth - 40;
    const availableHeight = window.innerHeight - 40;
    let scale = Math.min(availableWidth / 800, availableHeight / 480);
    if (scale > 1) scale = Math.floor(scale * 2) / 2;
    if (scale <= 0) scale = 1;
    wrap.style.transform = `scale(${scale})`;
    wrap.style.transformOrigin = 'center center';
  }

  function startShow(): void {
    const steps = Play.fullShow() as ScriptStep[];
    let completed = 0;
    const tracked = steps.map(step => (next: Done) => {
      step(() => {
        completed += 1;
        setProgress(completed / steps.length);
        next();
      });
    });
    Script.run(tracked, () => {
      showDone = true;
      setProgress(1);
      document.body.dataset.showState = 'done';
      report('done', 1);
    });
  }

  function loop(timestamp: number): void {
    const delta = Math.min(.05, (timestamp - lastTimestamp) / 1000 || .016);
    lastTimestamp = timestamp;
    Theater.update(delta);
    Sets.update(delta);
    Actors.applyPoses(delta);
    GFX.update(delta);
    Theater.render();
    GFX.compose(glCanvas);
    Director.draw(delta);
    requestAnimationFrame(loop);
  }

  function boot(): void {
    configurePresentation();
    glCanvas = requiredElement<HTMLCanvasElement>('glCanvas');
    outCanvas = requiredElement<HTMLCanvasElement>('outCanvas');
    GFX.init(outCanvas);
    Theater.init(glCanvas);
    Sets.build();
    Sets.show(initialSet);
    Sets.snapCurtain(0);
    Play.buildCast();
    Theater.shot({ pos: [0, 26, 250], look: [0, 17.5, -2], fov: 28, dur: 0 });
    Theater.mood({ amb: .4, ambColor: '#7a6a72', hemi: .22, key: .24, keyColor: '#c8a080', keyPos: [30, 90, 130], rim: .1, foot: .55, footColor: '#ffc890' }, .1);
    GFX.setFade(0);
    setProgress(0);
    fitStage();
    window.addEventListener('resize', fitStage);

    const bootElement = requiredElement<HTMLElement>('boot');
    bootElement.addEventListener('click', () => {
      if (started) return;
      started = true;
      document.body.dataset.showState = 'running';
      AudioSys.init();
      AudioSys.resume();
      bootElement.classList.add('gone');
      report('started', 0);
      Sched.to(startShow, 900);
    });

    document.addEventListener('keydown', event => {
      const key = event.key.toLowerCase();
      if (key === 'm') {
        G.muted = !G.muted;
        AudioSys.setMuted(G.muted);
      } else if (key === 'r') location.reload();
    });
    outCanvas.parentElement?.addEventListener('click', () => {
      AudioSys.resume();
      if (showDone) location.reload();
    });
    report('ready', 0);
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
