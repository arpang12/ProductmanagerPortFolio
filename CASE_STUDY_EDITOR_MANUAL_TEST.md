# Case Study Editor - Manual Testing Guide

## Complete End-to-End Functionality Test

This guide will help you verify that all case study editor features work correctly and changes reflect properly on the frontend.

---

## 🎯 Test Objectives

1. ✅ Create new case studies
2. ✅ Edit case study content
3. ✅ Upload and display hero images
4. ✅ Add different section types (text, embeds)
5. ✅ Publish/unpublish functionality
6. ✅ Template switching (Default, Ghibli, Modern)
7. ✅ Changes reflect on frontend immediately
8. ✅ Back button works on all templates

---

## 🚀 Prerequisites

1. Dev server running: `npm run dev`
2. Browser open at: `http://localhost:4000`
3. Logged in to admin panel
4. DevTools open (F12) for debugging

---

## Test 1: Create New Case Study

### Steps:
1. Go to Admin Panel
2. Click "Create New Case Study"
3. Enter title: "Test Project Alpha"
4. Select template: "Default (Dynamic React Rendering)"
5. Click "Create"

### Expected Results:
- ✅ Modal closes
- ✅ Editor opens with empty content
- ✅ Title shows "Test Project Alpha"
- ✅ Template indicator shows "📝 Default Style"

### Verification:
```javascript
// In DevTools Console
console.log('Current case study:', window.location.href);
// Should show editor URL
```

---

## Test 2: Add Hero Image

### Steps:
1. In the editor, find "Hero Image" section
2. Click "Upload Hero Image" or image upload area
3. Select an image file (JPG/PNG, < 5MB)
4. Wait for upload to complete

### Expected Results:
- ✅ Upload progress indicator appears
- ✅ Image preview displays after upload
- ✅ Image URL is saved
- ✅ No console errors

### Verification:
- Check that image appears in preview
- Verify image URL starts with `https://res.cloudinary.com/`

---

## Test 3: Edit Title and Description

### Steps:
1. Click on the title field
2. Change to: "Test Project Alpha - Updated"
3. Click on description field
4. Enter: "This is a comprehensive test of the case study editor functionality"
5. Click "Save" or wait for auto-save

### Expected Results:
- ✅ Changes are saved
- ✅ Success message appears
- ✅ No errors in console

### Verification:
```javascript
// Refresh page and verify data persists
location.reload();
```

---

## Test 4: Add Text Section

### Steps:
1. Click "Add Section" button
2. Select "Text" section type
3. In the rich text editor, add:
   ```
   ## Problem Statement
   
   Users struggle with managing their portfolio content effectively.
   
   ### Key Challenges:
   - Content organization
   - Visual consistency
   - Easy updates
   ```
4. Save the section

### Expected Results:
- ✅ Section appears in editor
- ✅ Formatting is preserved
- ✅ Section can be reordered
- ✅ Section can be deleted

---

## Test 5: Add Embed Section

### Steps:
1. Click "Add Section" button
2. Select "Embed" section type
3. Choose embed type: "YouTube"
4. Enter URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
5. Save the section

### Expected Results:
- ✅ Embed preview appears
- ✅ YouTube video is embedded correctly
- ✅ Embed is responsive

### Alternative Embeds to Test:
- **Figma**: `https://www.figma.com/file/...`
- **CodePen**: `https://codepen.io/...`
- **Google Drive**: `https://drive.google.com/file/d/...`

---

## Test 6: Reorder Sections

### Steps:
1. Hover over a section
2. Click and hold the drag handle (⋮⋮ icon)
3. Drag section up or down
4. Release to drop
5. Save changes

### Expected Results:
- ✅ Section moves smoothly
- ✅ Order is preserved after save
- ✅ Order reflects on frontend

---

## Test 7: Delete Section

### Steps:
1. Hover over a section
2. Click the delete button (🗑️ icon)
3. Confirm deletion
4. Save changes

### Expected Results:
- ✅ Section is removed from editor
- ✅ Deletion is saved
- ✅ Section doesn't appear on frontend

---

## Test 8: Publish Case Study

### Steps:
1. Ensure all content is saved
2. Find the "Publish" toggle/button
3. Click to publish
4. Confirm if prompted

### Expected Results:
- ✅ Status changes to "Published"
- ✅ Success message appears
- ✅ Case study appears on homepage

### Verification:
1. Go to homepage (`http://localhost:4000`)
2. Scroll to "Magical Projects" section
3. Verify "Test Project Alpha - Updated" appears
4. Check project count increases

---

