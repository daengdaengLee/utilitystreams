import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { TakeUntilStream } from "./take-until-stream.js";
import { expected, testCases } from "./test-util/take-until-test-cases.js";
import { ToArrayStream } from "./to-array-stream.js";

describe(`TakeUntilStream Test`, () => {
  describe(`outputs until the predicate function returns true and exits.`, () => {
    for (const { name, f, inputs } of testCases) {
      it(name, async () => {
        const outputs: Array<number> = [];
        await pipeline(
          Readable.from(inputs()),
          new TakeUntilStream({ f: f }, { objectMode: true }),
          new ToArrayStream({ target: outputs }, { objectMode: true }),
        );
        expect(outputs).toEqual(expected);
      });
    }
  });

  describe(`done() when the predicate function returns true first or there is no more data.`, () => {
    for (const { name, f, inputs } of testCases) {
      it(name, async () => {
        const outputs: Array<number> = [];
        let dataWhenDone = null;
        const done = (): void => {
          dataWhenDone = outputs.at(-1);
        };
        await pipeline(
          Readable.from(inputs()),
          new TakeUntilStream({ f: f, done: done }, { objectMode: true }),
          new ToArrayStream({ target: outputs }, { objectMode: true }),
        );
        expect(dataWhenDone).toEqual(expected.at(-1));
      });
    }
  });
});
