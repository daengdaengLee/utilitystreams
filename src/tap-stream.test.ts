import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { TapStream } from "./tap-stream";
import { asyncInputs } from "./test-util/async-inputs";
import { syncInputs } from "./test-util/sync-inputs";
import { ToArrayStream } from "./to-array-stream";
import { delay } from "./util";

const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const syncConsumerFactory =
  (outputs: Array<number>, error?: Set<number>) => (value: number) => {
    if (error?.has(value)) {
      throw new Error(`${value} is rejected.`);
    }
    outputs.push(value);
  };
const asyncConsumerFactory =
  (outputs: Array<number>, error?: Set<number>) => async (value: number) => {
    await delay(10);
    if (error?.has(value)) {
      throw new Error(`${value} is rejected.`);
    }
    outputs.push(value);
  };
const testCases = [
  {
    name: `sync data + sync consumer`,
    inputs: syncInputs,
    consumerFactory: syncConsumerFactory,
  },
  {
    name: `sync data + async consumer`,
    inputs: syncInputs,
    consumerFactory: asyncConsumerFactory,
  },
  {
    name: `async data + sync consumer`,
    inputs: asyncInputs,
    consumerFactory: syncConsumerFactory,
  },
  {
    name: `async data + async consumer`,
    inputs: asyncInputs,
    consumerFactory: asyncConsumerFactory,
  },
];

describe(`TapStream Test`, () => {
  describe(`call consumer for each input.`, () => {
    for (const { name, inputs, consumerFactory } of testCases) {
      it(name, async () => {
        const outputs: Array<number> = [];
        const consumer = consumerFactory(outputs);
        await pipeline(
          Readable.from(inputs()),
          new TapStream({ f: consumer }, { objectMode: true }),
          new ToArrayStream({}, { objectMode: true }),
        );
        expect(outputs).toEqual(expected);
      });
    }
  });

  describe(`not propagate error`, () => {
    const error = new Set<number>([2, 4, 6, 8, 10]);
    const expected = [1, 3, 5, 7, 9];
    for (const { name, inputs, consumerFactory } of testCases) {
      it(name, async () => {
        const outputs: Array<number> = [];
        const consumer = consumerFactory(outputs, error);
        await pipeline(
          Readable.from(inputs()),
          new TapStream({ f: consumer }, { objectMode: true }),
          new ToArrayStream({}, { objectMode: true }),
        );
        expect(outputs).toEqual(expected);
      });
    }
  });
});
