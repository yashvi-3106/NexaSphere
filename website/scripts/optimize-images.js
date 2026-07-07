import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_ASSETS = path.join(__dirname, '../public/assets');
const TEMPLATES_ASSETS = path.join(__dirname, '../public/templates');

const SIZES = {
  '1x': 1,
  '2x': 2,
  '3x': 3
};

async function optimizeImages(dir) {
  const files = await fs.readdir(dir);
  
  for (const file of files) {
    if (file.match(/\.(png|jpe?g)$/i) && !file.includes('@')) {
      const filePath = path.join(dir, file);
      const ext = path.extname(file);
      const basename = path.basename(file, ext);
      
      const metadata = await sharp(filePath).metadata();
      const width = metadata.width;
      
      for (const [suffix, scale] of Object.entries(SIZES)) {
        const scaledWidth = Math.round(width * (scale / 3)); // Assuming original is 3x or max resolution
        const outPath = path.join(dir, `${basename}@${suffix}.webp`);
        
        try {
          await fs.access(outPath);
          // If it exists, skip
        } catch {
          console.log(`Generating ${outPath}...`);
          await sharp(filePath)
            .resize(scaledWidth)
            .webp({ quality: 80, effort: 6 }) // <100kb usually for typical web assets
            .toFile(outPath);
        }
      }
    }
  }
}

async function run() {
  await optimizeImages(PUBLIC_ASSETS);
  await optimizeImages(TEMPLATES_ASSETS);
}

run().catch(console.error);
