const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'assets');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy primary assets
const assetsToCopy = [
  { src: 'asset/SAVE_20240710_224009.jpg.jpeg', dest: 'campus-main.jpg' },
  { src: 'asset/SAVE_20240710_224039.jpg.jpeg', dest: 'campus-gate.jpg' },
  { src: 'asset/ChatGPT Image Nov 13, 2026, 09_57_28 AM.png', dest: 'receipt-template.png' },
  { src: 'asset/Dalail Family ERP Showcase.png', dest: 'erp-showcase.png' }
];

assetsToCopy.forEach(item => {
  const srcPath = path.join(__dirname, '..', item.src);
  const destPath = path.join(targetDir, item.dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${item.src} -> ${item.dest}`);
  }
});

