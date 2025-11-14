# ✅ Visual Persistence Test Checklist

Use this checklist to verify all persistence issues are fixed.

## 🖼️ My Story Section Test

### Step 1: Upload Image
- [ ] Go to Admin Panel
- [ ] Click "My Story" section
- [ ] Click "Upload New Image" button
- [ ] Select an image from your computer
- [ ] ✅ Image preview appears immediately

### Step 2: Edit Content
- [ ] Change the title (e.g., "My Journey")
- [ ] Change the subtitle (e.g., "A story of innovation")
- [ ] Edit paragraph 1
- [ ] Edit paragraph 2
- [ ] Edit paragraph 3
- [ ] ✅ Live preview updates as you type

### Step 3: Save Changes
- [ ] Click "Save Changes" button
- [ ] ✅ See success message
- [ ] Wait 2 seconds

### Step 4: Verify Admin Persistence
- [ ] Press F5 to refresh the page
- [ ] Go back to "My Story" section
- [ ] ✅ Image is still there
- [ ] ✅ Title matches what you entered
- [ ] ✅ Subtitle matches what you entered
- [ ] ✅ All paragraphs match what you entered

### Step 5: Verify Homepage Display
- [ ] Click "Home" or go to homepage
- [ ] Scroll to "My Story" section
- [ ] ✅ Image displays correctly
- [ ] ✅ Title displays correctly
- [ ] ✅ Subtitle displays correctly
- [ ] ✅ All paragraphs display correctly

**✅ My Story Persistence: PASS / ❌ FAIL**

---

## 📄 CV Section Test

### Step 1: Add Google Drive URLs
- [ ] Go to Admin Panel
- [ ] Click "CV Management" section
- [ ] Find "Indian CV" version
- [ ] Paste Google Drive URL: `https://drive.google.com/file/d/YOUR_FILE_ID/view`
- [ ] Find "Europass CV" version
- [ ] Paste Google Drive URL
- [ ] Find "Global CV" version
- [ ] Paste Google Drive URL

### Step 2: Save Changes
- [ ] Click "Save All Changes" button
- [ ] ✅ See success message
- [ ] Wait 2 seconds

### Step 3: Verify Admin Persistence
- [ ] Press F5 to refresh the page
- [ ] Go back to "CV Management" section
- [ ] ✅ Indian CV URL is still there
- [ ] ✅ Europass CV URL is still there
- [ ] ✅ Global CV URL is still there

### Step 4: Verify Homepage Display
- [ ] Click "Home" or go to homepage
- [ ] Scroll to "Download CV" section
- [ ] ✅ See 3 CV download buttons
- [ ] Click "Indian CV" button
- [ ] ✅ Opens your Google Drive link
- [ ] Click "Europass CV" button
- [ ] ✅ Opens your Google Drive link
- [ ] Click "Global CV" button
- [ ] ✅ Opens your Google Drive link

**✅ CV Persistence: PASS / ❌ FAIL**

---

## 📧 Contact Section Test

### Step 1: Edit Contact Info
- [ ] Go to Admin Panel
- [ ] Click "Contact" section
- [ ] Change email address
- [ ] Change phone number
- [ ] Change location
- [ ] Edit social links (LinkedIn, GitHub, etc.)

### Step 2: Upload Resume (Optional)
- [ ] Click "Upload Resume" button
- [ ] Select your resume PDF
- [ ] ✅ See upload progress
- [ ] ✅ See success message

### Step 3: Save Changes
- [ ] Click "Save Changes" button
- [ ] ✅ See success message
- [ ] Wait 2 seconds

### Step 4: Verify Admin Persistence
- [ ] Press F5 to refresh the page
- [ ] Go back to "Contact" section
- [ ] ✅ Email matches what you entered
- [ ] ✅ Phone matches what you entered
- [ ] ✅ Location matches what you entered
- [ ] ✅ Social links are correct
- [ ] ✅ Resume is still uploaded

### Step 5: Verify Homepage Display
- [ ] Click "Home" or go to homepage
- [ ] Scroll to "Contact" section
- [ ] ✅ Email displays correctly
- [ ] ✅ Phone displays correctly
- [ ] ✅ Location displays correctly
- [ ] ✅ Social links work
- [ ] ✅ Resume download works

**✅ Contact Persistence: PASS / ❌ FAIL**

---

## 🎯 Overall Test Results

| Section | Admin Persistence | Homepage Display | Status |
|---------|------------------|------------------|--------|
| My Story | ⬜ | ⬜ | ⬜ |
| CV | ⬜ | ⬜ | ⬜ |
| Contact | ⬜ | ⬜ | ⬜ |

**Legend:**
- ✅ = Working correctly
- ❌ = Not working
- ⬜ = Not tested yet

---

## 🐛 If Any Test Fails

### 1. Check for duplicates:
```bash
node scripts/test-all-persistence.js
```

### 2. If duplicates found, clean them:
```bash
node scripts/cleanup-all-duplicate-sections.js
```

### 3. Refresh browser and test again:
- Press F5
- Clear browser cache (Ctrl+Shift+Delete)
- Try the test again

### 4. Check browser console:
- Press F12
- Go to Console tab
- Look for errors (red text)
- Share any errors you see

---

## ✅ Success Criteria

**All tests should PASS:**
- ✅ Images persist after refresh
- ✅ Text changes persist after refresh
- ✅ URLs persist after refresh
- ✅ Admin shows saved data
- ✅ Homepage shows saved data
- ✅ No mock data appears
- ✅ No "default" content appears

**If all tests pass, your persistence is FULLY WORKING!** 🎉