## Test 9: View Published Case Study

### Steps:
1. On homepage, click the project card
2. Observe the case study page

### Expected Results:
- ✅ Hero image displays correctly
- ✅ Title shows: "Test Project Alpha - Updated"
- ✅ Description displays correctly
- ✅ All sections appear in correct order
- ✅ Text formatting is preserved
- ✅ Embeds work correctly
- ✅ **Back button appears in top-left corner**
- ✅ Back button returns to homepage

### Visual Checks:
- [ ] Layout is clean and readable
- [ ] Images load properly
- [ ] No broken embeds
- [ ] Responsive on mobile (resize browser)
- [ ] Dark mode works (if applicable)

---

## Test 10: Edit Published Case Study

### Steps:
1. Go back to Admin Panel
2. Find "Test Project Alpha - Updated"
3. Click "Edit"
4. Change title to: "Test Project Alpha - Final"
5. Add a new text section
6. Save changes

### Expected Results:
- ✅ Changes save successfully
- ✅ Case study remains published
- ✅ Changes reflect immediately on frontend

### Verification:
1. Go to homepage
2. Click on the project
3. Verify new title appears
4. Verify new section appears

---

## Test 11: Template Switching

### Test 11a: Switch to Ghibli Template

1. In editor, find template selector
2. Change to "Ghibli Style (Static HTML)"
3. Save changes
4. View on frontend

**Expected Results:**
- ✅ Template changes to Ghibli style
- ✅ Content is preserved
- ✅ **Back button still appears**
- ✅ Ghibli-specific styling applies

### Test 11b: Switch to Modern Template

1. Change to "Modern Style (Glassmorphism & Pastels)"
2. Save changes
3. View on frontend

**Expected Results:**
- ✅ Template changes to Modern style
- ✅ Content is preserved
- ✅ **Back button still appears**
- ✅ Modern glassmorphism effects apply

### Test 11c: Switch Back to Default

1. Change back to "Default (Dynamic React Rendering)"
2. Save and verify

**Expected Results:**
- ✅ Template changes back to Default
- ✅ All content intact
- ✅ **Back button still appears**

---

## Test 12: Unpublish Case Study

### Steps:
1. In editor, toggle "Publish" to OFF
2. Save changes
3. Go to homepage

### Expected Results:
- ✅ Case study no longer appears on homepage
- ✅ Project count decreases
- ✅ Direct URL access shows 404 or "not published"

### Verification:
Try accessing: `http://localhost:4000/case-study/test-project-alpha-final`
- Should show error or redirect

---

## Test 13: AI Enhancement (If Configured)

### Steps:
1. In a text section, click "AI Enhance" button
2. Wait for AI to generate content
3. Review suggestions
4. Accept or reject changes

### Expected Results:
- ✅ AI generates relevant content
- ✅ Content can be accepted/rejected
- ✅ Changes integrate smoothly

---

## Test 14: Image Upload in Sections

### Steps:
1. Add a text section
2. Use the image upload button in rich text editor
3. Upload an image
4. Verify it appears inline

### Expected Results:
- ✅ Image uploads successfully
- ✅ Image appears in content
- ✅ Image is responsive
- ✅ Image persists after save

---

## Test 15: Multiple Case Studies

### Steps:
1. Create 2-3 more case studies
2. Publish all of them
3. View homepage

### Expected Results:
- ✅ All published case studies appear
- ✅ Sorting works (Newest First, etc.)
- ✅ Each has correct template
- ✅ Each has working back button

---

## Test 16: Back Button Comprehensive Test

### For Each Template:

**Default Template:**
1. View case study
2. Verify back button in top-left
3. Check button styling (white, shadow)
4. Hover to see animation
5. Click to return home
6. ✅ All working

**Ghibli Template:**
1. View case study
2. Verify back button in top-left
3. Check button styling
4. Hover to see animation
5. Click to return home
6. ✅ All working

**Modern Template:**
1. View case study
2. Verify back button in top-left
3. Check button styling
4. Hover to see animation
5. Click to return home
6. ✅ All working

### DevTools Verification:
```javascript
// Run on each case study page
const btn = document.querySelector('button[class*="fixed"][class*="top-24"]');
console.log('Back button found:', !!btn);
console.log('Position:', window.getComputedStyle(btn).position);
console.log('Z-index:', window.getComputedStyle(btn).zIndex);
```

---

## Test 17: Edge Cases

### Test 17a: Very Long Title
- Enter a title with 100+ characters
- Verify it displays correctly
- Check for overflow issues

