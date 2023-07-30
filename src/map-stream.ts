import { Transform, TransformCallback, TransformOptions } from "node:stream";

type Data = { chunk: unknown; encoding?: BufferEncoding };

type Mapper = (
  chunk: unknown,
  encoding: BufferEncoding,
) => Data | Promise<Data>;

export class MapStream extends Transform {
  private readonly f: Mapper;

  constructor(options1: { f: Mapper }, options2: TransformOptions) {
    super(options2);

    this.f = options1.f;
  }

  _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    let transformed: Data | Promise<Data>;
    try {
      transformed = this.f(chunk, encoding);
    } catch (error) {
      if (error instanceof Error) {
        callback(error);
      } else {
        callback(new Error(`failed to transform.`));
      }
      return;
    }

    if (transformed instanceof Promise) {
      transformed
        .then((transformed) => {
          this.push(transformed.chunk, transformed.encoding);
          callback();
        })
        .catch((error) => {
          if (error instanceof Error) {
            callback(error);
          } else {
            callback(new Error(`failed to transform.`));
          }
        });
    } else {
      this.push(transformed.chunk, transformed.encoding);
      callback();
    }
  }

  _flush(callback: TransformCallback): void {
    callback();
  }
}
