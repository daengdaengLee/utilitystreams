import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { TakeWhileStream } from "./take-while-stream.js";
import { expected, testCases } from "./test-util/take-while-test-cases.js";
import { ToArrayStream } from "./to-array-stream.js";

describe(`TakeWhileStream Test`, () => {
  describe(`outputs while the predicate function returns true and exits.`, () => {
    for (const { name, f, inputs } of testCases) {
      it(name, async () => {
        const outputs: Array<number> = [];
        await pipeline(
          Readable.from(inputs()),
          new TakeWhileStream({ f: f }, { objectMode: true }),
          new ToArrayStream({ target: outputs }, { objectMode: true }),
        );
        expect(outputs).toEqual(expected);
      });
    }
  });

  describe(`done() when the predicate function returns false first or there is no more data.`, () => {
    for (const { name, f, inputs } of testCases) {
      it(name, async () => {
        const outputs: Array<number> = [];
        let dataWhenDone = null;
        const done = (): void => {
          dataWhenDone = outputs.at(-1);
        };
        await pipeline(
          Readable.from(inputs()),
          new TakeWhileStream({ f: f, done: done }, { objectMode: true }),
          new ToArrayStream({ target: outputs }, { objectMode: true }),
        );
        expect(dataWhenDone).toEqual(expected.at(-1));
      });
    }
  });
});
