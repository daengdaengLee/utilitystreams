import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { takeUntilStreamFactory } from "./take-until-stream-factory.js";
import { asyncInputs } from "./test-util/async-inputs.js";
import { sourceStreamCloseTestTemplate } from "./test-util/source-stream-close-test-template.js";
import { syncInputs } from "./test-util/sync-inputs.js";
import { ToArrayStream } from "./to-array-stream.js";
import { delay } from "./util.js";

const syncPredicate = (n: number): boolean => {
  return n >= 5;
};
const asyncPredicate = async (n: number): Promise<boolean> => {
  await delay(100);
  return syncPredicate(n);
};
const expected = [1, 2, 3, 4, 5];
const testCases = [
  { name: `sync data + sync predicate`, f: syncPredicate, inputs: syncInputs },
  {
    name: `sync data + async predicate`,
    f: asyncPredicate,
    inputs: syncInputs,
  },
  {
    name: `async data + sync predicate`,
    f: syncPredicate,
    inputs: asyncInputs,
  },
  {
    name: `async data + async predicate`,
    f: asyncPredicate,
    inputs: asyncInputs,
  },
];

describe(`takeUntilStreamFactory Test`, () => {
  describe(`outputs until the predicate function returns true and exits.`, () => {
    for (const { name, f, inputs } of testCases) {
      describe(name, () => {
        it(`no curry version`, async () => {
          const outputs: Array<number> = [];
          await pipeline(
            takeUntilStreamFactory({ f: f }, Readable.from(inputs())),
            new ToArrayStream({ target: outputs }, { objectMode: true }),
          );
          expect(outputs).toEqual(expected);
        });

        it(`curry version`, async () => {
          const outputs: Array<number> = [];
          await pipeline(
            takeUntilStreamFactory({ f: f })(Readable.from(inputs())),
            new ToArrayStream({ target: outputs }, { objectMode: true }),
          );
          expect(outputs).toEqual(expected);
        });
      });
    }
  });

  describe(`close source stream when close wrapped stream.`, () => {
    for (const { name, f, inputs } of testCases) {
      describe(name, () => {
        it(`no curry version`, async () => {
          const sourceStream = Readable.from(inputs());
          const wrappedStream = Readable.from(
            takeUntilStreamFactory({ f: f }, sourceStream),
          );
          await sourceStreamCloseTestTemplate(sourceStream, wrappedStream);
        });

        it(`curry version`, async () => {
          const sourceStream = Readable.from(inputs());
          const wrappedStream = Readable.from(
            takeUntilStreamFactory({ f: f })(sourceStream),
          );
          await sourceStreamCloseTestTemplate(sourceStream, wrappedStream);
        });
      });
    }
  });
});
