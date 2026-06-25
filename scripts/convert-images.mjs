#!/usr/bin/env node
/**
 * Convert PNG/SVG images to WebP format and update markdown references.
 * Usage: node scripts/convert-images.mjs [--quality=80] [--dry-run] [--refs-only] [--no-refs]
 */

import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

const SOURCE_DIRS = [
  'docs',
  'docs-cli',
  'docs-csc',
  'docs-deployment',
  'i18n/zh/docusaurus-plugin-content-docs/current',
  'i18n/zh/docusaurus-plugin-content-docs-cli/current',
  'i18n/zh/docusaurus-plugin-content-docs-csc/current',
  'i18n/zh/docusaurus-plugin-content-docs-deployment/current',
];

const EXCLUDE_DIRS = ['node_modules', '.docusaurus', 'build'];

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { quality: 80, dryRun: false, verbose: false, refsOnly: false, noRefs: false, verify: false };
  for (const arg of args) {
    if (arg === '--dry-run' || arg === '-c') opts.dryRun = true;
    else if (arg === '--verbose' || arg === '-v') opts.verbose = true;
    else if (arg === '--refs-only') opts.refsOnly = true;
    else if (arg === '--no-refs') opts.noRefs = true;
    else if (arg === '--verify') opts.verify = true;
    else if (arg.startsWith('--quality=')) opts.quality = parseInt(arg.split('=')[1], 10);
    else if (arg === '-q' || arg === '--quality') {
      // next arg is value, handled simply via parse
    }
  }
  return opts;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function findImageFiles(rootDir, extensions = ['png', 'svg']) {
  const pattern = `**/*.{${extensions.join(',')}}`;
  const files = await glob(pattern, {
    cwd: rootDir,
    ignore: EXCLUDE_DIRS.map(d => `**/${d}/**`),
    nodir: true,
  });
  return files.map(f => path.join(rootDir, f));
}

async function convertImage(inputPath, outputPath, quality) {
  const inputStat = fs.statSync(inputPath);
  await sharp(inputPath).webp({ quality }).toFile(outputPath);
  const outputStat = fs.statSync(outputPath);
  return {
    inputPath,
    inputSize: inputStat.size,
    outputSize: outputStat.size,
  };
}

async function convertAllImages(opts) {
  const allFiles = [];
  for (const dir of SOURCE_DIRS) {
    if (!fs.existsSync(dir)) {
      console.warn(`  [skip] directory not found: ${dir}`);
      continue;
    }
    const files = await findImageFiles(dir);
    allFiles.push(...files);
  }

  console.log(`\nFound ${allFiles.length} PNG/SVG files across ${SOURCE_DIRS.length} directories\n`);

  const stats = { converted: 0, skipped: 0, errors: 0, totalInputSize: 0, totalOutputSize: 0 };

  for (const inputPath of allFiles) {
    const ext = path.extname(inputPath).toLowerCase();
    const outputPath = inputPath.replace(new RegExp(`${ext}$`), '.webp');

    // Incremental: skip if webp exists and is newer
    if (fs.existsSync(outputPath)) {
      const srcMtime = fs.statSync(inputPath).mtime;
      const outMtime = fs.statSync(outputPath).mtime;
      if (outMtime > srcMtime) {
        stats.skipped++;
        continue;
      }
    }

    if (opts.dryRun) {
      const inputSize = fs.statSync(inputPath).size;
      console.log(`  [dry-run] ${inputPath}  (${formatBytes(inputSize)})`);
      stats.totalInputSize += inputSize;
      stats.converted++;
      continue;
    }

    try {
      const result = await convertImage(inputPath, outputPath, opts.quality);
      stats.totalInputSize += result.inputSize;
      stats.totalOutputSize += result.outputSize;
      stats.converted++;
      if (opts.verbose) {
        const saved = ((1 - result.outputSize / result.inputSize) * 100).toFixed(0);
        console.log(`  ${inputPath}  ${formatBytes(result.inputSize)} → ${formatBytes(result.outputSize)}  (-${saved}%)`);
      }
    } catch (err) {
      stats.errors++;
      console.error(`  [error] ${inputPath}: ${err.message}`);
    }
  }

  return stats;
}

// Regex: match ![...](path.png) or ![...](path.svg), excluding external URLs
const IMAGE_REF_RE = /(!\[.*?\])\((?!https?:\/\/)(.+?)\.(png|svg)\)/g;
const WEBP_REF_RE = /(!\[.*?\])\((?!https?:\/\/)(.+?)\.(webp)\)/g;

async function updateMarkdownReferences(opts) {
  const mdFiles = [];
  for (const dir of SOURCE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = await glob('**/*.{md,mdx}', {
      cwd: dir,
      ignore: EXCLUDE_DIRS.map(d => `**/${d}/**`),
      nodir: true,
    });
    mdFiles.push(...files.map(f => path.join(dir, f)));
  }

  console.log(`\nScanning ${mdFiles.length} markdown files for image references...\n`);

  const stats = { filesModified: 0, refsUpdated: 0 };

  for (const filePath of mdFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let fileChanged = false;
    const updatedLines = [];

    for (const line of lines) {
      // Skip MDX-commented lines
      if (line.includes('{/*') || line.includes('*/}')) {
        updatedLines.push(line);
        continue;
      }

      const matches = line.match(IMAGE_REF_RE);
      if (matches) {
        fileChanged = true;
        stats.refsUpdated += matches.length;
        if (opts.verbose) {
          for (const m of matches) {
            console.log(`  ${filePath}: ${m.trim()}`);
          }
        }
      }

      const updated = line.replace(IMAGE_REF_RE, '$1($2.webp)');
      updatedLines.push(updated);
    }

    if (fileChanged) {
      stats.filesModified++;
      if (!opts.dryRun) {
        fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf8');
      }
    }
  }

  return stats;
}

