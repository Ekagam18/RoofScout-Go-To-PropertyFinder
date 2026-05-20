---
description: How to test and use the Multer + Cloudinary file upload system
---

# File Upload System Workflow

## Backend Setup

1. **Install Dependencies** (already done):
   ```bash
   cd Backend
   npm install multer cloudinary multer-storage-cloudinary
   ```

2. **Configure Cloudinary**:
   - Sign up at cloudinary.com
   - Get credentials from Dashboard → Settings → API Keys
   - Add to `Backend/.env`:
     ```
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```

3. **Verify Configuration Files**:
   - `Backend/config/cloudinary.js` - Cloudinary config with Multer storage
   - `Backend/middleware/upload.js` - Multer middleware
   - `Backend/models/property.js` - Has `images: [String]` array
   - `Backend/routes/properties.js` - Uses `upload.array('images', 10)`

## Frontend Setup

1. **Verify Upload Pages**:
   - `roofscout_react/src/pages/Sell.jsx` - Multiple image upload with preview
   - `roofscout_react/src/pages/Rent.jsx` - Multiple image upload with preview
   - `roofscout_react/src/pages/PG.jsx` - Multiple image upload with preview

2. **Verify Display Page**:
   - `roofscout_react/src/pages/ViewDetail.jsx` - Image gallery display

## Testing File Uploads

1. **Start Backend**:
   ```bash
   cd Backend
   npm start
   ```

2. **Start Frontend**:
   ```bash
   cd roofscout_react
   npm run dev
   ```

3. **Test Upload**:
   - Login as user
   - Navigate to `/sell`, `/rent`, or `/pg`
   - Select multiple images (max 10, max 5MB each)
   - Verify previews appear
   - Remove an image if needed
   - Submit form
   - Check MongoDB: property should have `images` array with Cloudinary URLs
   - Check Cloudinary Dashboard: images in `roofscout/properties` folder

4. **Test Deletion**:
   - Delete property as admin
   - Verify images deleted from Cloudinary
   - Verify property removed from MongoDB

## Troubleshooting

- **Upload fails**: Check Cloudinary credentials in .env
- **Images not displaying**: Check if images array is populated in MongoDB
- **Deletion fails**: Check if Cloudinary API key has delete permissions
