import { delay } from "../util.js";
import { syncInputs } from "./sync-inputs.js";

export async function* asyncInputs() {
  for (const n of syncInputs()) {
    await delay(50);
    yield n;
    await delay(50);
  }
}
