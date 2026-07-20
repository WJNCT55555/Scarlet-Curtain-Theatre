interface ColorGrade { rm?: number; gm?: number; bm?: number; ro?: number; go?: number; bo?: number; }
interface SubtitleText { zh: string; fr?: string; }
interface SubtitleOptions { speaker?: string; color?: string; }
interface CardSubtitle { toString(): string; fr?: string; }
interface SubtitleLine { t: string; size: number; color: string; lh: number; bold?: boolean; font?: string; }

interface GfxApi {
  init(canvas: HTMLCanvasElement): void;
  compose(canvas: CanvasImageSource): void;
  update(delta: number): void;
  flash(color?: string, alpha?: number): void;
  shake(amplitude: number, duration: number): void;
  fadeTo(value: number, speed?: number): void;
  setFade(value: number): void;
  getFade(): number;
  setGrade(from: ColorGrade | null, to?: ColorGrade | null, value?: number): void;
  snapGrade(grade: ColorGrade | null): void;
  setLetterbox(value: number): void;
  setIris(value: number): void;
  drawSubtitle(text: SubtitleText, options?: SubtitleOptions): void;
  drawCard(title: string, subtitle: string | CardSubtitle, alpha: number): void;
  ctx(): CanvasRenderingContext2D;
}

const GFX: GfxApi = (() => {
  let outputContext: CanvasRenderingContext2D;
  let buffer: HTMLCanvasElement;
  let bufferContext: CanvasRenderingContext2D;
  let quantLut: Uint8Array;
  let dither: Int8Array;
  let vignette: HTMLCanvasElement;
  let flashAlpha = 0;
  let flashColor = '#fff';
  let fadeAlpha = 0;
  let fadeTarget = 0;
  let fadeSpeed = 2;
  let shakeTime = 0;
  let shakeAmplitude = 0;
  let gradeFrom: ColorGrade | null = null;
  let gradeTo: ColorGrade | null = null;
  let gradeValue = 0;
  let letterbox = 0;
  let iris = 1;

  function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context is unavailable');
    return context;
  }

  function init(canvas: HTMLCanvasElement): void {
    canvas.width = G.RW * 2;
    canvas.height = G.RH * 2;
    outputContext = context2d(canvas);
    outputContext.imageSmoothingEnabled = false;
    outputContext.scale(2, 2);
    buffer = makeCanvas(G.RW, G.RH);
    bufferContext = context2d(buffer);
    bufferContext.imageSmoothingEnabled = false;

    vignette = makeCanvas(G.RW, G.RH);
    const vignetteContext = context2d(vignette);
    const gradient = vignetteContext.createRadialGradient(G.RW / 2, G.RH / 2, G.RH * .46, G.RW / 2, G.RH / 2, G.RW * .72);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(3,5,16,0.3)');
    vignetteContext.fillStyle = gradient;
    vignetteContext.fillRect(0, 0, G.RW, G.RH);

    quantLut = new Uint8Array(256);
    for (let index = 0; index < 256; index += 1) quantLut[index] = ((index >> 3) << 3) | (index >> 5);
    const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    dither = new Int8Array(16);
    for (let index = 0; index < 16; index += 1) dither[index] = Math.round((bayer[index] / 16 - .47) * 8);
  }

  function flash(color = '#fff', alpha = 1): void { flashColor = color; flashAlpha = alpha; }
  function shake(amplitude: number, duration: number): void { shakeAmplitude = amplitude; shakeTime = duration; }
  function fadeTo(value: number, speed = 2): void { fadeTarget = value; fadeSpeed = speed; }
  function setGrade(from: ColorGrade | null, to: ColorGrade | null = null, value = 0): void { gradeFrom = from; gradeTo = to; gradeValue = value; }
  function snapGrade(grade: ColorGrade | null): void { gradeFrom = grade; gradeTo = null; gradeValue = 1; }

  function update(delta: number): void {
    if (flashAlpha > 0) flashAlpha = Math.max(0, flashAlpha - delta * 2.6);
    if (shakeTime > 0) shakeTime = Math.max(0, shakeTime - delta);
    if (fadeAlpha !== fadeTarget) {
      const distance = fadeTarget - fadeAlpha;
      const step = fadeSpeed * delta;
      fadeAlpha = Math.abs(distance) <= step ? fadeTarget : fadeAlpha + Math.sign(distance) * step;
    }
    if (gradeTo) {
      if (1 - gradeValue <= .03) { gradeValue = 1; gradeFrom = gradeTo; gradeTo = null; }
      else gradeValue += delta * .9;
    }
  }

  function quantize(value: number): number {
    return quantLut[value < 0 ? 0 : (value > 255 ? 255 : value | 0)];
  }

  function compose(glCanvas: CanvasImageSource): void {
    let offsetX = 0, offsetY = 0;
    if (shakeTime > 0) {
      offsetX = (Math.random() - .5) * 2 * shakeAmplitude;
      offsetY = (Math.random() - .5) * 2 * shakeAmplitude;
    }
    bufferContext.clearRect(0, 0, G.RW, G.RH);
    bufferContext.drawImage(glCanvas, offsetX, offsetY, G.RW, G.RH);
    const image = bufferContext.getImageData(0, 0, G.RW, G.RH);
    const pixels = image.data;
    let rm = 1, gm = 1, bm = 1, ro = 0, go = 0, bo = 0;
    if (gradeFrom) {
      rm = gradeFrom.rm ?? 1; gm = gradeFrom.gm ?? 1; bm = gradeFrom.bm ?? 1;
      ro = gradeFrom.ro ?? 0; go = gradeFrom.go ?? 0; bo = gradeFrom.bo ?? 0;
      if (gradeTo) {
        rm = lerp(rm, gradeTo.rm ?? 1, gradeValue); gm = lerp(gm, gradeTo.gm ?? 1, gradeValue); bm = lerp(bm, gradeTo.bm ?? 1, gradeValue);
        ro = lerp(ro, gradeTo.ro ?? 0, gradeValue); go = lerp(go, gradeTo.go ?? 0, gradeValue); bo = lerp(bo, gradeTo.bo ?? 0, gradeValue);
      }
    }
    const plain = rm === 1 && gm === 1 && bm === 1 && ro === 0 && go === 0 && bo === 0;
    let pixel = 0;
    for (let y = 0; y < G.RH; y += 1) {
      const row = (y & 3) << 2;
      for (let x = 0; x < G.RW; x += 1) {
        const offset = dither[row | (x & 3)];
        pixels[pixel] = quantize((plain ? pixels[pixel] : pixels[pixel] * rm + ro) + offset);
        pixels[pixel + 1] = quantize((plain ? pixels[pixel + 1] : pixels[pixel + 1] * gm + go) + offset);
        pixels[pixel + 2] = quantize((plain ? pixels[pixel + 2] : pixels[pixel + 2] * bm + bo) + offset);
        pixel += 4;
      }
    }
    bufferContext.putImageData(image, 0, 0);
    outputContext.drawImage(buffer, 0, 0, G.RW, G.RH);
    outputContext.drawImage(vignette, 0, 0, G.RW, G.RH);
    if (letterbox > .01) {
      const height = G.RH * .12 * letterbox;
      outputContext.fillStyle = '#000'; outputContext.fillRect(0, 0, G.RW, height); outputContext.fillRect(0, G.RH - height, G.RW, height);
    }
    if (flashAlpha > 0) {
      outputContext.globalAlpha = flashAlpha; outputContext.fillStyle = flashColor; outputContext.fillRect(0, 0, G.RW, G.RH); outputContext.globalAlpha = 1;
    }
    if (fadeAlpha > 0) {
      outputContext.globalAlpha = fadeAlpha; outputContext.fillStyle = '#010105'; outputContext.fillRect(0, 0, G.RW, G.RH); outputContext.globalAlpha = 1;
    }
    if (iris < 1) {
      const radius = Math.max(16, G.RH * iris * .95);
      const gradient = outputContext.createRadialGradient(G.RW / 2, G.RH / 2, radius, G.RW / 2, G.RH / 2, radius + 14);
      gradient.addColorStop(0, 'rgba(0,0,0,0)'); gradient.addColorStop(1, '#000'); outputContext.fillStyle = gradient; outputContext.fillRect(0, 0, G.RW, G.RH);
    }
  }

  function drawSubtitle(text: SubtitleText, options: SubtitleOptions = {}): void {
    const lines: SubtitleLine[] = [];
    if (options.speaker) lines.push({ t: `${options.speaker}:`, size: 9, color: options.color ?? '#f0d080', bold: true, font: FONT_SERIF, lh: 12 });
    if (text.fr) lines.push({ t: text.fr, size: 8, color: '#d0b868', font: FONT_SERIF, lh: 11 });
    lines.push({ t: text.zh, size: 10, color: '#f8edda', lh: 13 });
    const height = lines.reduce((sum, line) => sum + line.lh, 8);
    const top = G.RH - height - 3;
    const gradient = outputContext.createLinearGradient(0, top - 6, 0, G.RH);
    gradient.addColorStop(0, 'rgba(2,2,8,0)'); gradient.addColorStop(.3, 'rgba(2,2,8,.82)'); gradient.addColorStop(1, 'rgba(2,2,8,.94)');
    outputContext.fillStyle = gradient; outputContext.fillRect(0, top - 6, G.RW, height + 9);
    let y = top + 4;
    lines.forEach(line => { txt(outputContext, line.t, G.RW / 2, y, line.size, line.color, 'center', line.bold ?? false, line.font); y += line.lh; });
  }

  function drawCard(title: string, subtitle: string | CardSubtitle, alpha: number): void {
    outputContext.globalAlpha = clamp01(alpha); outputContext.fillStyle = '#030207'; outputContext.fillRect(0, 0, G.RW, G.RH);
    outputContext.strokeStyle = '#831126'; outputContext.lineWidth = 1; outputContext.strokeRect(20, G.RH / 2 - 44, G.RW - 40, 88); outputContext.strokeRect(23, G.RH / 2 - 41, G.RW - 46, 82);
    txtOutline(outputContext, title, G.RW / 2, G.RH / 2 - 28, 18, '#eee8df', '#821126', 'center', true, FONT_SERIF);
    if (subtitle) txt(outputContext, String(subtitle), G.RW / 2, G.RH / 2 - 4, 10, '#b09aa4', 'center');
    if (typeof subtitle !== 'string' && subtitle.fr) txt(outputContext, subtitle.fr, G.RW / 2, G.RH / 2 + 10, 8, '#7a6888', 'center', false, FONT_SERIF);
    outputContext.globalAlpha = 1;
  }

  return {
    init, compose, update, flash, shake, fadeTo,
    setFade(value) { fadeAlpha = value; fadeTarget = value; },
    getFade() { return fadeAlpha; },
    setGrade, snapGrade,
    setLetterbox(value) { letterbox = clamp01(value); },
    setIris(value) { iris = clamp01(value); },
    drawSubtitle, drawCard,
    ctx() { return outputContext; }
  };
})();
