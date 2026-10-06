const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.join(__dirname, '..', 'assets', 'image');
const OUT_FILE = path.join(IMAGE_DIR, 'image.json');

function generate() {
  const filelist = fs.readdirSync(IMAGE_DIR);
  const imglist = filelist.filter(n => n.endsWith('.png')).map(n => n.slice(0, -4));

  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify({items:imglist}, null, '\t'),
    'utf8'
  );

  console.log(`[image] ${imglist.length} images written to image.json`);
}

generate();