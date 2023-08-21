import { Transform, TransformCallback, TransformOptions } from "node:stream";

type Reducer<TAcc, TCur> = (acc: TAcc, cur: TCur) => TAcc | Promise<TAcc>;

export class ReduceStream<TAcc, TCur> extends Transform {
  private acc: TAcc;
  private readonly f: Reducer<TAcc, TCur>;
  private readonly emitLatest: boolean;

  constructor(
    options1: {
      acc: TAcc;
      f: Reducer<TAcc, TCur>;
      emitLatest?: boolean;
    },
    options2?: TransformOptions,
  ) {
    super({ ...options2, readableObjectMode: true });

    this.acc = options1.acc;
    this.f = options1.f;
    this.emitLatest = options1?.emitLatest ?? true;
  }

  _transform(
    chunk: TCur,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ) {
    (async () => {
      try {
        this.acc = await this.f(this.acc, chunk);
      } catch (error) {
        if (error instanceof Error) {
          callback(error);
        } else {
          callback(new Error(`failed to accumulate.`));
        }
        return;
      }
      if (!this.emitLatest) {
        this.push(this.acc);
      }
      callback();
    })();
  }

  _flush(callback: TransformCallback) {
    if (this.emitLatest) {
      this.push(this.acc);
    }
    callback();
  }

  getAcc(): TAcc {
    return this.acc;
  }
}
