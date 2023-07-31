import { Transform, TransformCallback, TransformOptions } from "node:stream";
import { delay } from "./util.js";

export class BufferStream extends Transform {
  private readonly size: number;
  private readonly waitMs: number | null;
  private readonly includeEncoding: boolean;
  private flushCallback: TransformCallback | null;
  private buffer: Array<{ chunk: unknown; encoding: BufferEncoding }>;
  private readonly tasks: Array<{ done: boolean }>;

  constructor(
    options1: { size: number; waitMs?: number; includeEncoding?: boolean },
    options2: TransformOptions,
  ) {
    super(options2);

    if (!Number.isInteger(options1.size)) {
      throw new Error(`options1.size should be an integer.`);
    }
    if (options1.size <= 0) {
      throw new Error(`options1.size should be positive.`);
    }

    if (options1.waitMs != null && !Number.isInteger(options1.waitMs)) {
      throw new Error(`options1.waitMs should be an integer.`);
    }
    if (options1.waitMs != null && options1.waitMs <= 0) {
      throw new Error(`options1.waitMs should be positive.`);
    }

    this.size = options1.size;
    this.waitMs = options1.waitMs ?? null;
    this.includeEncoding = options1.includeEncoding ?? false;
    this.flushCallback = null;
    this.buffer = [];
    this.tasks = [];
  }

  _transform(
    chunk: unknown,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    this.buffer.push({ chunk: chunk, encoding: encoding });

    if (this.buffer.length === this.size) {
      this.tick();
      callback();
      return;
    }

    if (this.waitMs !== null) {
      const task = { done: false };
      this.tasks.push(task);
      delay(this.waitMs).then(() => {
        task.done = true;
        this.tick();
      });
      callback();
      return;
    }

    callback();
  }

  _flush(callback: TransformCallback): void {
    this.flushCallback = callback;
    this.tick();
  }

  private tick(): void {
    if (this.buffer.length > 0) {
      this.push(this.buffer);
      this.buffer = [];
    }

    let task = this.tasks.at(0);
    while (task != null && task.done) {
      this.tasks.shift();
      task = this.tasks.at(0);
    }

    if (this.tasks.length === 0 && this.flushCallback !== null) {
      this.flushCallback();
    }
  }
}
