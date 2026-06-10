const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testImageDelivery() {
  const publicId = 'test-docs/wpktawoibiqroivqzsdv'; // The one I uploaded as image
  const url = cloudinary.url(publicId, {
    resource_type: 'image',
    format: 'jpg',
    page: 1,
    secure: true
  });
  console.log('Image URL (Page 1):', url);
}

testImageDelivery();
