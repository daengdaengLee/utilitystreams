import { Transform, TransformCallback, TransformOptions } from "node:stream";

export class TakeStream extends Transform {
  private readonly n: number;
  private i: number;

  constructor(options1: { n: number }, options2?: TransformOptions) {
    super(options2);

    if (!Number.isInteger(options1.n)) {
      throw new Error(`options1.n should be an integer.`);
    }

    this.n = options1.n;
    this.i = 0;
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
  }

  _flush(callback: TransformCallback) {
    callback();
  }
}
