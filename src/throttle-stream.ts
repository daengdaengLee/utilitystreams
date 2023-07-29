import { Transform, TransformCallback, TransformOptions } from "node:stream";
import { delay } from "./util.js";

export class ThrottleStream extends Transform {
  private readonly waitMs: number;
  private isBlocked: boolean;

  constructor(options1: { waitMs: number }, options2?: TransformOptions) {
    super(options2);

    this.waitMs = options1.waitMs;
    this.isBlocked = false;
  }

  _transform(
    chunk: unknown,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    if (this.isBlocked) {
      callback();
      return;
    }

    this.isBlocked = true;
    delay(this.waitMs).then(() => {
      this.isBlocked = false;
    });
    this.push(chunk, encoding);
    callback();
  }

  _flush(callback: TransformCallback): void {
    callback();
  }
}
