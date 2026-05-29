import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm } from "node:fs/promises";

// Plugins (e.g. 'esbuild-plugin-pino') may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  const rootApiDir = path.resolve(artifactDir, "../../api");
  await rm(rootApiDir, { recursive: true, force: true });

  const externals = [
    "*.node",
    "sharp",
    "better-sqlite3",
    "sqlite3",
    "canvas",
    "bcrypt",
    "argon2",
    "fsevents",
    "re2",
    "farmhash",
    "xxhash-addon",
    "bufferutil",
    "utf-8-validate",
    "ssh2",
    "cpu-features",
    "dtrace-provider",
    "isolated-vm",
    "lightningcss",
    "pg-native",
    "oracledb",
    "mongodb-client-encryption",
    "nodemailer",
    "handlebars",
    "knex",
    "typeorm",
    "protobufjs",
    "onnxruntime-node",
    "@tensorflow/*",
    "@prisma/client",
    "@mikro-orm/*",
    "@grpc/*",
    "@swc/*",
    "@aws-sdk/*",
    "@azure/*",
    "@opentelemetry/*",
    "@google-cloud/*",
    "@google/*",
    "googleapis",
    "firebase-admin",
    "@parcel/watcher",
    "@sentry/profiling-node",
    "@tree-sitter/*",
    "aws-sdk",
    "classic-level",
    "dd-trace",
    "ffi-napi",
    "grpc",
    "hiredis",
    "kerberos",
    "leveldown",
    "miniflare",
    "mysql2",
    "newrelic",
    "odbc",
    "piscina",
    "realm",
    "ref-napi",
    "rocksdb",
    "sass-embedded",
    "sequelize",
    "serialport",
    "snappy",
    "tinypool",
    "usb",
    "workerd",
    "wrangler",
    "zeromq",
    "zeromq-prebuilt",
    "playwright",
    "puppeteer",
    "puppeteer-core",
    "electron",
    "express",
  ];

  const banner = {
    js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
  };

  const commonConfig = {
    platform: "node",
    bundle: true,
    format: "esm",
    logLevel: "info",
    external: externals,
    sourcemap: "linked",
    banner,
  };

  // Build standalone dev/prod server (with pino workers bundled)
  await esbuild({
    ...commonConfig,
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    plugins: [esbuildPluginPino({ transports: ["pino-pretty"] })],
  });

  // Build Vercel Serverless Function handler
  // Bundle everything (including pino and pg) so the handler is fully self-contained.
  // Only express is kept external so Vercel's static analyzer can detect the Express handler.
  // NO esbuildPluginPino here — pino is bundled inline and writes to stdout directly
  // without spawning worker threads (workers only needed when transport is configured).
  await esbuild({
    ...commonConfig,
    entryPoints: { index: path.resolve(artifactDir, "src/vercel.ts") },
    outdir: rootApiDir,
    outExtension: { ".js": ".mjs" },
    plugins: [], // No pino plugin — no worker files generated
    external: externals, // express is still external for Vercel detection
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
