import { Readable, PassThrough } from "node:stream";
import { pipeline } from "node:stream/promises";
import { takeStreamFactory } from "./take-stream-factory.js";
import { asyncInputs } from "./test-util/async-inputs.js";
import { syncInputs } from "./test-util/sync-inputs.js";
import { ToArrayStream } from "./to-array-stream.js";

describe(`takeStreamFactory Test`, () => {
  const n = 4;
  const expected = [1, 2, 3, 4];
  const testCases = [
    { name: `sync data`, inputs: syncInputs },
    { name: `async data`, inputs: asyncInputs },
  ];

  describe(`outputs only the number you set and exits.`, () => {
    for (const { name, inputs } of testCases) {
      describe(name, () => {
        it(`no currey version`, async () => {
          const outputs: Array<number> = [];
          await pipeline(
            takeStreamFactory({ n: n }, Readable.from(inputs())),
            new ToArrayStream({ target: outputs }, { objectMode: true }),
          );
          expect(outputs).toEqual(expected);
        });

        it(`currey version`, async () => {
          const outputs: Array<number> = [];
          await pipeline(
            takeStreamFactory({ n: n })(Readable.from(inputs())),
            new ToArrayStream({ target: outputs }, { objectMode: true }),
          );
          expect(outputs).toEqual(expected);
        });
      });
    }
  });

  describe(`close source stream when close wrapped stream.`, () => {
    for (const { name, inputs } of testCases) {
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
            return Readable.from(takeStreamFactory({ n: n }, sourceStream));
          };
          await template(wrappedStreamFactory);
        });

        it(`curry version`, async () => {
          const wrappedStreamFactory = (sourceStream: Readable): Readable => {
            return Readable.from(takeStreamFactory({ n: n })(sourceStream));
          };
          await template(wrappedStreamFactory);
        });
      });
    }
  });
});
