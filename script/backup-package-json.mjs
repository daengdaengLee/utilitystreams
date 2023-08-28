import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const packageJsonPath = path.resolve(__dirname, `../package.json`);
const packageJsonBackupPath = path.resolve(__dirname, `../package.json.backup`);
fs.copyFileSync(
  packageJsonPath,
  packageJsonBackupPath,
  fs.constants.COPYFILE_EXCL,
);
