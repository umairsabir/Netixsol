import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from root
const envPath = 'C:/Users/PMLS/Desktop/w12day2/token_build/.env';
dotenv.config({ path: envPath });

const JWT = process.env.JWT;
if (!JWT) {
  console.error("JWT is missing from .env!");
  process.exit(1);
}

const imagesDir = 'C:/Users/PMLS/Desktop/w12day2/assets/images';
const files = fs.readdirSync(imagesDir);

const formData = new FormData();

for (const file of files) {
  const filePath = path.join(imagesDir, file);
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'image/png' });
  // Pass relative path images/file so Pinata treats it as directory
  formData.append('file', blob, `images/${file}`);
}

// Add metadata properties
formData.append('pinataMetadata', JSON.stringify({
  name: 'UmairNFT-Images'
}));

console.log("Uploading images folder to Pinata...");

try {
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${JWT}`
    },
    body: formData
  });

  const data = await response.json();
  if (response.ok) {
    console.log("SUCCESS! Images folder pinned to IPFS.");
    console.log("Images Folder CID:", data.IpfsHash);
    console.log(`Base URL for images: ipfs://${data.IpfsHash}/`);
  } else {
    console.error("ERROR uploading images folder:", data);
  }
} catch (error) {
  console.error("Request failed:", error);
}
