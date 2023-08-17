import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { takeStreamFactory } from "./take-stream-factory.js";
import { sourceStreamCloseTestTemplate } from "./test-util/source-stream-close-test-template.js";
import { n, expected, testCases } from "./test-util/take-test-cases.js";
import { ToArrayStream } from "./to-array-stream.js";

describe(`takeStreamFactory Test`, () => {
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
      describe(name, () => {
        it(`no curry version`, async () => {
          const sourceStream = Readable.from(inputs());
          const wrappedStream = Readable.from(
            takeStreamFactory({ n: n }, sourceStream),
          );
          await sourceStreamCloseTestTemplate(sourceStream, wrappedStream);
        });

        it(`curry version`, async () => {
          const sourceStream = Readable.from(inputs());
          const wrappedStream = Readable.from(
            takeStreamFactory({ n: n })(sourceStream),
          );
          await sourceStreamCloseTestTemplate(sourceStream, wrappedStream);
        });
      });
    }
  });
});
