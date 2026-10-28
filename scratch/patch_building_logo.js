import sharp from 'sharp';

async function perfectBuilding01() {
  const b01Orig = 'public/images/walkthrough/01-building.orig.jpg';
  const logoNavy = 'public/brand/alverstone-medcity-logo.png';
  const crop01 = { left: 480, top: 290, width: 250, height: 80 };

  const { data: d1, info: i1 } = await sharp(b01Orig)
    .extract(crop01)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const patched1 = Buffer.from(d1);

  // The white panel region containing the old logo:
  // x: from 35 to 208
  // y: from yTop to yBot
  for (let x = 35; x <= 208; x++) {
    // Top seam slopes slightly from 12 to 17
    const yTop = Math.round(13 + (x - 35) * (4 / 173));
    // Bottom seam curves up near the right: y=68 from x=35..170, then rises to y=58 at x=208
    const yBot = x <= 170 ? 68 : Math.round(68 - (x - 170) * (10 / 38));

    for (let y = yTop; y <= yBot; y++) {
      // Natural subtle gradient of the white panel:
      // Top is around 248, 248, 246; Bottom is around 241, 242, 241
      const t = (y - yTop) / (yBot - yTop);
      const r = Math.round(248 * (1 - t) + 241 * t);
      const g = Math.round(248 * (1 - t) + 242 * t);
      const b = Math.round(246 * (1 - t) + 241 * t);
      const noise = ((x * 19 + y * 31) % 3) - 1;

      const pIdx = (y * i1.width + x) * 3;
      patched1[pIdx] = r + noise;
      patched1[pIdx + 1] = g + noise;
      patched1[pIdx + 2] = b + noise;
    }

    // Preserve architectural panel vertical seams
    if (x === 62 || x === 146) {
      for (let y = yTop; y <= yBot; y++) {
        const pIdx = (y * i1.width + x) * 3;
        patched1[pIdx] = Math.max(0, patched1[pIdx] - 11);
        patched1[pIdx + 1] = Math.max(0, patched1[pIdx + 1] - 11);
        patched1[pIdx + 2] = Math.max(0, patched1[pIdx + 2] - 11);
      }
    }
  }

  const cleanPatch1 = await sharp(patched1, {
    raw: { width: i1.width, height: i1.height, channels: 3 }
  }).png().toBuffer();

  await sharp(cleanPatch1).toFile('public/images/walkthrough/debug-clean-wall3.png');

  // Place official Alverstone Medcity logo
  const b1LogoW = 166;
  const b1LogoH = Math.round(b1LogoW * (151 / 934)); // ~27px
  const resizedLogo1 = await sharp(logoNavy)
    .resize(b1LogoW, b1LogoH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const shadow1 = await sharp({
    create: {
      width: b1LogoW + 4,
      height: b1LogoH + 4,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: resizedLogo1, left: 2, top: 2 }])
    .png()
    .toBuffer();

  const shadowBuf1 = await sharp(shadow1).raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < shadowBuf1.data.length; i += 4) {
    if (shadowBuf1.data[i + 3] > 0) {
      shadowBuf1.data[i] = 20;
      shadowBuf1.data[i + 1] = 25;
      shadowBuf1.data[i + 2] = 35;
      shadowBuf1.data[i + 3] = Math.round(shadowBuf1.data[i + 3] * 0.25);
    }
  }
  const cleanShadow1 = await sharp(shadowBuf1.data, {
    raw: { width: shadowBuf1.info.width, height: shadowBuf1.info.height, channels: 4 }
  }).blur(0.8).png().toBuffer();

  const logoX1 = Math.round((35 + 208 - b1LogoW) / 2); // ~38
  const logoY1 = 28;

  const finishedCrop1 = await sharp(cleanPatch1)
    .composite([
      { input: cleanShadow1, left: logoX1, top: logoY1 + 1 },
      { input: resizedLogo1, left: logoX1, top: logoY1 }
    ])
    .png()
    .toBuffer();

  await sharp(b01Orig)
    .composite([{ input: finishedCrop1, left: crop01.left, top: crop01.top }])
    .jpeg({ quality: 95 })
    .toFile('public/images/walkthrough/01-building.jpg');

  console.log('✓ 01-building.jpg perfectly patched and verified!');
}

perfectBuilding01().catch(console.error);
