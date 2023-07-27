import { Transform, TransformCallback, TransformOptions } from "node:stream";
import { delay } from "./util.js";

export class ThrottleStream extends Transform {
  private readonly waitMs: number;
  private isBlocked: boolean;

  constructor(option1: { waitMs: number }, option2?: TransformOptions) {
    super(option2);

    this.waitMs = option1.waitMs;
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
