const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// ---------------------------------------------------------------------------
// Patch 1: node-abi (Win7 + Node 13 + Electron 22 ABI detection)
// ---------------------------------------------------------------------------
function patchNodeAbi() {
  const nested = path.join(root, 'node_modules/electron-rebuild/node_modules/node-abi');
  const source = path.join(root, 'node_modules/node-abi');

  // 情况 A：npm 8+ 的 overrides 已经生效，nested 不存在 → 无事可做
  if (!fs.existsSync(nested) || !fs.existsSync(source)) return;

  // 情况 B：nested 已能识别 Electron 22 → 无事可做
  try {
    if (require(nested).getAbi('22.3.27', 'electron')) {
      console.log('[overrides] node-abi already patched, skipping.');
      return;
    }
  } catch {}

  // 情况 C：需要替换
  const rmrf = (t) => {
    if (!fs.existsSync(t)) return;
    fs.readdirSync(t).forEach((f) => {
      const p = path.join(t, f);
      fs.lstatSync(p).isDirectory() ? rmrf(p) : fs.unlinkSync(p);
    });
    fs.rmdirSync(t);
  };
  const copy = (s, d) => {
    fs.mkdirSync(d, { recursive: true });
    fs.readdirSync(s).forEach((f) => {
      const a = path.join(s, f), b = path.join(d, f);
      fs.lstatSync(a).isDirectory() ? copy(a, b) : fs.copyFileSync(a, b);
    });
  };

  rmrf(nested);
  copy(source, nested);
  console.log('[overrides] node-abi patched for Electron 22.');
}

// ---------------------------------------------------------------------------
// Patch 2: Forge system check (drop git hard requirement)
// ---------------------------------------------------------------------------
function patchForgeGitCheck() {
  const target = path.join(
    root, 'node_modules', '@electron-forge', 'cli', 'dist', 'util', 'check-system.js'
  );

  if (!fs.existsSync(target)) return;

  let src = fs.readFileSync(target, 'utf8');

  if (src.includes('/* patched: skip git */')) {
    console.log('[overrides] Forge check-system already patched, skipping.');
    return;
  }

  if (!src.includes("'git --version'")) {
    console.warn('[overrides] git --version not found, skipping Forge patch.');
    return;
  }

  src = src.replace(
    /\(0,\s*_child_process\.exec\)\('git --version'/,
    "(0, _child_process.exec)(/* patched: skip git */ 'node --version'"
  );

  fs.writeFileSync(target, src, 'utf8');
  console.log('[overrides] Forge check-system patched (git check skipped).');
}

// ---------------------------------------------------------------------------
// Run all patches
// ---------------------------------------------------------------------------
patchNodeAbi();
patchForgeGitCheck();