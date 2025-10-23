/**
 * Supabase Edge Function: Upload Image Asset
 * Handles image uploads with validation, optimization, and Supabase Storage upload
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed image types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/heic',
  'image/heif',
  'image/avif',
  'image/bmp',
  'image/tiff',
];

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    console.log('Upload Image Asset invoked');

    // Get JSON body
    const body = await req.json();
    console.log('Request body received:', {
      hasImageBase64: !!body.imageBase64,
      imageBase64Length: body.imageBase64?.length || 0,
      fileName: body.fileName,
      fileType: body.fileType,
      fileSize: body.fileSize,
      websiteId: body.websiteId,
    });

    const { imageBase64, fileName, fileType, fileSize, websiteId } = body;

    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    if (!websiteId) {
      throw new Error('websiteId is required');
    }

    console.log('Upload request validated:', {
      fileName,
      fileType,
      fileSize,
      websiteId,
      base64Length: imageBase64.length,
    });

    // Validate file type
    if (!ALLOWED_TYPES.includes(fileType)) {
      throw new Error(`Invalid file type: ${fileType}. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${fileSize} bytes. Maximum: ${MAX_FILE_SIZE} bytes (10MB)`);
    }

    // Setup Supabase client
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Ensure website-imports bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b: any) => b.name === 'website-imports');

      if (!bucketExists) {
        console.log('Creating website-imports bucket...');
        await supabase.storage.createBucket('website-imports', {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: ALLOWED_TYPES,
        });
        console.log('✓ Bucket created');
      }
    } catch (error) {
      console.error('Bucket check/creation error:', error);
      // Continue anyway - bucket might exist
    }

    // Convert base64 to Uint8Array
    console.log('Converting base64 to binary...');
    let binaryString: string;
    try {
      binaryString = atob(imageBase64);
    } catch (error) {
      console.error('Base64 decode error:', error);
      throw new Error('Invalid base64 image data');
    }

    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    console.log(`✓ Converted to binary: ${uint8Array.length} bytes`);

    // Generate unique filename
    const extension = fileName.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `${websiteId}/smart-edit-${timestamp}-${randomString}.${extension}`;

    console.log(`Uploading to Supabase Storage: ${filename}`);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('website-imports')
      .upload(filename, uint8Array, {
        contentType: fileType,
        upsert: false,
        cacheControl: '3600', // Cache for 1 hour
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    console.log('✓ Upload successful:', data.path);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('website-imports')
      .getPublicUrl(filename);

    const publicUrl = publicUrlData.publicUrl;

    console.log('✓ Public URL generated:', publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        filename: filename,
        size: fileSize,
        type: fileType,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Upload Image Asset error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || String(error),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
