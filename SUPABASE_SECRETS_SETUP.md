# 🔐 Supabase Secrets Setup

Your Edge Functions need access to Cloudinary credentials. Here's how to set them up:

## **Step 1: Go to Supabase Dashboard**

1. Visit: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/settings/edge-functions
2. Click on **"Environment Variables"** or **"Secrets"**

## **Step 2: Add These Secrets**

Add the following environment variables:

```
CLOUDINARY_CLOUD_NAME=dgymjtqil
CLOUDINARY_API_KEY=416743773648286
CLOUDINARY_API_SECRET=3QaG8YL1EssmhKNWmgOedqkFdUc
```

## **Step 3: Alternative - Command Line Setup**

If you prefer command line, run these commands:

```bash
npx supabase secrets set CLOUDINARY_CLOUD_NAME=dgymjtqil
npx supabase secrets set CLOUDINARY_API_KEY=416743773648286
npx supabase secrets set CLOUDINARY_API_SECRET=3QaG8YL1EssmhKNWmgOedqkFdUc
```

## **Step 4: Verify Setup**

After setting the secrets, your Edge Functions will be able to:
- ✅ Generate secure upload signatures
- ✅ Handle file uploads to Cloudinary
- ✅ Process and finalize uploads
- ✅ Manage bulk operations

---

**Ready to test? Let me know when you've added the secrets!**