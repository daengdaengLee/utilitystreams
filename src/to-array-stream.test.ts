import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { asyncInputs } from "./test-util/async-inputs.js";
import { syncInputs } from "./test-util/sync-inputs.js";
import { ToArrayStream } from "./to-array-stream.js";

const expected = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]];
const testCases = [
  {
    name: `sync data`,
    inputs: syncInputs,
  },
  {
    name: `async data`,
    inputs: asyncInputs,
  },
];

describe(`ToArrayStream Test`, () => {
  describe(`put chunks in an array in order.`, () => {
    for (const { name, inputs } of testCases) {
      it(name, async () => {
        const emitted: Array<Array<number>> = [];
        const reducer = (acc: Array<number>): void => {
          emitted.push(acc);
        };
        const toArrayStream = new ToArrayStream(
          { target: [] },
          { objectMode: true },
        );
        toArrayStream.on(`data`, reducer);
        await pipeline(Readable.from(inputs()), toArrayStream);
        expect(emitted).toEqual(expected);
        toArrayStream.off(`data`, reducer);
      });
    }
  });

  describe(`the array passed to constructor is the same as the array returned by toArray method.`, () => {
    for (const { name, inputs } of testCases) {
      it(name, async () => {
        const target: Array<number> = [];
        const toArrayStream = new ToArrayStream(
          { target: target },
          { objectMode: true },
        );
        await pipeline(Readable.from(inputs()), toArrayStream);
        expect(target).toBe(toArrayStream.toArray());
      });
    }
  });
});
