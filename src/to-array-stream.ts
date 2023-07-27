import { Writable, WritableOptions } from "node:stream";

export class ToArrayStream extends Writable {
  constructor(
    private readonly acc: Array<any>,
    private readonly includeEncoding: boolean = false,
    options?: WritableOptions,
  ) {
    super(options);
  }

  _write(
    chunk: unknown,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    if (this.includeEncoding) {
      this.acc.push({ chunk: chunk, encoding: encoding });
    } else {
      this.acc.push(chunk);
    }
    callback();
  }

  toArray(): Array<any> {
    return this.acc;
  }
}
