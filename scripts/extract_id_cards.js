const fs = require('fs');
const path = require('path');

const buf = fs.readFileSync('asset/ID CARD  RECEIVER.pdf');
let pos = 0;
let imgCount = 0;

while (pos < buf.length) {
  const soi = buf.indexOf(Buffer.from([0xFF, 0xD8, 0xFF]), pos);
  if (soi === -1) break;
  const eoi = buf.indexOf(Buffer.from([0xFF, 0xD9]), soi + 3);
  if (eoi === -1) break;
  const jpegBuf = buf.slice(soi, eoi + 2);
  if (jpegBuf.length > 50000) {
    imgCount++;
    fs.writeFileSync(path.join('public', 'assets', `id_card_sample_${imgCount}.jpg`), jpegBuf);
    if (imgCount === 1) {
      fs.writeFileSync(path.join('public', 'assets', 'student-id-reference.jpg'), jpegBuf);
    }
  }
  pos = eoi + 2;
}
console.log(`Extracted ${imgCount} ID card photos to public/assets`);

