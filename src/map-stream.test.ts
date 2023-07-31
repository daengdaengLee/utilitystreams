import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { MapStream } from "./map-stream.js";
import { ToArrayStream } from "./to-array-stream.js";
import { delay } from "./util.js";

describe(`MapStream Test`, () => {
  it(`transform data (sync data + sync mapper)`, async () => {
    const outputs: Array<number> = [];
    await pipeline(
      Readable.from([1, 2, 3, 4]),
      new MapStream(
        {
          f: (num: number) => {
            return num + 1;
          },
        },
        { objectMode: true },
      ),
      new ToArrayStream({ target: outputs }, { objectMode: true }),
    );

    expect(outputs).toEqual([2, 3, 4, 5]);
  });

  it(`transform data (sync data + async mapper)`, async () => {
    const outputs: Array<number> = [];
    await pipeline(
      Readable.from([1, 2, 3, 4]),
      new MapStream(
        {
          f: async (num: number) => {
            await delay(100);
            return num + 1;
          },
        },
        { objectMode: true },
      ),
      new ToArrayStream({ target: outputs }, { objectMode: true }),
    );

    expect(outputs).toEqual([2, 3, 4, 5]);
  });

  it(`transform data (async data + sync mapper)`, async () => {
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
      new MapStream(
        {
          f: (num: number) => {
            return num + 1;
          },
        },
        { objectMode: true },
      ),
      new ToArrayStream({ target: outputs }, { objectMode: true }),
    );

    expect(outputs).toEqual([2, 3, 4, 5]);
  });

  it(`transform data (async data + async mapper)`, async () => {
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
      new MapStream(
        {
          f: async (num: number) => {
            await delay(100);
            return num + 1;
          },
        },
        { objectMode: true },
      ),
      new ToArrayStream({ target: outputs }, { objectMode: true }),
    );

    expect(outputs).toEqual([2, 3, 4, 5]);
  });
});
