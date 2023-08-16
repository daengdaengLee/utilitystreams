import { PassThrough, Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export const sourceStreamCloseTestTemplate = async (
  sourceStream: Readable,
  wrappedStream: Readable,
): Promise<void> => {
  let isSourceStreamDone = false;
  let isWrappedStreamDone = false;
  const sourceStreamOutputsAfterWrappedStreamDone: Array<number> = [];

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
