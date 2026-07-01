#!/usr/bin/env node
/**
 * Convert PNG/SVG images to WebP format and update markdown references.
 * Usage: node scripts/convert-images.mjs [--quality=80] [--dry-run] [--refs-only] [--no-refs] [--clean] [--verify] [--prune-unused]
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
  'docs-ai-knowledge',
  'i18n/zh/docusaurus-plugin-content-docs/current',
  'i18n/zh/docusaurus-plugin-content-docs-cli/current',
  'i18n/zh/docusaurus-plugin-content-docs-csc/current',
  'i18n/zh/docusaurus-plugin-content-docs-deployment/current',
  'i18n/zh/docusaurus-plugin-content-docs-ai-knowledge',
];

const EXCLUDE_DIRS = ['node_modules', '.docusaurus', 'build'];
const AUDIT_DIRS = [...SOURCE_DIRS, 'i18n', 'static', 'img', 'src'];
const AUDIT_IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'avif'];
const AUDIT_TEXT_PATTERN = '**/*.{md,mdx,ts,tsx,js,jsx,mjs,cjs,css,scss,json,yml,yaml,html,xml,txt}';
const IMAGE_TOKEN_RE = /((?:@site\/|(?:\.\.\/|\.\/|\/)?)[^"'()\s<>{}\[\]]+?\.(?:webp|png|jpe?g|gif|svg|ico|avif)(?:[?#][^"'()\s<>{}\[\]]*)?)/gi;

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { quality: 80, dryRun: false, verbose: false, refsOnly: false, noRefs: false, verify: false, clean: false, pruneUnused: false };
  for (const arg of args) {
    if (arg === '--dry-run' || arg === '-c') opts.dryRun = true;
    else if (arg === '--verbose' || arg === '-v') opts.verbose = true;
    else if (arg === '--refs-only') opts.refsOnly = true;
    else if (arg === '--no-refs') opts.noRefs = true;
    else if (arg === '--verify') opts.verify = true;
    else if (arg === '--prune-unused') opts.pruneUnused = true;
    else if (arg === '--clean') opts.clean = true;
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

  const stats = { converted: 0, skipped: 0, errors: 0, deleted: 0, totalInputSize: 0, totalOutputSize: 0 };

  for (const inputPath of allFiles) {
    const ext = path.extname(inputPath).toLowerCase();
    const outputPath = inputPath.replace(new RegExp(`${ext}$`), '.webp');

    // Incremental: skip if webp exists and is newer
    if (fs.existsSync(outputPath)) {
      const srcMtime = fs.statSync(inputPath).mtime;
      const outMtime = fs.statSync(outputPath).mtime;
      if (outMtime > srcMtime) {
        stats.skipped++;
        // Delete source file even when skipping re-conversion
        if (opts.clean) {
          try {
            fs.unlinkSync(inputPath);
            stats.deleted++;
            if (opts.verbose) console.log(`  [deleted] ${inputPath}`);
          } catch (err) {
            console.error(`  [delete error] ${inputPath}: ${err.message}`);
          }
        }
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
      // Delete source file after successful conversion
      if (opts.clean) {
        try {
          fs.unlinkSync(inputPath);
          stats.deleted++;
          if (opts.verbose) console.log(`  [deleted] ${inputPath}`);
        } catch (err) {
          console.error(`  [delete error] ${inputPath}: ${err.message}`);
        }
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

function getImageCandidates(token, filePath) {
  const cleanToken = token.replace(/[),.;:]+$/, '').split(/[?#]/)[0].replace(/\\/g, '/');
  if (/^(?:https?:|data:|mailto:)/i.test(cleanToken) || cleanToken.startsWith('//')) return [];

  let decodedToken = cleanToken;
  try {
    decodedToken = decodeURIComponent(cleanToken);
  } catch {
    // Keep the original token when it is not valid URI encoding.
  }

  if (decodedToken.startsWith('@site/')) {
    return [path.resolve(decodedToken.slice(6))];
  }
  if (decodedToken.startsWith('/')) {
    return [path.resolve('static', decodedToken.slice(1))];
  }
  return [
    path.resolve(path.dirname(filePath), decodedToken),
    path.resolve('static', decodedToken),
    path.resolve(decodedToken),
  ];
}

function resolveImageReference(token, filePath, imageFiles) {
  return getImageCandidates(token, filePath).find(candidate => imageFiles.has(candidate));
}

async function verifyConversion({ pruneUnused = false, dryRun = false } = {}) {
  const issues = [];
  const imageFiles = new Set();

  for (const dir of AUDIT_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = await findImageFiles(dir, AUDIT_IMAGE_EXTENSIONS);
    for (const file of files) imageFiles.add(path.resolve(file));
  }

  const webpFiles = new Set(
    [...imageFiles].filter(file => path.extname(file).toLowerCase() === '.webp'),
  );
  const referencedImages = new Set();
  const refsTo = new Map();
  const stalePngRefs = [];
  const textFiles = await glob(AUDIT_TEXT_PATTERN, {
    cwd: '.',
    ignore: [...EXCLUDE_DIRS, '.git'].map(dir => `${dir}/**`),
    nodir: true,
  });

  for (const relativeFile of textFiles) {
    const filePath = path.resolve(relativeFile);
    const content = fs.readFileSync(filePath, 'utf8');

    for (const match of content.matchAll(IMAGE_TOKEN_RE)) {
      const resolved = resolveImageReference(match[1], filePath, imageFiles);
      if (resolved) referencedImages.add(resolved);
    }

    if (!/\.mdx?$/.test(relativeFile)) continue;
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('{/*') || line.includes('*/}')) continue;

      for (const match of line.matchAll(WEBP_REF_RE)) {
        const token = `${match[2]}.webp`;
        const candidates = getImageCandidates(token, filePath);
        const resolved = candidates.find(candidate => webpFiles.has(candidate));
        const refPath = resolved || candidates[0];
        if (!refPath) continue;
        if (!refsTo.has(refPath)) refsTo.set(refPath, []);
        refsTo.get(refPath).push(`${relativeFile}:${i + 1}`);
      }

      for (const match of line.matchAll(IMAGE_REF_RE)) {
        const webpPath = getImageCandidates(`${match[2]}.webp`, filePath)
          .find(candidate => webpFiles.has(candidate));
        if (webpPath) {
          stalePngRefs.push(`${relativeFile}:${i + 1}  ${match[0].trim()}`);
        }
      }
    }
  }

  let prunedFiles = 0;
  let prunedBytes = 0;
  for (const imagePath of imageFiles) {
    if (referencedImages.has(imagePath)) continue;
    const displayPath = path.relative('.', imagePath);
    if (pruneUnused) {
      try {
        prunedBytes += fs.statSync(imagePath).size;
        prunedFiles++;
        if (dryRun) {
          console.log(`  [would prune] ${displayPath}`);
        } else {
          fs.unlinkSync(imagePath);
          console.log(`  [pruned] ${displayPath}`);
        }
      } catch (error) {
        issues.push({ type: 'delete-error', msg: `Failed to delete ${displayPath}: ${error.message}` });
      }
    } else {
      issues.push({ type: 'unreferenced', msg: `Unreferenced image: ${displayPath}` });
    }
  }

  for (const [refPath, locations] of refsTo) {
    if (webpFiles.has(refPath)) continue;
    for (const location of locations) {
      issues.push({
        type: 'missing',
        msg: `Missing .webp: ${path.relative('.', refPath)}\n    referenced at ${location}`,
      });
    }
  }

  for (const staleRef of stalePngRefs) {
    issues.push({ type: 'stale', msg: `Stale .png/.svg ref (has .webp): ${staleRef}` });
  }

  console.log('\n=== Verification Report ===');
  console.log(`  Scanned ${imageFiles.size} images and ${textFiles.length} text files.`);
  if (pruneUnused) {
    const action = dryRun ? 'Would prune' : 'Pruned';
    console.log(`  ${action} ${prunedFiles} unreferenced image(s), freeing ${formatBytes(prunedBytes)}.`);
  }

  const byType = {};
  for (const issue of issues) {
    if (!byType[issue.type]) byType[issue.type] = 0;
    byType[issue.type]++;
  }

  if (issues.length === 0) {
    console.log('  All checks passed — image files and references are consistent.\n');
  } else {
    console.log(`  Found ${issues.length} issue(s):`);
    for (const [type, count] of Object.entries(byType)) {
      const labels = {
        unreferenced: 'Unreferenced image',
        missing: 'Missing .webp',
        stale: 'Stale .png/.svg ref',
        'delete-error': 'Delete error',
      };
      console.log(`    ${labels[type] || type}: ${count}`);
    }
    console.log('');
    for (const issue of issues) console.log(`  [${issue.type}] ${issue.msg}`);
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
  else if (opts.pruneUnused) modes.push('prune-unused');
  else if (opts.refsOnly) modes.push('refs-only');
  else if (opts.noRefs) modes.push('convert-only');
  else modes.push('convert + refs');
  if (opts.clean) modes.push('(clean)');
  if (opts.dryRun) modes.push('(dry-run)');
  console.log(`Mode: ${modes.join(' ')}`);

  // Audit-only modes do not convert or rewrite references.
  if (opts.verify || opts.pruneUnused) {
    const issues = await verifyConversion({
      pruneUnused: opts.pruneUnused,
      dryRun: opts.dryRun,
    });
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
    if (imgStats.deleted > 0) console.log(`  Deleted:   ${imgStats.deleted} (source files removed)`);
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
