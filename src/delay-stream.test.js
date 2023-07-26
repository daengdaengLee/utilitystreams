const { Readable, Writable } = require("node:stream");
const { pipeline } = require("node:stream/promises");
const { DelayStream } = require("./delay-stream");

class ToArrayStream extends Writable {
  constructor(acc, options) {
    super(options);
    this.acc = acc;
  }

  _write(chunk, encoding, callback) {
    this.acc.push(chunk);
    callback();
  }
}

describe(`DelayStream Test`, () => {
  it(`input data is not changed including it's order.`, async () => {
    const inputData = [1,2,3].map(a => {return Buffer.from([a])});
    const outputData = [];

    await pipeline(
      Readable.from(inputData),
      new DelayStream(10),
      new ToArrayStream(outputData),
    );

    expect(outputData).toEqual(inputData);
  });

  it(`stream waits as long as configured time.`, async () => {
    const inputData = [Buffer.from(`Hello World`)];
    const waitMs = 1000;
    const tolerance = 15;

    const start = Date.now();
    await pipeline(
      Readable.from(inputData),
      new DelayStream(waitMs),
      new ToArrayStream([]),
    );
    const end = Date.now();
    const diff = end - start;

    expect(diff).toBeGreaterThanOrEqual(waitMs - tolerance);
    expect(diff).toBeLessThanOrEqual(waitMs + tolerance);
  });
});
