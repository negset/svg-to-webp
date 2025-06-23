import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { pathToFileURL } from 'url';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`Usage: node ${process.argv[1]} input.svg ...`);
  process.exit(1);
}

for (const arg of args) {
  const svgPath = path.resolve(process.cwd(), arg);
  const pngPath = svgPath.replace(path.extname(svgPath), '.png');
  const webpPath = svgPath.replace(path.extname(svgPath), '.webp');

  // svg to png
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(pathToFileURL(svgPath).href, {
    waitUntil: 'load',
  });
  const img = await page.waitForSelector('svg');
  await img.screenshot({
    path: pngPath,
  });
  await browser.close();

  // png to svg
  await sharp(pngPath)
    .webp({
      nearLossless: true,
    })
    .toFile(webpPath);

  // delete png
  try {
    await fs.unlink(pngPath);
  } catch (err) {
    console.error('Cannot delete png file.', err);
  }
}
