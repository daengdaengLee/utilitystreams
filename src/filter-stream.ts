import { Transform, TransformCallback, TransformOptions } from "node:stream";

type Predicate = (
  chunk: any,
  encoding: BufferEncoding,
) => boolean | Promise<boolean>;

export class FilterStream extends Transform {
  private readonly f: Predicate;

  constructor(options1: { f: Predicate }, options2: TransformOptions) {
    super(options2);

    this.f = options1.f;
  }

  _transform(
    chunk: unknown,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    (async () => {
      let isOk: boolean;
      try {
        isOk = await this.f(await chunk, encoding);
      } catch (error) {
        if (error instanceof Error) {
          callback(error);
        } else {
          callback(new Error(`failed to predicate.`));
        }
        return;
      }

      if (isOk) {
        this.push(chunk, encoding);
      }
      callback();
    })();
  }

  _flush(callback: TransformCallback): void {
    callback();
  }
}
