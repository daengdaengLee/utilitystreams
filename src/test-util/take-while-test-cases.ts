import { delay } from "../util.js";
import { asyncInputs } from "./async-inputs.js";
import { syncInputs } from "./sync-inputs.js";

const syncPredicate = (n: number): boolean => {
  return n < 5;
};
const asyncPredicate = async (n: number): Promise<boolean> => {
  await delay(100);
  return syncPredicate(n);
};
export const expected: Array<number> = [1, 2, 3, 4];
export const testCases = [
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
