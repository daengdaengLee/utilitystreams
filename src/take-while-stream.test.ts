import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { TakeWhileStream } from "./take-while-stream.js";
import { asyncInputs } from "./test-util/async-inputs.js";
import { syncInputs } from "./test-util/sync-inputs.js";
import { ToArrayStream } from "./to-array-stream.js";
import { delay } from "./util.js";

describe(`TakeWhileStream Test`, () => {
  const syncF = (n: number): boolean => {
    return n < 5;
  };
  const asyncF = async (n: number): Promise<boolean> => {
    await delay(100);
    return syncF(n);
  };
  const expected: Array<number> = [1, 2, 3, 4];

  describe(`outputs while the predicate function returns true and exits.`, () => {
    it(`sync data + sync predicate`, async () => {
      const outputs: Array<number> = [];
      await pipeline(
        Readable.from(syncInputs()),
        new TakeWhileStream({ f: syncF }, { objectMode: true }),
        new ToArrayStream({ target: outputs }, { objectMode: true }),
      );
      expect(outputs).toEqual(expected);
    });

    it(`sync data + async predicate`, async () => {
      const outputs: Array<number> = [];
      await pipeline(
        Readable.from(syncInputs()),
        new TakeWhileStream({ f: asyncF }, { objectMode: true }),
        new ToArrayStream({ target: outputs }, { objectMode: true }),
      );
      expect(outputs).toEqual(expected);
    });

    it(`async data + sync predicate`, async () => {
      const outputs: Array<number> = [];
      await pipeline(
        Readable.from(asyncInputs()),
        new TakeWhileStream({ f: syncF }, { objectMode: true }),
        new ToArrayStream({ target: outputs }, { objectMode: true }),
      );
      expect(outputs).toEqual(expected);
    });

    it(`async data + async predicate`, async () => {
      const outputs: Array<number> = [];
      await pipeline(
        Readable.from(asyncInputs()),
        new TakeWhileStream({ f: asyncF }, { objectMode: true }),
        new ToArrayStream({ target: outputs }, { objectMode: true }),
      );
      expect(outputs).toEqual(expected);
    });
  });

  describe(`done() when the predicate function returns false first or there is no more data.`, () => {
    it(`sync data + sync predicate`, async () => {
      const outputs: Array<number> = [];
      let dataWhenDone = null;
      await pipeline(
        Readable.from(syncInputs()),
        new TakeWhileStream(
          {
            f: syncF,
            done: () => {
              dataWhenDone = outputs.at(-1);
            },
          },
          { objectMode: true },
        ),
        new ToArrayStream({ target: outputs }, { objectMode: true }),
      );
      expect(outputs).toEqual(expected);
      expect(dataWhenDone).toEqual(expected.at(-1));
    });

    it(`sync data + async predicate`, async () => {
      const outputs: Array<number> = [];
      let dataWhenDone = null;
      await pipeline(
        Readable.from(syncInputs()),
        new TakeWhileStream(
          {
            f: asyncF,
            done: () => {
              dataWhenDone = outputs.at(-1);
            },
          },
          { objectMode: true },
        ),
        new ToArrayStream({ target: outputs }, { objectMode: true }),
      );
      expect(outputs).toEqual(expected);
      expect(dataWhenDone).toEqual(expected.at(-1));
    });

    it(`async data + sync predicate`, async () => {
      const outputs: Array<number> = [];
      let dataWhenDone = null;
      await pipeline(
        Readable.from(asyncInputs()),
        new TakeWhileStream(
          {
            f: syncF,
            done: () => {
              dataWhenDone = outputs.at(-1);
            },
          },
          { objectMode: true },
        ),
        new ToArrayStream({ target: outputs }, { objectMode: true }),
      );
      expect(outputs).toEqual(expected);
      expect(dataWhenDone).toEqual(expected.at(-1));
    });

    it(`async data + async predicate`, async () => {
      const outputs: Array<number> = [];
      let dataWhenDone = null;
      await pipeline(
        Readable.from(asyncInputs()),
        new TakeWhileStream(
          {
            f: asyncF,
            done: () => {
              dataWhenDone = outputs.at(-1);
            },
          },
          { objectMode: true },
        ),
        new ToArrayStream({ target: outputs }, { objectMode: true }),
      );
      expect(outputs).toEqual(expected);
      expect(dataWhenDone).toEqual(expected.at(-1));
    });
  });
});
