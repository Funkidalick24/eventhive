/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const projectRoot = process.cwd();
const pnpmStoreDir = path.join(projectRoot, "node_modules", ".pnpm");
const destClientDir = path.join(projectRoot, "node_modules", ".prisma", "client");

if (!exists(pnpmStoreDir)) {
  console.error(`Missing ${pnpmStoreDir}. Are you using pnpm with node_modules?`);
  process.exit(1);
}

const candidates = fs
  .readdirSync(pnpmStoreDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith("@prisma+client@"))
  .map((entry) =>
    path.join(pnpmStoreDir, entry.name, "node_modules", ".prisma", "client"),
  )
  .filter((p) => exists(path.join(p, "index.js")));

if (candidates.length === 0) {
  console.error("Could not find a generated Prisma client under pnpm store.");
  console.error("Run `pnpm exec prisma generate` first.");
  process.exit(1);
}

const srcClientDir = candidates[0];

fs.rmSync(destClientDir, { recursive: true, force: true });
copyDir(srcClientDir, destClientDir);

console.log(`Synced Prisma client:\n- from: ${srcClientDir}\n- to:   ${destClientDir}`);

