console.log('Testing mongoose load time...');
console.time('mongoose');
const mongoose = require('mongoose');
console.timeEnd('mongoose');
console.log('Mongoose loaded successfully!');
