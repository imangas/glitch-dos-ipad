// Minifies the published HTML and JS into dist/.
// Run with: npm run build
import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { minify as minifyHtml } from "html-minifier-terser";
import { minify as minifyJs } from "terser";

const DIST_DIR = "dist";
const HTML_FILES = ["index.html"];
const JS_FILES = ["js/main.js", "js/games-config.js", "sw.js"];
// Copied as they are. Anything not listed here is NOT published.
const STATIC_PATHS = ["manifest.json", "icon-192.png", "assets", "css/styles.css"];

const LICENSE_BANNER =
  "/*! SPDX-License-Identifier: GPL-2.0-or-later | Source: https://github.com/imangas/glitchlock-dos */";

const HTML_OPTIONS = {
  collapseWhitespace: true,
  removeComments: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true,
};

function getJsOptions(file) {
  return {
    // main.js is loaded as an ES module, so its top-level names can be mangled safely
    module: file.endsWith("main.js"),
    compress: {
      passes: 2,
      // Removes console.log calls (console.error and console.warn are kept).
      // Delete this line to keep the logs in production.
      pure_funcs: ["console.log"],
    },
    mangle: true,
    format: { preamble: LICENSE_BANNER },
  };
}

function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function minifyJsSource(source, file) {
  const { code } = await minifyJs(source, getJsOptions(file));
  return code;
}

async function processFile(file, transform) {
  const source = await readFile(file, "utf8");
  const output = await transform(source, file);

  const target = path.join(DIST_DIR, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, output);

  const before = formatSize(Buffer.byteLength(source));
  const after = formatSize(Buffer.byteLength(output));
  console.log(`${file}: ${before} -> ${after}`);
}

async function copyStaticPaths() {
  for (const staticPath of STATIC_PATHS) {
    // Fail loudly: publishing a site without its stylesheet or icons is worse than no deploy
    if (!existsSync(staticPath)) {
      throw new Error(`Static path not found: ${staticPath} (check STATIC_PATHS in scripts/build.js)`);
    }
    const target = path.join(DIST_DIR, staticPath);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(staticPath, target, { recursive: true });
  }
}

async function build() {
  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(DIST_DIR, { recursive: true });

  for (const file of HTML_FILES) {
    await processFile(file, (source) => minifyHtml(source, HTML_OPTIONS));
  }
  for (const file of JS_FILES) {
    await processFile(file, minifyJsSource);
  }
  await copyStaticPaths();

  console.log(`Build finished: ${DIST_DIR}/`);
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});