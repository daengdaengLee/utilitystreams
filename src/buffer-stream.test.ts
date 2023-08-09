import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { BufferStream } from "./buffer-stream.js";
import { ToArrayStream } from "./to-array-stream.js";
import { delay } from "./util.js";

describe(`BufferStream Test`, () => {
  it(`outputs the collected input data of the size`, async () => {
    const size = 3;
    const outputs: Array<Array<number>> = [];
    await pipeline(
      Readable.from([1, 2, 3, 4, 5]),
      new BufferStream({ size: size }, { objectMode: true }),
      new ToArrayStream({ target: outputs }, { objectMode: true }),
    );

    expect(outputs).toEqual([[1, 2, 3], [4]]);
  });

  it(`outputs the collected input data of the size with encoding`, async () => {
    const size = 3;
    const outputs: Array<Array<{ chunk: any; encoding: string }>> = [];
    await pipeline(
      Readable.from([`a`, `b`, `c`, `d`, `e`]),
      new BufferStream(
        { size: size, includeEncoding: true },
        { objectMode: true },
      ),
      new ToArrayStream({ target: outputs }, { objectMode: true }),
    );

    expect(outputs).toEqual([
      [
        { chunk: `a`, encoding: `utf8` },
        { chunk: `b`, encoding: `utf8` },
        { chunk: `c`, encoding: `utf8` },
      ],
      [
        { chunk: `d`, encoding: `utf8` },
        { chunk: `e`, encoding: `utf8` },
      ],
    ]);
  });

  it(`outputs the collected input data after waitMs even if the number is not enough.`, async () => {
    const size = 3;
    const waitMs = 100;
    const outputs: Array<Array<number>> = [];
    await pipeline(
      Readable.from(
        (async function* () {
          yield 1;
          yield 2;
          await delay(waitMs * 2);
          yield 3;
          await delay(waitMs * 2);
          yield 4;
          yield 5;
        })(),
      ),
      new BufferStream({ size: size, waitMs: waitMs }, { objectMode: true }),
      new ToArrayStream({ target: outputs }, { objectMode: true }),
    );

    expect(outputs).toEqual([[1, 2], [3], [4, 5]]);
  });
});
