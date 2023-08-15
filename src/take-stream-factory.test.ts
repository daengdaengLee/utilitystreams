import { Readable, PassThrough } from "node:stream";
import { pipeline } from "node:stream/promises";
import { takeStreamFactory } from "./take-stream-factory.js";
import { ToArrayStream } from "./to-array-stream.js";

describe(`TakeStreamFactory Test`, () => {
  const n = 2;
  const inputs = [1, 2, 3, 4, 5, 6];

  describe(`outputs only the number you set and exits.`, () => {
    it(`no currey version`, async () => {
      const outputs: Array<number> = [];
      await pipeline(
        takeStreamFactory({ n: n }, Readable.from(inputs)),
        new ToArrayStream({ target: outputs }, { objectMode: true }),
      );

      expect(outputs).toEqual(inputs.slice(0, n));
    });

    it(`currey version`, async () => {
      const outputs: Array<number> = [];
      await pipeline(
        takeStreamFactory({ n: n })(Readable.from(inputs)),
        new ToArrayStream({ target: outputs }, { objectMode: true }),
      );

      expect(outputs).toEqual(inputs.slice(0, n));
    });
  });

  describe(`close source stream after at most n data yields`, () => {
    it(`no curry version`, async () => {
      const sourceOutputs: Array<number> = [];
      let sourceDone = false;
      const sourceStream = Readable.from(inputs);
      sourceStream.on(`data`, (value) => {
        sourceOutputs.push(value);
      });
      sourceStream.on(`close`, () => {
        sourceDone = true;
      });
      await pipeline(
        takeStreamFactory({ n: n }, sourceStream),
        new PassThrough({ objectMode: true }),
      );

      expect(sourceOutputs).toEqual(inputs.slice(0, n));
      expect(sourceDone).toBeTruthy();
    });

    it(`curry version`, async () => {
      const sourceOutputs: Array<number> = [];
      let sourceDone = false;
      const sourceStream = Readable.from(inputs);
      sourceStream.on(`data`, (value) => {
        sourceOutputs.push(value);
      });
      sourceStream.on(`close`, () => {
        sourceDone = true;
      });
      await pipeline(
        takeStreamFactory({ n: n })(sourceStream),
        new PassThrough({ objectMode: true }),
      );

      expect(sourceOutputs).toEqual(inputs.slice(0, n));
      expect(sourceDone).toBeTruthy();
    });
  });
});
