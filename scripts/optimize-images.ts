import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, '..', 'attached_assets');
const OPTIMIZED_DIR = path.join(ASSETS_DIR, 'optimized');
const MIN_SIZE_KB = 500;

interface OptimizationResult {
  originalPath: string;
  optimizedPath: string;
  originalSize: number;
  optimizedSize: number;
  reduction: number;
}

async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

function formatBytes(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2) + 'MB';
}

async function optimizeImage(filePath: string, filename: string): Promise<OptimizationResult | null> {
  try {
    const originalSize = await getFileSize(filePath);
    const originalSizeKB = originalSize / 1024;

    if (originalSizeKB < MIN_SIZE_KB) {
      console.log(`⏭️  Skipping ${filename} (${formatBytes(originalSize)}) - below ${MIN_SIZE_KB}KB threshold`);
      return null;
    }

    const ext = path.extname(filename).toLowerCase();
    const baseName = path.basename(filename, ext);
    const optimizedPath = path.join(OPTIMIZED_DIR, `${baseName}.webp`);

    await fs.mkdir(OPTIMIZED_DIR, { recursive: true });

    let sharpInstance = sharp(filePath);
    const metadata = await sharpInstance.metadata();

    if (metadata.width && metadata.width > 1920) {
      sharpInstance = sharpInstance.resize(1920, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }

    await sharpInstance
      .webp({ quality: 85, effort: 6 })
      .toFile(optimizedPath);

    const optimizedSize = await getFileSize(optimizedPath);
    const reduction = ((originalSize - optimizedSize) / originalSize) * 100;

    console.log(`✅ ${filename}`);
    console.log(`   Original: ${formatBytes(originalSize)} → Optimized: ${formatBytes(optimizedSize)}`);
    console.log(`   Reduction: ${reduction.toFixed(1)}%`);

    return {
      originalPath: filePath,
      optimizedPath,
      originalSize,
      optimizedSize,
      reduction
    };
  } catch (error) {
    console.error(`❌ Error optimizing ${filename}:`, error);
    return null;
  }
}

async function optimizeAllImages() {
  console.log('🚀 Starting image optimization...\n');
  console.log(`📁 Source: ${ASSETS_DIR}`);
  console.log(`📁 Output: ${OPTIMIZED_DIR}\n`);

  const files = await fs.readdir(ASSETS_DIR);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const imageFiles = files.filter(file => 
    imageExtensions.includes(path.extname(file).toLowerCase())
  );

  console.log(`Found ${imageFiles.length} images\n`);

  const results: OptimizationResult[] = [];

  for (const file of imageFiles) {
    const filePath = path.join(ASSETS_DIR, file);
    const result = await optimizeImage(filePath, file);
    if (result) {
      results.push(result);
    }
    console.log('');
  }

  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0);
  const totalReduction = ((totalOriginal - totalOptimized) / totalOriginal) * 100;

  console.log('\n' + '='.repeat(60));
  console.log('📊 OPTIMIZATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Images optimized: ${results.length}`);
  console.log(`Total original size: ${formatBytes(totalOriginal)}`);
  console.log(`Total optimized size: ${formatBytes(totalOptimized)}`);
  console.log(`Total saved: ${formatBytes(totalOriginal - totalOptimized)}`);
  console.log(`Average reduction: ${totalReduction.toFixed(1)}%`);
  console.log('='.repeat(60));

  const reportPath = path.join(OPTIMIZED_DIR, 'optimization-report.json');
  await fs.writeFile(
    reportPath,
    JSON.stringify({ 
      results, 
      summary: {
        totalImages: results.length,
        totalOriginal,
        totalOptimized,
        totalSaved: totalOriginal - totalOptimized,
        averageReduction: totalReduction
      }
    }, null, 2)
  );

  console.log(`\n📄 Report saved to: ${reportPath}`);
  console.log(`\n✨ Optimization complete! Optimized images are in: ${OPTIMIZED_DIR}`);
}

optimizeAllImages().catch(console.error);
