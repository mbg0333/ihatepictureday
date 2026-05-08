import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create a unique filename
      const filename = file.name;
      const path = join(process.cwd(), 'public', 'uploads', filename);

      await writeFile(path, buffer);
      
      uploadedFiles.push({
        name: filename,
        url: `/uploads/${filename}`,
      });
    }

    return NextResponse.json({ files: uploadedFiles });
  } catch (error: any) {
    console.error("Local upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
