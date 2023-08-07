import { Transform, TransformCallback, TransformOptions } from "node:stream";

export class TakeStream extends Transform {
  private readonly n: number;
  private i: number;
  private done: (() => void) | null;

  constructor(
    options1: { n: number; done?: () => void },
    options2?: TransformOptions,
  ) {
    super(options2);

    if (!Number.isInteger(options1.n)) {
      throw new Error(`options1.n should be an integer.`);
    }

    this.n = options1.n;
    this.i = 0;
    this.done = options1.done ?? null;
  }

  _transform(
    chunk: unknown,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ) {
    if (this.i >= this.n) {
      callback();
      return;
    }

    this.i += 1;
    this.push(chunk, encoding);
    callback();

    if (this.i === this.n && this.done !== null) {
      this.done();
      this.done = null;
    }
  }

  _flush(callback: TransformCallback) {
    if (this.done !== null) {
      this.done();
      this.done = null;
    }
    callback();
  }
}
