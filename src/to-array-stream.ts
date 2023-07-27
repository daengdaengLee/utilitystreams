import { Writable, WritableOptions } from "node:stream";

export class ToArrayStream extends Writable {
  private readonly target: Array<any>;
  private readonly includeEncoding: boolean;

  constructor(
    options1?: { target: Array<any>; includeEncoding?: boolean },
    options2?: WritableOptions,
  ) {
    super(options2);

    this.target = options1?.target ?? [];
    this.includeEncoding = options1?.includeEncoding ?? false;
  }

  _write(
    chunk: unknown,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    if (this.includeEncoding) {
      this.target.push({ chunk: chunk, encoding: encoding });
    } else {
      this.target.push(chunk);
    }
    callback();
  }

  toArray(): Array<any> {
    return this.target;
  }
}
