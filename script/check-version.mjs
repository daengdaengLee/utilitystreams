import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const GITHUB_REF_PREFIX = `refs/tags/`;
const TAG_PREFIX = `v`;

(() => {
  const githubRef = process.argv[2] ?? null;
  if (githubRef == null) {
    throw new Error(`invalid arguments. no github ref.`);
  }
  if (!githubRef.startsWith(GITHUB_REF_PREFIX)) {
    throw new Error(
      `invalid arguments. use github ref with "${GITHUB_REF_PREFIX}" prefix.`,
    );
  }

  const packageJsonPath = path.resolve(__dirname, `../package.json`);
  const packageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, { encoding: `utf-8` }),
  );
  const version = packageJson.version;

  if (githubRef !== `${GITHUB_REF_PREFIX}${TAG_PREFIX}${version}`) {
    throw new Error(
      `invalid version. github ref: "${githubRef}" but version: "${version}"`,
    );
  }
})();
