import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ReduceStream } from "./reduce-stream.js";
import { asyncInputs } from "./test-util/async-inputs.js";
import { syncInputs } from "./test-util/sync-inputs.js";

const f = (acc: Array<number>, cur: number): Array<number> => {
  return cur % 2 === 0 ? [...acc, cur] : acc;
};
const expected = [
  [],
  [2],
  [2],
  [2, 4],
  [2, 4],
  [2, 4, 6],
  [2, 4, 6],
  [2, 4, 6, 8],
  [2, 4, 6, 8],
  [2, 4, 6, 8, 10],
];
const testCases = [
  { name: `sync data`, inputs: syncInputs },
  { name: `async data`, inputs: asyncInputs },
];

describe(`ReduceStream Test`, () => {
  describe(`accumulate and emit latest acc. (default)`, () => {
    for (const { name, inputs } of testCases) {
      it(name, async () => {
        const emitted: Array<Array<number>> = [];
        const reduceStream = new ReduceStream(
          { f: f, acc: [] },
          { objectMode: true },
        );
        reduceStream.on(`data`, (acc) => {
          emitted.push(acc);
        });
        await pipeline(Readable.from(inputs()), reduceStream);
        expect(emitted).toEqual([expected.at(-1)]);
      });
    }
  });

  describe(`accumulate and emit each acc.`, () => {
    for (const { name, inputs } of testCases) {
      it(name, async () => {
        const emitted: Array<Array<number>> = [];
        const reduceStream = new ReduceStream(
          { f: f, acc: [], emitLatest: false },
          { objectMode: true },
        );
        reduceStream.on(`data`, (acc) => {
          emitted.push(acc);
        });
        await pipeline(Readable.from(inputs()), reduceStream);
        expect(emitted).toEqual(expected);
      });
    }
  });

  describe(`get accumulated object by getAcc()`, () => {
    describe(`emit latest (default)`, () => {
      for (const { name, inputs } of testCases) {
        it(name, async () => {
          const reduceStream = new ReduceStream(
            { f: f, acc: [] },
            { objectMode: true },
          );
          await pipeline(Readable.from(inputs()), reduceStream);
          expect(reduceStream.getAcc()).toEqual(expected.at(-1));
        });
      }
    });

    describe(`emit everytime`, () => {
      for (const { name, inputs } of testCases) {
        it(name, async () => {
          const reduceStream = new ReduceStream(
            { f: f, acc: [], emitLatest: false },
            { objectMode: true },
          );
          await pipeline(Readable.from(inputs()), reduceStream);
          expect(reduceStream.getAcc()).toEqual(expected.at(-1));
        });
      }
    });
  });
});
