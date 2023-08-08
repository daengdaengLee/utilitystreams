import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { TakeUntilStream } from "./take-until-stream.js";
import { ToArrayStream } from "./to-array-stream.js";
import { delay } from "./util.js";

describe(`TakeUntilStream Test`, () => {
  function* syncInputs() {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      yield n;
    }
  }
  async function* asyncInputs() {
    for (const n of syncInputs()) {
      await delay(50);
      yield n;
      await delay(50);
    }
  }
  const syncF = (n: number): boolean => {
    return n >= 5;
  };
  const asyncF = async (n: number): Promise<boolean> => {
    await delay(100);
    return syncF(n);
  };
  const expected: Array<number> = [1, 2, 3, 4, 5];

  describe(`outputs until the predicate function returns true and exits.`, () => {
    it(`sync data + sync predicate`, async () => {
      const outputs: Array<number> = [];
      await pipeline(
        Readable.from(syncInputs()),
        new TakeUntilStream({ f: syncF }, { objectMode: true }),
        new ToArrayStream({ target: outputs }, { objectMode: true }),
      );
      expect(outputs).toEqual(expected);
    });

    it(`sync data + async predicate`, async () => {
      const outputs: Array<number> = [];
      await pipeline(
        Readable.from(syncInputs()),
        new TakeUntilStream({ f: asyncF }, { objectMode: true }),
        new ToArrayStream({ target: outputs }, { objectMode: true }),
      );
      expect(outputs).toEqual(expected);
    });

    it(`async data + sync predicate`, async () => {
      const outputs: Array<number> = [];
      await pipeline(
        Readable.from(asyncInputs()),
        new TakeUntilStream({ f: syncF }, { objectMode: true }),
        new ToArrayStream({ target: outputs }, { objectMode: true }),
      );
      expect(outputs).toEqual(expected);
    });

    it(`async data + async predicate`, async () => {
      const outputs: Array<number> = [];
      await pipeline(
        Readable.from(asyncInputs()),
        new TakeUntilStream({ f: asyncF }, { objectMode: true }),
        new ToArrayStream({ target: outputs }, { objectMode: true }),
      );
      expect(outputs).toEqual(expected);
    });
  });

  describe(`done() when the predicate function returns true first or there is no more data.`, () => {
    it(`sync data + sync predicate`, async () => {
      const outputs: Array<number> = [];
      let dataWhenDone = null;
      await pipeline(
        Readable.from(syncInputs()),
        new TakeUntilStream(
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
        new TakeUntilStream(
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
        new TakeUntilStream(
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
        new TakeUntilStream(
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
