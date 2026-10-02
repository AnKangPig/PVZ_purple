const fs = require('fs');
const path = require('path');

const diy = path.join(__dirname, '../_android');
const target = path.join(__dirname, '../android');

function walk(srcDir, dstDir) {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const dstPath = path.join(dstDir, entry.name);

    if (entry.isDirectory()) {
      if (!fs.existsSync(dstPath)) fs.mkdirSync(dstPath, { recursive: true });
      walk(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
      console.log('covered:', path.relative(target, dstPath));
    }
  }
}

walk(diy, target);
console.log('_android applied.');