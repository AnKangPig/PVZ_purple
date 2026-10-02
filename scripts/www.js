const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dest = path.join(root, 'www');

// 清空 www（保留目录本身）
if (fs.existsSync(dest)) {
  fs.rmdirSync(dest, { recursive: true });
}
fs.mkdirSync(dest, { recursive: true });

// 需要复制的项目
const items = ['index.html', 'src', 'libs','assets'];

function copyRecursive(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dst, entry));
    }
  } else {
    fs.copyFileSync(src, dst);
  }
}

items.forEach(item => {
  const from = path.join(root, item);
  if (fs.existsSync(from)) {
    copyRecursive(from, path.join(dest, item));
    console.log('copied:', item);
  } else {
    console.warn('missing:', item);
  }
});

console.log('web assets ready in www/');