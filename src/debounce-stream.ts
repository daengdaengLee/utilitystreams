import { Transform, TransformCallback, TransformOptions } from "node:stream";
import { Task } from "./type.js";
import { delay } from "./util.js";

export class DebounceStream extends Transform {
  private task: Task | null;
  private flushCallback: TransformCallback | null;

  constructor(
    private readonly waitMs: number,
    options?: TransformOptions,
  ) {
    super(options);

    this.task = null;
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
    this.task = task;
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
    if (this.task !== null && this.task.done) {
      this.push(this.task.value.chunk, this.task.value.encoding);
      this.task = null;
    }

    if (this.task === null && this.flushCallback !== null) {
      this.flushCallback();
    }
  }
}