### Test 17b: Many Sections
- Add 10+ sections
- Verify performance
- Check scrolling and reordering

### Test 17c: Large Images
- Upload a 5MB image
- Verify upload works
- Check loading time

### Test 17d: Special Characters
- Use emojis in title: "🚀 Test Project 🎨"
- Use special chars: "Test & Project <Alpha>"
- Verify proper encoding

---

## Test 18: Persistence Test

### Steps:
1. Create case study with content
2. Close browser tab
3. Reopen and go to editor
4. Verify all content is there

### Expected Results:
- ✅ All content persists
- ✅ Images still load
- ✅ Sections in correct order
- ✅ Published status preserved

---

## Test 19: Concurrent Editing (If Applicable)

### Steps:
1. Open editor in two browser tabs
2. Make changes in tab 1
3. Make different changes in tab 2
4. Save both

### Expected Results:
- ✅ Last save wins (or conflict resolution)
- ✅ No data corruption
- ✅ Clear feedback to user

---

## Test 20: Delete Case Study

### Steps:
1. Go to Admin Panel
2. Find test case study
3. Click "Delete" button
4. Confirm deletion
5. Check homepage

### Expected Results:
- ✅ Case study is deleted
- ✅ Doesn't appear in admin list
- ✅ Doesn't appear on homepage
- ✅ Direct URL shows 404

---

## 📊 Test Results Checklist

### Core Functionality
- [ ] Create case study
- [ ] Edit title and description
- [ ] Upload hero image
- [ ] Add text sections
- [ ] Add embed sections
- [ ] Reorder sections
- [ ] Delete sections
- [ ] Save changes
- [ ] Publish case study
- [ ] Unpublish case study
- [ ] Delete case study

### Frontend Display
- [ ] Case study appears on homepage when published
- [ ] Case study hidden when unpublished
- [ ] All content displays correctly
- [ ] Images load properly
- [ ] Embeds work correctly
- [ ] Formatting preserved

### Templates
- [ ] Default template works
- [ ] Ghibli template works
- [ ] Modern template works
- [ ] Template switching preserves content
- [ ] **Back button works on all templates**

### Back Button Specific
- [ ] Back button visible on Default template
- [ ] Back button visible on Ghibli template
- [ ] Back button visible on Modern template
- [ ] Back button in correct position (top-left)
- [ ] Back button has hover effect
- [ ] Back button navigates to homepage
- [ ] Back button stays fixed when scrolling

### Edge Cases
- [ ] Long titles handled
- [ ] Many sections handled
- [ ] Large images handled
- [ ] Special characters handled
- [ ] Data persists after refresh

---

## 🐛 Common Issues and Solutions

### Issue: Changes don't reflect on frontend
**Solution:** 
- Hard refresh (Ctrl+Shift+R)
- Check if case study is published
- Verify no console errors

### Issue: Images don't upload
**Solution:**
- Check file size (< 5MB)
- Check file format (JPG, PNG, WebP)
- Verify Cloudinary credentials
- Check network tab for errors

### Issue: Back button not visible
**Solution:**
- Verify case study is published
- Check z-index in DevTools
- Look for CSS conflicts
- Verify template is rendering correctly

### Issue: Embeds don't work
**Solution:**
- Verify URL format is correct
- Check embed type matches URL
- Look for CORS issues in console
- Try different embed URL

---

## 📝 Test Report Template

```
Test Date: ___________
Tester: ___________
Environment: http://localhost:4000

RESULTS:
✅ Passed: ___/20 tests
❌ Failed: ___/20 tests
⚠️  Issues: ___

CRITICAL ISSUES:
1. 
2. 
3. 

MINOR ISSUES:
1. 
2. 
3. 

NOTES:


OVERALL STATUS: [ ] PASS [ ] FAIL [ ] NEEDS WORK
```

---

## 🎉 Success Criteria

All tests pass when:
1. ✅ Case studies can be created and edited
2. ✅ All content types work (text, images, embeds)
3. ✅ Publish/unpublish works correctly
4. ✅ Changes reflect immediately on frontend
5. ✅ All three templates work properly
6. ✅ **Back button appears and works on all templates**
7. ✅ No console errors
8. ✅ Data persists correctly
9. ✅ UI is responsive and user-friendly
10. ✅ Edge cases are handled gracefully

---

## 🚀 Next Steps After Testing

If all tests pass:
- ✅ Deploy to production
- ✅ Monitor for issues
- ✅ Gather user feedback

If tests fail:
- 🐛 Document issues
- 🔧 Fix critical bugs
- 🧪 Retest
- 📝 Update documentation
