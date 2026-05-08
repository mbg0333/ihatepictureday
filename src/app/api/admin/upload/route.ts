import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname: string,
        /* clientPayload?: string, */
      ) => {
        // 1. Verify the user is logged in
        // We'll log this to see if it's failing
        const isAuth = await isAuthenticated();
        if (!isAuth) {
          console.error('Upload attempt by unauthorized user for:', pathname);
          throw new Error('Unauthorized');
        }

        // 2. Return the configuration for the upload
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          tokenPayload: JSON.stringify({
            pathname,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This is called after the file is uploaded to Vercel Blob
        console.log('Blob upload completed successfully:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error('Vercel Blob handleUpload error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error during upload initialization' },
      { status: 500 },
    );
  }
}
