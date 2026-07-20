/* Core runtime for the NDS theatre. This file intentionally emits globals:
   the legacy script-tag architecture consumes these names across modules. */

interface TheatreGlobals {
  RW: number;
  RH: number;
  muted: boolean;
}

type Done = () => void;
type ScriptStep = (next: Done) => void;
type Ease = (value: number) => number;

interface ScriptRunner {
  gen: number;
  abort(): void;
  run(steps: ScriptStep[] | null | undefined, done?: Done): void;
}

interface Scheduler {
  to(fn: () => void, ms: number): ReturnType<typeof setTimeout>;
  iv(fn: () => void, ms: number): ReturnType<typeof setInterval>;
  clearIv(id: ReturnType<typeof setInterval>): void;
  clearAll(): void;
}

const G: TheatreGlobals = {
  RW: 400,
  RH: 240,
  muted: false
};

function clamp(value: number, low: number, high: number): number {
  return value < low ? low : (value > high ? high : value);
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

function easeOut(value: number): number {
  return 1 - (1 - value) * (1 - value);
}

function easeIn(value: number): number {
  return value * value;
}

function easeInOut(value: number): number {
  return value < 0.5
    ? 2 * value * value
    : 1 - Math.pow(-2 * value + 2, 2) / 2;
}

function easeOutBack(value: number): number {
  const overshoot = 1.70158;
  return 1 + (overshoot + 1) * Math.pow(value - 1, 3)
    + overshoot * Math.pow(value - 1, 2);
}

function rand(low: number, high: number): number {
  return low + Math.random() * (high - low);
}

function pick<T>(items: readonly T[]): T | undefined {
  return items[Math.floor(Math.random() * items.length)];
}

const Sched: Scheduler = (() => {
  let timeouts: Array<ReturnType<typeof setTimeout>> = [];
  let intervals: Array<ReturnType<typeof setInterval>> = [];

  return {
    to(fn, ms) {
      const id = setTimeout(() => {
        const index = timeouts.indexOf(id);
        if (index >= 0) timeouts.splice(index, 1);
        fn();
      }, ms);
      timeouts.push(id);
      return id;
    },

    iv(fn, ms) {
      const id = setInterval(fn, ms);
      intervals.push(id);
      return id;
    },

    clearIv(id) {
      clearInterval(id);
      const index = intervals.indexOf(id);
      if (index >= 0) intervals.splice(index, 1);
    },

    clearAll() {
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      timeouts = [];
      intervals = [];
    }
  };
})();

const Script: ScriptRunner = {
  gen: 0,

  abort() {
    Script.gen += 1;
  },

  run(steps, done) {
    if (!steps || steps.length === 0) {
      done?.();
      return;
    }

    const generation = Script.gen;
    let index = 0;

    function next(): void {
      if (generation !== Script.gen) return;
      if (index >= steps!.length) {
        done?.();
        return;
      }

      const step = steps![index++];
      try {
        step(next);
      } catch (error) {
        console.error('[script]', error);
        next();
      }
    }

    next();
  }
};

function seq(...steps: ScriptStep[]): ScriptStep {
  return next => Script.run(steps, next);
}

function wait(seconds: number): ScriptStep {
  return next => { Sched.to(next, seconds * 1000); };
}

function call(fn: () => void): ScriptStep {
  return next => {
    fn();
    next();
  };
}

function par(...steps: ScriptStep[]): ScriptStep {
  return next => {
    let remaining = steps.length;
    if (remaining === 0) {
      next();
      return;
    }

    const generation = Script.gen;
    steps.forEach(step => {
      step(() => {
        if (generation !== Script.gen) return;
        remaining -= 1;
        if (remaining === 0) next();
      });
    });
  };
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context is unavailable');
  context.imageSmoothingEnabled = false;
  return canvas;
}

const FONT = 'SimHei,"Microsoft YaHei",sans-serif';
const FONT_SERIF = 'Georgia,"Times New Roman",serif';

function txt(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  align: CanvasTextAlign = 'left',
  bold = false,
  font = FONT
): void {
  context.font = `${bold ? 'bold ' : ''}${size}px ${font}`;
  context.fillStyle = color;
  context.textBaseline = 'top';
  context.textAlign = align;
  context.fillText(text, Math.round(x), Math.round(y));
}

function txtOutline(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  outlineColor: string,
  align: CanvasTextAlign = 'left',
  bold = false,
  font = FONT
): void {
  context.font = `${bold ? 'bold ' : ''}${size}px ${font}`;
  context.textBaseline = 'top';
  context.textAlign = align;
  context.fillStyle = outlineColor;
  context.fillText(text, Math.round(x) + 1, Math.round(y) + 1);
  context.fillStyle = color;
  context.fillText(text, Math.round(x), Math.round(y));
}
