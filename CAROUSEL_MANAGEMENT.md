# Carousel Management Guide

This guide explains how to manage the homepage carousel images through the admin panel.

## 🎠 **Accessing Carousel Manager**

1. **Login to Admin Panel**: Navigate to `/admin` and login with your credentials
2. **Open Carousel Manager**: Click the "Manage Carousel" button in the dashboard
3. **Full-Screen Interface**: The carousel manager opens in a dedicated full-screen modal

## ✨ **Features Overview**

### **Upload New Images**
- **Multiple Upload**: Select multiple images at once
- **Drag & Drop**: Drag images directly into the upload area (coming soon)
- **Auto-Processing**: Images are automatically uploaded and added to carousel
- **Smart Defaults**: New images get placeholder titles and descriptions

### **Edit Image Details**
- **Click to Edit**: Click the edit (pencil) icon on any image
- **Update Metadata**: Change title and description
- **Real-time Preview**: See changes immediately
- **Validation**: Required fields prevent empty submissions

### **Reorder Images**
- **Drag & Drop**: Drag images to reorder them
- **Visual Feedback**: See dragged items with opacity and scale effects
- **Auto-Save**: New order is automatically saved to backend
- **Position Numbers**: Each image shows its position (#1, #2, etc.)

### **Delete Images**
- **One-Click Delete**: Click the trash icon to remove images
- **Confirmation**: Built-in confirmation prevents accidental deletions
- **Instant Update**: Carousel updates immediately after deletion

## 🎯 **Best Practices**

### **Image Guidelines**
- **Aspect Ratio**: Use 16:9 landscape images for best results
- **Resolution**: Minimum 1024x500px, recommended 1920x1080px
- **File Size**: Keep under 2MB for fast loading
- **Format**: JPG, PNG, or WebP formats supported

### **Content Guidelines**
- **Titles**: Keep titles concise and descriptive (2-6 words)
- **Descriptions**: Write engaging descriptions (1-2 sentences)
- **Theme**: Maintain consistent magical/Ghibli-inspired theme
- **Order**: Place most important/eye-catching images first

### **SEO & Performance**
- **Alt Text**: Titles serve as alt text for accessibility
- **Loading**: Images are lazy-loaded for performance
- **Responsive**: All images automatically scale for mobile devices

## 🔧 **Technical Details**

### **API Endpoints**
- `getCarouselImages()` - Fetch all carousel images
- `createCarouselImage(data)` - Add new image
- `updateCarouselImage(id, data)` - Update image details
- `deleteCarouselImage(id)` - Remove image
- `reorderCarouselImages(ids)` - Change image order

### **Data Structure**
```typescript
interface CarouselImage {
  id: string;           // Unique identifier
  src: string;          // Image URL
  title: string;        // Display title
  description: string;  // Image description
}
```

### **File Upload Process**
1. **Select Files**: User selects one or more image files
2. **Upload**: Files are uploaded to storage (currently mock)
3. **Create Record**: New CarouselImage record is created
4. **Update UI**: Interface refreshes with new image

## 🎨 **UI Components**

### **Main Interface**
- **Grid Layout**: Responsive grid showing all images
- **Image Cards**: Each image in a card with preview and controls
- **Action Buttons**: Edit and delete buttons on hover
- **Upload Area**: Prominent upload button at the top

### **Edit Modal**
- **Form Fields**: Title and description inputs
- **Validation**: Real-time validation feedback
- **Save/Cancel**: Clear action buttons
- **Loading States**: Visual feedback during save operations

### **Drag & Drop**
- **Visual Cues**: Dragged items show reduced opacity
- **Drop Zones**: Clear indication of where items can be dropped
- **Smooth Animations**: CSS transitions for professional feel
- **Error Handling**: Graceful fallback if reorder fails

## 🚀 **Usage Examples**

### **Adding New Images**
1. Click "Add New Images" button
2. Select multiple files from your computer
3. Wait for upload completion
4. Edit titles and descriptions as needed
5. Reorder if necessary

### **Updating Existing Images**
1. Find the image you want to edit
2. Click the pencil (edit) icon
3. Update title and/or description
4. Click "Save Changes"

### **Reordering Images**
1. Click and hold on any image
2. Drag to desired position
3. Release to drop in new position
4. Order is automatically saved

### **Removing Images**
1. Click the trash (delete) icon
2. Confirm deletion in popup
3. Image is immediately removed

## 🔒 **Security & Permissions**

### **Access Control**
- **Admin Only**: Only authenticated admin users can access
- **Session Validation**: Active session required
- **CSRF Protection**: Forms protected against cross-site attacks

### **File Upload Security**
- **Type Validation**: Only image files accepted
- **Size Limits**: Maximum file size enforced
- **Sanitization**: File names and metadata sanitized
- **Storage**: Secure cloud storage (when implemented)

## 📱 **Mobile Support**

### **Responsive Design**
- **Touch-Friendly**: Large buttons and touch targets
- **Mobile Grid**: Adapts to smaller screens
- **Swipe Support**: Touch gestures for reordering (coming soon)
- **Optimized Loading**: Efficient image loading on mobile

---

## 🎉 **Getting Started**

Ready to manage your carousel? Here's the quickest way:

1. **Login**: Go to `/admin` and login
2. **Click**: Hit "Manage Carousel" on the dashboard  
3. **Upload**: Add your first magical image
4. **Edit**: Give it a captivating title and description
5. **Enjoy**: Watch it appear on your homepage!

The carousel management system makes it easy to keep your homepage fresh and engaging with beautiful, rotating imagery that captures the magical essence of your portfolio! ✨