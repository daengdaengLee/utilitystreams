import { asyncInputs } from "./async-inputs.js";
import { syncInputs } from "./sync-inputs.js";

export const n = 4;
export const expected = [1, 2, 3, 4];
export const testCases = [
  { name: `sync data`, inputs: syncInputs },
  { name: `async data`, inputs: asyncInputs },
];
