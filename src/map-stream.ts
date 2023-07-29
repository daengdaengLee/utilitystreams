import { Transform, TransformCallback, TransformOptions } from "node:stream";

type Mapper = (chunk: unknown, encoding: BufferEncoding) => unknown;

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
    let transformed: unknown;
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

    this.push(transformed);
    callback();
  }

  _flush(callback: TransformCallback): void {
    callback();
  }
}
