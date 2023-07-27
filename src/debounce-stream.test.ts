import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { DebounceStream } from "./debounce-stream.js";
import { ToArrayStream } from "./to-array-stream.js";
import { delay } from "./util.js";

describe(`DebounceStream Test`, () => {
  it(`only the last value remains among the consecutive values.`, async () => {
    const waitMs = 500;

    const outputData: Array<Buffer> = [];
    await pipeline(
      Readable.from(
        (async function* () {
          yield Buffer.from([1]);
          yield Buffer.from([2]);
          yield Buffer.from([3]);

          await delay(waitMs * 2);

          yield Buffer.from([4]);
          yield Buffer.from([5]);
          yield Buffer.from([6]);
        })(),
      ),
      new DebounceStream({ waitMs: waitMs }),
      new ToArrayStream({ target: outputData }),
    );

    expect(outputData).toEqual([Buffer.from([3]), Buffer.from([6])]);
  });
});
