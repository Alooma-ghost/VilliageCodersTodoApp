const fs = require('fs');
const path = require('path');

console.log('--- Verifying Backend Dependencies ---');
try {
  const express = require('./backend/node_modules/express');
  const mongoose = require('./backend/node_modules/mongoose');
  const cors = require('./backend/node_modules/cors');
  const jwt = require('./backend/node_modules/jsonwebtoken');
  const bcrypt = require('./backend/node_modules/bcryptjs');
  console.log('✅ Backend packages all present: Express, Mongoose, CORS, JWT, Bcrypt');
} catch (e) {
  console.error('❌ Backend package missing:', e.message);
}

console.log('\n--- Verifying Frontend Dependencies ---');
try {
  const reactPkg = require('./frontend/node_modules/react/package.json');
  const reactDomPkg = require('./frontend/node_modules/react-dom/package.json');
  const lucidePkg = require('./frontend/node_modules/lucide-react/package.json');
  const vitePkg = require('./frontend/node_modules/vite/package.json');
  const pluginReactPkg = require('./frontend/node_modules/@vitejs/plugin-react/package.json');
  console.log(`✅ React: ${reactPkg.version}`);
  console.log(`✅ React-DOM: ${reactDomPkg.version}`);
  console.log(`✅ Lucide-React: ${lucidePkg.version}`);
  console.log(`✅ Vite: ${vitePkg.version}`);
  console.log(`✅ @vitejs/plugin-react: ${pluginReactPkg.version}`);
} catch (e) {
  console.error('❌ Frontend package error:', e.message);
}
