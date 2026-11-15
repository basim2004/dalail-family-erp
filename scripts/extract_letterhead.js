const fs = require('fs');
const sharp = require('sharp');

const buf = fs.readFileSync('public/documents/fieldwork/Dalail Letter-english_172454.pdf');
let pos = 0;
while (pos < buf.length) {
  const soi = buf.indexOf(Buffer.from([0xFF, 0xD8, 0xFF]), pos);
  if (soi === -1) break;
  const eoi = buf.indexOf(Buffer.from([0xFF, 0xD9]), soi + 3);
  if (eoi === -1) break;
  const jpegBuf = buf.slice(soi, eoi + 2);
  if (jpegBuf.length > 50000) {
    fs.writeFileSync('public/assets/letterhead_full.jpg', jpegBuf);
    console.log('Saved letterhead_full.jpg');
    break;
  }
  pos = eoi + 2;
}

