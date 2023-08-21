import { TransformOptions } from "node:stream";
import { ReduceStream } from "./reduce-stream.js";

export class ToArrayStream<T> extends ReduceStream<Array<T>, T> {
  constructor(options1?: { target?: Array<T> }, options2?: TransformOptions) {
    const _options1 = {
      acc: options1?.target ?? [],
      f: (acc: Array<T>, cur: T): Array<T> => {
        acc.push(cur);
        return acc;
      },
      emitLatest: true,
    };
    super(_options1, options2);
  }

  toArray(): Array<T> {
    return this.getAcc();
  }
}
