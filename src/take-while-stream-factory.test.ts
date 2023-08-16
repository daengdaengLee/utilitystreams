import { PassThrough, Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { takeWhileStreamFactory } from "./take-while-stream-factory.js";
import { ToArrayStream } from "./to-array-stream.js";
import { delay } from "./util.js";

describe(`takeWhileStreamFactory Test`, () => {
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
    return n < 5;
  };
  const asyncF = async (n: number): Promise<boolean> => {
    await delay(100);
    return syncF(n);
  };
  const expected: Array<number> = [1, 2, 3, 4];
  const testCases = [
    { name: `sync data + sync predicate`, f: syncF, inputs: syncInputs },
    { name: `sync data + async predicate`, f: asyncF, inputs: syncInputs },
    { name: `async data + sync predicate`, f: syncF, inputs: asyncInputs },
    { name: `async data + async predicate`, f: asyncF, inputs: asyncInputs },
  ];

  describe(`outputs while the predicate function returns true and exits.`, () => {
    for (const { name, f, inputs } of testCases) {
      describe(name, () => {
        it(`no curry version`, async () => {
          const outputs: Array<number> = [];
          await pipeline(
            takeWhileStreamFactory({ f: f }, Readable.from(inputs())),
            new ToArrayStream({ target: outputs }, { objectMode: true }),
          );
          expect(outputs).toEqual(expected);
        });

        it(`curry version`, async () => {
          const outputs: Array<number> = [];
          await pipeline(
            takeWhileStreamFactory({ f: f })(Readable.from(inputs())),
            new ToArrayStream({ target: outputs }, { objectMode: true }),
          );
          expect(outputs).toEqual(expected);
        });
      });
    }
  });

  describe(`close source stream when close wrapped stream.`, () => {
    for (const { name, f, inputs } of testCases) {
      const template = async (
        wrappedStreamFactory: (sourceStream: Readable) => Readable,
      ): Promise<void> => {
        let isSourceStreamDone = false;
        let isWrappedStreamDone = false;
        const sourceStreamOutputsAfterWrappedStreamDone: Array<number> = [];

        const sourceStream = Readable.from(inputs());
        sourceStream.on(`data`, (value) => {
          if (isWrappedStreamDone) {
            sourceStreamOutputsAfterWrappedStreamDone.push(value);
          }
        });
        const sourceStreamDone = new Promise<void>((resolve) => {
          sourceStream.on(`close`, () => {
            isSourceStreamDone = true;
            resolve();
          });
        });

        const wrappedStream = wrappedStreamFactory(sourceStream);
        const wrappedStreamDone = new Promise<void>((resolve) => {
          wrappedStream.on(`close`, () => {
            isWrappedStreamDone = true;
            resolve();
          });
        });

        await pipeline(wrappedStream, new PassThrough({ objectMode: true }));
        await Promise.all([sourceStreamDone, wrappedStreamDone]);

        expect(isSourceStreamDone).toBeTruthy();
        expect(isWrappedStreamDone).toBeTruthy();
        expect(sourceStreamOutputsAfterWrappedStreamDone.length).toEqual(0);
      };

      describe(name, () => {
        it(`no curry version`, async () => {
          const wrappedStreamFactory = (sourceStream: Readable): Readable => {
            return Readable.from(
              takeWhileStreamFactory({ f: f }, sourceStream),
            );
          };
          await template(wrappedStreamFactory);
        });

        it(`curry version`, async () => {
          const wrappedStreamFactory = (sourceStream: Readable): Readable => {
            return Readable.from(
              takeWhileStreamFactory({ f: f })(sourceStream),
            );
          };
          await template(wrappedStreamFactory);
        });
      });
    }
  });
});
