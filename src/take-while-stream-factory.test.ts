import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { takeWhileStreamFactory } from "./take-while-stream-factory.js";
import { sourceStreamCloseTestTemplate } from "./test-util/source-stream-close-test-template.js";
import { expected, testCases } from "./test-util/take-while-test-cases.js";
import { ToArrayStream } from "./to-array-stream.js";

describe(`takeWhileStreamFactory Test`, () => {
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
      describe(name, () => {
        it(`no curry version`, async () => {
          const sourceStream = Readable.from(inputs());
          const wrappedStream = Readable.from(
            takeWhileStreamFactory({ f: f }, sourceStream),
          );
          await sourceStreamCloseTestTemplate(sourceStream, wrappedStream);
        });

        it(`curry version`, async () => {
          const sourceStream = Readable.from(inputs());
          const wrappedStream = Readable.from(
            takeWhileStreamFactory({ f: f })(sourceStream),
          );
          await sourceStreamCloseTestTemplate(sourceStream, wrappedStream);
        });
      });
    }
  });
});
