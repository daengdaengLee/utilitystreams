import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { TakeStream } from "./take-stream.js";
import { n, expected, testCases } from "./test-util/take-test-cases.js";
import { ToArrayStream } from "./to-array-stream.js";

describe(`TakeStream Test`, () => {
  describe(`outputs only the number you set and exits.`, () => {
    for (const { name, inputs } of testCases) {
      it(name, async () => {
        const outputs: Array<number> = [];
        await pipeline(
          Readable.from(inputs()),
          new TakeStream({ n: n }, { objectMode: true }),
          new ToArrayStream({ target: outputs }, { objectMode: true }),
        );
        expect(outputs).toEqual(expected);
      });
    }
  });

  describe(`done() when n-th data transformed.`, () => {
    for (const { name, inputs } of testCases) {
      it(name, async () => {
        const outputs: Array<number> = [];
        let dataWhenDone = null;
        const done = (): void => {
          dataWhenDone = outputs.at(-1);
        };
        await pipeline(
          Readable.from(inputs()),
          new TakeStream({ n: n, done: done }, { objectMode: true }),
          new ToArrayStream({ target: outputs }, { objectMode: true }),
        );
        expect(dataWhenDone).toEqual(expected.at(-1));
      });
    }
  });
});
