const sharp = require('sharp');

async function cropSeal() {
  const meta = await sharp('public/assets/letterhead_full.jpg').metadata();
  console.log('Letterhead dimensions:', meta.width, meta.height);
  // Bottom left circular stamp
  const left = Math.floor(meta.width * 0.16);
  const top = Math.floor(meta.height * 0.69);
  const size = Math.floor(meta.width * 0.22);

  await sharp('public/assets/letterhead_full.jpg')
    .extract({ left, top, width: size, height: size })
    .toFile('public/assets/office-seal.png');
  console.log('Extracted office-seal.png successfully!');
}

cropSeal().catch(console.error);

