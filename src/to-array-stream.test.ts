import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ToArrayStream } from "./to-array-stream.js";

describe(`ToArrayStream Test`, () => {
  it(`put chunks in an array in order.`, async () => {
    const inputData = [Buffer.from([1]), Buffer.from([2]), Buffer.from([3])];
    const outputData: Array<Buffer> = [];

    await pipeline(
      Readable.from(inputData),
      new ToArrayStream({ target: outputData }),
    );

    expect(outputData).toEqual(inputData);
  });

  it(`put chunks with its encoding in an array in order.`, async () => {
    const inputData = [{ message: "1" }, { message: "2" }, { message: "3" }];
    const outputData: Array<{ chunk: Buffer; encoding: string }> = [];

    await pipeline(
      Readable.from(inputData),
      new ToArrayStream(
        { target: outputData, includeEncoding: true },
        { objectMode: true },
      ),
    );

    expect(
      outputData.map((data) => {
        return data.chunk;
      }),
    ).toEqual(inputData);
    for (const data of outputData) {
      expect(typeof data.encoding === `string`).toBeTruthy();
    }
  });

  it(`the array passed to constructor is the same as the array returned by toArray method.`, async () => {
    const inputData = [Buffer.from([1]), Buffer.from([2]), Buffer.from([3])];
    const outputData: Array<Buffer> = [];

    const toArrayStream = new ToArrayStream({ target: outputData });
    await pipeline(Readable.from(inputData), toArrayStream);

    expect(outputData).toBe(toArrayStream.toArray());
  });
});
