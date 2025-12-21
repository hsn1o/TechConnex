# Cloudflare R2 Setup Guide

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Cloudflare R2 Configuration
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name

# Optional: For public file URLs
R2_PUBLIC_DOMAIN=your-custom-domain.com  # If using custom domain
# OR
R2_ACCOUNT_ID=your_account_id  # For default R2 public URLs
```

## Getting R2 Credentials

1. Go to Cloudflare Dashboard → R2
2. Create a bucket (or use existing)
3. Go to "Manage R2 API Tokens"
4. Create API token with:
   - Permissions: Object Read & Write
   - TTL: Set expiration or leave blank for no expiration
5. Copy the Access Key ID and Secret Access Key
6. Get your Account ID from the R2 dashboard URL or account settings

## Endpoint Format

The R2 endpoint format for S3 API operations is:
```
https://<account-id>.r2.cloudflarestorage.com
```

**Important:** 
- The `pub-*.r2.dev` domain is for **public file access only**, NOT for S3 API operations
- The S3 API endpoint is different from the public domain
- To find your account ID: Go to Cloudflare Dashboard → R2 → Your bucket → Settings → it shows your Account ID

**Example:**
If your Account ID is `9806f030cf2d2ba27941847575d4e13b`, your endpoint should be:
```
R2_ENDPOINT=https://9806f030cf2d2ba27941847575d4e13b.r2.cloudflarestorage.com
```

## Public vs Private Files

- **Public files**: Set `visibility: "public"` in the API request. Returns both `uploadUrl` and `accessUrl`.
- **Private files**: Set `visibility: "private"` (default). Returns only `uploadUrl` and `key`. Use presigned download URLs to access.

## File Size Limits

- Images: 10 MB
- Documents: 50 MB
- Videos: 100 MB
- Default: 50 MB

## Allowed File Types

### Images
- JPEG, JPG, PNG, GIF, WebP, SVG

### Documents
- PDF, DOC, DOCX, XLS, XLSX, TXT, CSV

### Videos
- MP4, MPEG, QuickTime, AVI, WebM

