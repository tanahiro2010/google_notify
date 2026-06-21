import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const rawVersion = process.env.RELEASE_VERSION || "";
const version = rawVersion.replace(/^v/, "");

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  console.error("RELEASE_VERSION must be a semver tag such as v1.2.3 or 1.2.3");
  process.exit(1);
}

const root = process.cwd();

updatePackageJson(join(root, "package.json"));
updatePackageJson(join(root, "src-tauri", "tauri.conf.json"));
updateCargoToml(join(root, "src-tauri", "Cargo.toml"));
updateCargoLock(join(root, "src-tauri", "Cargo.lock"));

console.log(`Synced release version to ${version}`);

function updatePackageJson(path) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  json.version = version;
  writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
}

function updateCargoToml(path) {
  const toml = readFileSync(path, "utf8");
  const next = toml.replace(
    /^(\[package\][\s\S]*?^version\s*=\s*)".*?"/m,
    `$1"${version}"`
  );

  if (next === toml) {
    console.error(`Could not find [package] version in ${path}`);
    process.exit(1);
  }

  writeFileSync(path, next);
}

function updateCargoLock(path) {
  if (!existsSync(path)) return;

  const lock = readFileSync(path, "utf8");
  const next = lock.replace(
    /^(\[\[package\]\]\nname = "google-notify"\nversion = )".*?"/m,
    `$1"${version}"`
  );

  if (next !== lock) {
    writeFileSync(path, next);
  }
}
