// Yla と Valikko の個別ビルドが出す .d.ts を、それぞれ1ファイルにまとめる。
// 依存している型を展開して yla.d.ts と valikko.d.ts にし、ばらけた .d.ts は消す。
// yla-bundle.d.ts は Vite が先にまとめるので、ここでは触らない。

import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { mkdirSync, readdirSync, renameSync, rmSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const staged = resolve(dist, '.dts');

const entries = [
  ['dist/Yla.d.ts', 'yla.d.ts'],
  ['dist/Valikko.d.ts', 'valikko.d.ts'],
];

const keep = new Set(['yla-bundle.d.ts', 'yla.d.ts', 'valikko.d.ts']);

function bundle(entry, outName) {
  const outFile = resolve(staged, outName);
  mkdirSync(staged, { recursive: true });
  const extractorConfig = ExtractorConfig.prepare({
    configObject: {
      projectFolder: root,
      mainEntryPointFilePath: resolve(root, entry),
      compiler: {
        tsconfigFilePath: resolve(root, 'tsconfig.json'),
      },
      dtsRollup: {
        enabled: true,
        untrimmedFilePath: outFile,
      },
      messages: {
        compilerMessageReporting: {
          default: { logLevel: 'none' },
        },
        extractorMessageReporting: {
          default: { logLevel: 'none' },
        },
      },
    },
    configObjectFullPath: resolve(root, 'api-extractor.json'),
    packageJsonFullPath: resolve(root, 'package.json'),
  });
  const result = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: false,
    showDiagnostics: false,
  });
  if (!result.succeeded) {
    throw new Error(`Failed to bundle ${entry}`);
  }
}

for (const [entry, outName] of entries) {
  bundle(entry, outName);
}

for (const name of readdirSync(dist)) {
  if (name.endsWith('.d.ts') && !keep.has(name)) {
    rmSync(resolve(dist, name));
  }
}

for (const [, outName] of entries) {
  const from = resolve(staged, outName);
  const to = resolve(dist, outName);
  rmSync(to, { force: true });
  renameSync(from, to);
}

rmSync(staged, { recursive: true, force: true });
