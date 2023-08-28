import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const packageJsonBackupPath = path.resolve(__dirname, `../package.json.backup`);
const packageJsonPath = path.resolve(__dirname, `../package.json`);
let packageJson = fs
  .readFileSync(packageJsonBackupPath, {
    encoding: `utf-8`,
  })
  .trim();
packageJson = `${packageJson}\n`;
fs.writeFileSync(packageJsonPath, packageJson, {
  encoding: `utf-8`,
  flag: `w`,
});
fs.rmSync(packageJsonBackupPath);
