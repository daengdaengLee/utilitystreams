import { Transform, TransformCallback, TransformOptions } from "node:stream";

type Predicate = (
  chunk: any,
  encoding: BufferEncoding,
) => boolean | Promise<boolean>;

export class TakeWhileStream extends Transform {
  private readonly f: Predicate;
  private isEnd: boolean;

  constructor(options1: { f: Predicate }, options2: TransformOptions) {
    super(options2);

    this.f = options1.f;
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

      if (!this.isEnd) {
        this.push(chunk, encoding);
      }
      callback();
    })();
  }

  _flush(callback: TransformCallback): void {
    callback();
  }
}
