# 🔐 Supabase Authentication Setup

## **Step 1: Disable Email Confirmation (for easier setup)**

1. Go to: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/auth/settings
2. Scroll down to **"Email Auth"**
3. **Uncheck** "Enable email confirmations"
4. Click **"Save"**

## **Step 2: Alternative - Confirm Email Manually**

If you prefer to keep email confirmation enabled:

1. Go to: https://supabase.com/dashboard/project/djbdwbkhnrdnjreigtfz/auth/users
2. Find the user: `admin@portfolio.com`
3. Click on the user
4. Click **"Confirm Email"**

## **Step 3: Test Login**

After either step above, run:

```bash
node scripts/setup-user-profile.js
```

## **Step 4: Access Your Admin Dashboard**

Once setup is complete:

1. Visit: http://localhost:5175/admin
2. Login with: `admin@portfolio.com` / `portfolio123!`
3. Start managing your portfolio!

---

**Which option would you prefer? Let me know when you've updated the auth settings!**