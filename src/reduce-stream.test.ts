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
  {
    name: `sync data + emit latest (default option)`,
    inputs: syncInputs,
    emitLatest: true,
    expected: [expected.at(-1)],
  },
  {
    name: `sync data + emit each`,
    inputs: syncInputs,
    emitLatest: false,
    expected: expected,
  },
  {
    name: `async data + emit latest (default option)`,
    inputs: asyncInputs,
    emitLatest: true,
    expected: [expected.at(-1)],
  },
  {
    name: `async data + emit each`,
    inputs: asyncInputs,
    emitLatest: false,
    expected: expected,
  },
];

describe(`ReduceStream Test`, () => {
  describe(`accumulate values`, () => {
    for (const { name, inputs, emitLatest, expected } of testCases) {
      it(name, async () => {
        const emitted: Array<Array<number>> = [];
        const reducer = (acc: Array<number>): void => {
          emitted.push(acc);
        };
        const reduceStream = new ReduceStream(
          { f: f, acc: [], emitLatest: emitLatest },
          { objectMode: true },
        );
        reduceStream.on(`data`, reducer);
        await pipeline(Readable.from(inputs()), reduceStream);
        expect(emitted).toEqual(expected);
        reduceStream.off(`data`, reducer);
      });
    }
  });

  describe(`get accumulated object by getAcc()`, () => {
    for (const { name, inputs, emitLatest, expected } of testCases) {
      it(name, async () => {
        const reduceStream = new ReduceStream(
          { f: f, acc: [], emitLatest: emitLatest },
          { objectMode: true },
        );
        await pipeline(Readable.from(inputs()), reduceStream);
        expect(reduceStream.getAcc()).toEqual(expected.at(-1));
      });
    }
  });
});
