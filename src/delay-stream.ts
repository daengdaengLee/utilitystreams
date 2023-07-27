import { Transform, TransformCallback, TransformOptions } from "node:stream";
import { Task } from "./type.js";
import { delay } from "./util.js";

export class DelayStream extends Transform {
  private readonly waitMs: number;
  private readonly queue: Array<Task>;
  private flushCallback: TransformCallback | null;

  constructor(options1: { waitMs: number }, options2?: TransformOptions) {
    super(options2);

    this.waitMs = options1.waitMs;
    this.queue = [];
    this.flushCallback = null;
  }

  _transform(
    chunk: unknown,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    const task = {
      done: false,
      value: { chunk: chunk, encoding: encoding },
    };
    this.queue.push(task);
    delay(this.waitMs).then(() => {
      task.done = true;
      this.tick();
    });
    callback();
  }

  _flush(callback: TransformCallback): void {
    this.flushCallback = callback;
    this.tick();
  }

  private tick(): void {
    let task = this.queue.at(0);
    while (task != null && task.done) {
      this.push(task.value.chunk, task.value.encoding);
      this.queue.shift();
      task = this.queue.at(0);
    }

    if (this.queue.length === 0 && this.flushCallback !== null) {
      this.flushCallback();
    }
  }
}
