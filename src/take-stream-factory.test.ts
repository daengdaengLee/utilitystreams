import { Readable, PassThrough } from "node:stream";
import { pipeline } from "node:stream/promises";
import { takeStreamFactory } from "./take-stream-factory.js";
import { ToArrayStream } from "./to-array-stream.js";

describe(`TakeStreamFactory Test`, () => {
  it(`outputs only the number you set and exits.`, async () => {
    const n = 2;

    const inputs = [
      Buffer.from([1]),
      Buffer.from([2]),
      Buffer.from([3]),
      Buffer.from([4]),
      Buffer.from([5]),
      Buffer.from([6]),
    ];
    const outputs: Array<Buffer> = [];
    await pipeline(
      takeStreamFactory({ n: n }, Readable.from(inputs)),
      new ToArrayStream({ target: outputs }),
    );

    expect(outputs).toEqual(inputs.slice(0, n));
  });

  it(`close source stream after at most n data yields`, async () => {
    const n = 2;

    const inputs = [1, 2, 3, 4, 5, 6];
    const sourceOutputs: Array<number> = [];
    let sourceDone = false;
    const sourceStream = Readable.from(inputs);
    sourceStream.on(`data`, (value) => {
      sourceOutputs.push(value);
    });
    sourceStream.on(`close`, () => {
      sourceDone = true;
    });
    await pipeline(
      takeStreamFactory({ n: n }, sourceStream),
      new PassThrough({ objectMode: true }),
    );

    expect(sourceOutputs).toEqual(inputs.slice(0, n));
    expect(sourceDone).toBeTruthy();
  });
});
