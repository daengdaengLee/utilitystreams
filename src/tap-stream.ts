import { Transform, TransformCallback, TransformOptions } from "node:stream";

type Consumer =
  | ((chunk: any, encoding: BufferEncoding) => any)
  | ((chunk: any) => any);

export class TapStream extends Transform {
  private readonly f: Consumer;

  constructor(options1: { f: Consumer }, options2: TransformOptions) {
    super(options2);

    this.f = options1.f;
  }

  _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    (async () => {
      try {
        await this.f(await chunk, encoding);
      } catch {}
      this.push(chunk, encoding);
      callback();
    })();
  }

  _flush(callback: TransformCallback) {
    callback();
  }
}
