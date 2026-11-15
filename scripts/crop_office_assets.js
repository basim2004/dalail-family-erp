const sharp = require('sharp');
const path = require('path');

async function extract() {
  const meta = await sharp('public/assets/id_card_sample_1.jpg').metadata();
  console.log('ID card dimensions:', meta.width, meta.height);

  // The signature is located on the bottom right of the ID card
  // On 1000 x 1600 approx:
  const sigLeft = Math.floor(meta.width * 0.65);
  const sigTop = Math.floor(meta.height * 0.82);
  const sigWidth = Math.floor(meta.width * 0.32);
  const sigHeight = Math.floor(meta.height * 0.12);

  await sharp('public/assets/id_card_sample_1.jpg')
    .extract({ left: sigLeft, top: sigTop, width: sigWidth, height: sigHeight })
    .toFile('public/assets/office-signature.png');
  console.log('Extracted office-signature.png successfully!');
}

extract().catch(console.error);

