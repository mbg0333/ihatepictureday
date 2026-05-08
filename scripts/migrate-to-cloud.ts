import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';
import dotenv from 'dotenv';

// Load local environment variables
dotenv.config({ path: '.env.local' });

const token = process.env.BLOB_READ_WRITE_TOKEN;

if (!token) {
  console.error("❌ ERROR: BLOB_READ_WRITE_TOKEN not found in .env.local");
  console.log("Please copy the token from your Vercel Blob settings and add it to your local .env.local file.");
  process.exit(1);
}

async function migrateFolder(localBaseDir: string, blobPrefix: string) {
  if (!fs.existsSync(localBaseDir)) return;

  const items = fs.readdirSync(localBaseDir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(localBaseDir, item.name);
    
    if (item.isDirectory()) {
      // Recursively migrate subdirectories (e.g. events/hudson-basketball)
      await migrateFolder(fullPath, `${blobPrefix}${item.name}/`);
    } else if (item.isFile() && /\.(jpg|jpeg|png|webp|gif)$/i.test(item.name)) {
      // Upload images
      const fileBuffer = fs.readFileSync(fullPath);
      const blobPath = `${blobPrefix}${item.name}`;
      
      console.log(`🚀 Uploading: ${blobPath}...`);
      try {
        await put(blobPath, fileBuffer, {
          access: 'public',
          addRandomSuffix: false,
          token: token
        });
        console.log(`✅ Success: ${item.name}`);
      } catch (err: any) {
        console.error(`❌ Failed: ${item.name} - ${err.message}`);
      }
    }
  }
}

async function runMigration() {
  console.log("🎬 Starting Migration to Vercel Blob...");

  // 1. Migrate Events
  console.log("\n📁 Migrating Events...");
  await migrateFolder(path.join(process.cwd(), 'public', 'images', 'events'), 'images/events/');

  // 2. Migrate Samples
  console.log("\n📁 Migrating Samples...");
  await migrateFolder(path.join(process.cwd(), 'public', 'images', 'samples'), 'images/samples/');

  // 3. Migrate Hero Banners
  console.log("\n📁 Migrating Hero Banners...");
  await migrateFolder(path.join(process.cwd(), 'public', 'images', 'hero'), 'images/hero/');

  console.log("\n✨ Migration Complete! Check your Admin Panel on the live site.");
}

runMigration();
