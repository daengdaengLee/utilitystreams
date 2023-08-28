import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const COMMON_JS = `commonjs`;
const MODULE = `module`;

const packageJsonType = process.argv.at(2) ?? null;
if (packageJsonType !== COMMON_JS && packageJsonType !== MODULE) {
  throw new Error(
    `invalid arguments. use one of "${COMMON_JS}" or "${MODULE}".`,
  );
}

const packageJsonPath = path.resolve(__dirname, `../package.json`);
const packageJson = JSON.parse(
  fs.readFileSync(packageJsonPath, { encoding: `utf-8` }),
);
packageJson.type = packageJsonType;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), {
  encoding: `utf-8`,
  flag: `w`,
});
