"use strict";
(() => {
    var _a, _b;
    let glCanvas;
    let outCanvas;
    let lastTimestamp = 0;
    let started = false;
    let showDone = false;
    const playId = (_a = document.body.dataset.playId) !== null && _a !== void 0 ? _a : 'unknown';
    const initialSet = (_b = document.body.dataset.initialSet) !== null && _b !== void 0 ? _b : '';
    function requiredElement(id) {
        const element = document.getElementById(id);
        if (!element)
            throw new Error(`Missing required element #${id}`);
        return element;
    }
    function configurePresentation() {
        var _a, _b;
        const params = new URLSearchParams(location.search);
        if (params.get('embed') === '1')
            document.body.dataset.embedded = 'true';
        document.body.dataset.language = (_b = (_a = params.get('lang')) !== null && _a !== void 0 ? _a : document.body.dataset.defaultLanguage) !== null && _b !== void 0 ? _b : 'zh';
    }
    function report(type, progress) {
        if (window.parent === window)
            return;
        window.parent.postMessage({ type: `pocket-theatre:${type}`, progress, play: playId }, location.origin);
    }
    function setProgress(value) {
        const progress = clamp01(value);
        window.__THEATRE_PROGRESS__ = progress;
        requiredElement('progressFill').style.transform = `scaleX(${progress})`;
        requiredElement('progressPercent').textContent = `${Math.round(progress * 100)}%`;
        requiredElement('showProgress').setAttribute('aria-valuenow', String(Math.round(progress * 100)));
        report('progress', progress);
    }
    function fitStage() {
        const wrap = requiredElement('stageWrap');
        const availableWidth = window.innerWidth - 40;
        const availableHeight = window.innerHeight - 40;
        let scale = Math.min(availableWidth / 800, availableHeight / 480);
        if (scale > 1)
            scale = Math.floor(scale * 2) / 2;
        if (scale <= 0)
            scale = 1;
        wrap.style.transform = `scale(${scale})`;
        wrap.style.transformOrigin = 'center center';
    }
    function startShow() {
        const steps = Play.fullShow();
        let completed = 0;
        const tracked = steps.map(step => (next) => {
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
    function loop(timestamp) {
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
    function boot() {
        var _a;
        configurePresentation();
        glCanvas = requiredElement('glCanvas');
        outCanvas = requiredElement('outCanvas');
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
        const bootElement = requiredElement('boot');
        bootElement.addEventListener('click', () => {
            if (started)
                return;
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
            }
            else if (key === 'r')
                location.reload();
        });
        (_a = outCanvas.parentElement) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            AudioSys.resume();
            if (showDone)
                location.reload();
        });
        report('ready', 0);
        requestAnimationFrame(loop);
    }
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', boot);
    else
        boot();
})();
