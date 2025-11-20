import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, '..', 'attached_assets');
const OPTIMIZED_DIR = path.join(ASSETS_DIR, 'optimized');

async function deployOptimizedImages() {
  console.log('📦 Deploying optimized images...\n');

  const optimizedFiles = await fs.readdir(OPTIMIZED_DIR);
  const webpFiles = optimizedFiles.filter(f => f.endsWith('.webp'));

  let copied = 0;
  for (const file of webpFiles) {
    const sourcePath = path.join(OPTIMIZED_DIR, file);
    const destPath = path.join(ASSETS_DIR, file);
    
    try {
      await fs.copyFile(sourcePath, destPath);
      console.log(`✅ Copied: ${file}`);
      copied++;
    } catch (error) {
      console.error(`❌ Failed to copy ${file}:`, error);
    }
  }

  console.log(`\n✨ Deployed ${copied} optimized images to attached_assets/`);
}

deployOptimizedImages().catch(console.error);
