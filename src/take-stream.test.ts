import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { TakeStream } from "./take-stream.js";
import { ToArrayStream } from "./to-array-stream.js";

describe(`TakeStream Test`, () => {
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
      Readable.from(inputs),
      new TakeStream({ n: n }),
      new ToArrayStream({ target: outputs }),
    );

    expect(outputs).toEqual(inputs.slice(0, n));
  });

  /**
   *
   * This case is only used when the source readable should be destroyed.
   * It's very hard to "end" the stream "pipeline" in the middle.
   * So, I prepare a callback function to do end the source readable stream.
   * You have to prepare some error handling from destroy call or call some custom stop logic.
   */
  it(`done() when n-th data transformed.`, async () => {
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
    let dataWhenDone = null;
    await pipeline(
      Readable.from(inputs),
      new TakeStream({
        n: n,
        done: () => {
          dataWhenDone = outputs.at(-1);
        },
      }),
      new ToArrayStream({ target: outputs }),
    );

    expect(outputs).toEqual(inputs.slice(0, n));
    expect(dataWhenDone).toEqual(inputs.slice(0, n).at(-1));
  });
});
