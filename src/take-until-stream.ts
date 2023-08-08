import { Transform, TransformCallback, TransformOptions } from "node:stream";

type Predicate = (
  chunk: any,
  encoding: BufferEncoding,
) => boolean | Promise<boolean>;

export class TakeUntilStream extends Transform {
  private readonly f: Predicate;
  private done: (() => void) | null;
  private isEnd: boolean;

  constructor(
    options1: { f: Predicate; done?: () => void },
    options2?: TransformOptions,
  ) {
    super(options2);

    this.f = options1.f;
    this.done = options1.done ?? null;
    this.isEnd = false;
  }

  _transform(
    chunk: unknown,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    if (this.isEnd) {
      callback();
      return;
    }

    (async () => {
      try {
        this.isEnd = await this.f(await chunk, encoding);
      } catch (error) {
        if (error instanceof Error) {
          callback(error);
        } else {
          callback(new Error(`failed to predicate.`));
        }
        return;
      }

      this.push(chunk, encoding);
      if (this.isEnd && this.done !== null) {
        this.done();
        this.done = null;
      }
      callback();
    })();
  }

  _flush(callback: TransformCallback): void {
    if (this.done !== null) {
      this.done();
      this.done = null;
    }
    callback();
  }
}
