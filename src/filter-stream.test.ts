import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { FilterStream } from "./filter-stream.js";
import { ToArrayStream } from "./to-array-stream.js";
import { delay } from "./util.js";

const isEven = (num: number): boolean => {
  return num % 2 === 0;
};

describe(`FilterStream Test`, () => {
  it(`transform data (sync data + sync predicate)`, async () => {
    const outputs: Array<number> = [];
    await pipeline(
      Readable.from([1, 2, 3, 4]),
      new FilterStream({ f: isEven }, { objectMode: true }),
      new ToArrayStream({ target: outputs }, { objectMode: true }),
    );

    expect(outputs).toEqual([2, 4]);
  });

  it(`transform data (sync data + async predicate)`, async () => {
    const outputs: Array<number> = [];
    await pipeline(
      Readable.from([1, 2, 3, 4]),
      new FilterStream(
        {
          f: async (num: number) => {
            await delay(100);
            return isEven(num);
          },
        },
        { objectMode: true },
      ),
      new ToArrayStream({ target: outputs }, { objectMode: true }),
    );

    expect(outputs).toEqual([2, 4]);
  });

  it(`transform data (async data + sync predicate)`, async () => {
    const outputs: Array<number> = [];
    await pipeline(
      Readable.from(
        (async function* () {
          await delay(100);
          yield 1;

          await delay(100);
          yield 2;

          await delay(100);
          yield 3;

          await delay(100);
          yield 4;
        })(),
      ),
      new FilterStream({ f: isEven }, { objectMode: true }),
      new ToArrayStream({ target: outputs }, { objectMode: true }),
    );

    expect(outputs).toEqual([2, 4]);
  });

  it(`transform data (async data + async predicate)`, async () => {
    const outputs: Array<number> = [];
    await pipeline(
      Readable.from(
        (async function* () {
          await delay(100);
          yield 1;

          await delay(100);
          yield 2;

          await delay(100);
          yield 3;

          await delay(100);
          yield 4;
        })(),
      ),
      new FilterStream(
        {
          f: async (num: number) => {
            await delay(100);
            return isEven(num);
          },
        },
        { objectMode: true },
      ),
      new ToArrayStream({ target: outputs }, { objectMode: true }),
    );

    expect(outputs).toEqual([2, 4]);
  });
});