async function verifyConversion() {
  const issues = [];

  // Collect all .webp files on disk
  const webpFiles = new Set();
  for (const dir of SOURCE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = await glob('**/*.webp', { cwd: dir, nodir: true });
    for (const f of files) webpFiles.add(path.join(dir, f));
  }

  // Collect all webp references from markdown
  const refsTo = new Map(); // path → [file:line]
  const stalePngRefs = []; // .png refs that have .webp available
  for (const dir of SOURCE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const mdFiles = await glob('**/*.{md,mdx}', { cwd: dir, nodir: true });
    for (const f of mdFiles) {
      const filePath = path.join(dir, f);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('{/*') || line.includes('*/}')) continue;

        // Check webp refs (resolve relative to the markdown file's directory)
        for (const m of line.matchAll(WEBP_REF_RE)) {
          const refPath = path.join(path.dirname(filePath), m[2] + '.webp');
          if (!refsTo.has(refPath)) refsTo.set(refPath, []);
          refsTo.get(refPath).push(`${filePath}:${i + 1}`);
        }

        // Check stale png/svg refs — does a .webp counterpart exist?
        for (const m of line.matchAll(IMAGE_REF_RE)) {
          const webpPath = path.join(path.dirname(filePath), m[2] + '.webp');
          if (webpFiles.has(webpPath)) {
            stalePngRefs.push(`${filePath}:${i + 1}  ${m[0].trim()}`);
          }
        }
      }
    }
  }

  // 1. Orphan .webp: no source .png/.svg
  for (const wp of webpFiles) {
    const stem = wp.replace(/\.webp$/, '');
    if (!fs.existsSync(stem + '.png') && !fs.existsSync(stem + '.svg')) {
      issues.push({ type: 'orphan', msg: `Orphan .webp (no source): ${wp}` });
    }
  }

  // 2. Unreferenced .webp: exists but no markdown points to it
  for (const wp of webpFiles) {
    if (!refsTo.has(wp)) {
      issues.push({ type: 'unreferenced', msg: `Unreferenced .webp: ${wp}` });
    }
  }

  // 3. Missing .webp: referenced but doesn't exist
  for (const [refPath, locations] of refsTo) {
    if (!webpFiles.has(refPath)) {
      for (const loc of locations) {
        issues.push({ type: 'missing', msg: `Missing .webp: ${refPath}\n    referenced at ${loc}` });
      }
    }
  }

  // 4. Stale .png/.svg refs that have .webp available
  for (const s of stalePngRefs) {
    issues.push({ type: 'stale', msg: `Stale .png/.svg ref (has .webp): ${s}` });
  }

  // Report
  console.log(`\n=== Verification Report ===`);
  const byType = {};
  for (const issue of issues) {
    if (!byType[issue.type]) byType[issue.type] = 0;
    byType[issue.type]++;
  }

  if (issues.length === 0) {
    console.log('  All checks passed — conversion and references are consistent.\n');
  } else {
    console.log(`  Found ${issues.length} issue(s):`);
    for (const [type, count] of Object.entries(byType)) {
      const labels = { orphan: 'Orphan .webp (no source)', unreferenced: 'Unreferenced .webp', missing: 'Missing .webp', stale: 'Stale .png/.svg ref' };
      console.log(`    ${labels[type] || type}: ${count}`);
    }
    console.log('');
    for (const issue of issues) {
      console.log(`  [${issue.type}] ${issue.msg}`);
    }
    console.log('');
  }

  return issues;
}

async function main() {
  const opts = parseArgs();

  console.log('=== CoStrict Image Converter ===');
  console.log(`Quality: ${opts.quality}`);
  const modes = [];
  if (opts.verify) modes.push('verify');
  else if (opts.refsOnly) modes.push('refs-only');
  else if (opts.noRefs) modes.push('convert-only');
  else modes.push('convert + refs');
  if (opts.dryRun) modes.push('(dry-run)');
  console.log(`Mode: ${modes.join(' ')}`);

  // Verify mode: cross-check only
  if (opts.verify) {
    const issues = await verifyConversion();
    if (issues.length > 0) process.exit(1);
    return;
  }

  // Step 1: Image conversion
  if (!opts.refsOnly) {
    const imgStats = await convertAllImages(opts);

    console.log(`\n--- Conversion Summary ---`);
    console.log(`  Converted: ${imgStats.converted}`);
    console.log(`  Skipped:   ${imgStats.skipped}`);
    console.log(`  Errors:    ${imgStats.errors}`);
    if (imgStats.totalInputSize > 0 && imgStats.totalOutputSize > 0) {
      const saved = ((1 - imgStats.totalOutputSize / imgStats.totalInputSize) * 100).toFixed(0);
      console.log(`  Input:     ${formatBytes(imgStats.totalInputSize)}`);
      console.log(`  Output:    ${formatBytes(imgStats.totalOutputSize)}`);
      console.log(`  Saved:     ${formatBytes(imgStats.totalInputSize - imgStats.totalOutputSize)}  (-${saved}%)`);
    }
  }

  // Step 2: Markdown reference update
  if (!opts.noRefs) {
    const refStats = await updateMarkdownReferences(opts);

    console.log(`\n--- Reference Update Summary ---`);
    console.log(`  Files modified: ${refStats.filesModified}`);
    console.log(`  Refs updated:   ${refStats.refsUpdated}`);
    if (opts.dryRun) console.log('  (dry-run: no files were written)');
  }

  // Step 3: Verify after conversion
  if (!opts.dryRun) {
    await verifyConversion();
  }

  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
