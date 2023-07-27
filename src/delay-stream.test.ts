import { Readable, Writable, WritableOptions } from "node:stream";
import { pipeline } from "node:stream/promises";
import { DelayStream } from "./delay-stream.js";
import { delay } from "./util.js";

class ToArrayStream extends Writable {
  constructor(
    private readonly acc: Array<any>,
    options?: WritableOptions,
  ) {
    super(options);
  }

  _write(
    chunk: unknown,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    this.acc.push(chunk);
    callback();
  }
}

describe(`DelayStream Test`, () => {
  it(`input data is not changed including it's order.`, async () => {
    const inputData = [1, 2, 3].map((a) => {
      return Buffer.from([a]);
    });
    const outputData: Array<Buffer> = [];

    await pipeline(
      Readable.from(inputData),
      new DelayStream(10),
      new ToArrayStream(outputData),
    );

    expect(outputData).toEqual(inputData);
  });

  it(`stream waits as long as configured time.`, async () => {
    const waitMs = 1000;
    const delayMs = 500;
    const tolerance = 15;

    const start = Date.now();
    await pipeline(
      Readable.from(
        (async function* () {
          yield Buffer.from([1]);
          yield Buffer.from([2]);
          yield Buffer.from([3]);

          await delay(delayMs);

          yield Buffer.from([4]);
          yield Buffer.from([5]);
          yield Buffer.from([6]);
        })(),
      ),
      new DelayStream(waitMs),
      new ToArrayStream([]),
    );
    const end = Date.now();
    const diff = end - start;

    expect(diff).toBeGreaterThanOrEqual(waitMs + delayMs - tolerance);
    expect(diff).toBeLessThanOrEqual(waitMs + delayMs + tolerance);
  });
});
