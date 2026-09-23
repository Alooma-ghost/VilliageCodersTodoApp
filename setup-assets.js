const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\My Pc\\.gemini\\antigravity-ide\\brain\\21d69bb6-f83f-4dce-8dcd-e5a7b2e4e8ed\\.user_uploaded\\media_1790160989957.png';
const publicDir = path.join(__dirname, 'frontend', 'public');
const assetsDir = path.join(__dirname, 'frontend', 'src', 'assets');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

if (fs.existsSync(srcPath)) {
  fs.copyFileSync(srcPath, path.join(publicDir, 'logo.png'));
  fs.copyFileSync(srcPath, path.join(publicDir, 'favicon.png'));
  fs.copyFileSync(srcPath, path.join(assetsDir, 'village-coders-logo.png'));
  console.log('✅ Logo and icon copied successfully!');
} else {
  console.log('⚠️ Source logo not found at:', srcPath);
}
