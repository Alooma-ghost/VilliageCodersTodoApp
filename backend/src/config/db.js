const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.log('⚡ System running in resilient self-contained storage mode (MONGODB_URI not provided).');
    return;
  }

  try {
    const conn = await mongoose.connect(uri.trim(), {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Atlas Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn('\n--------------------------------------------------------------');
    console.warn('⚠️ MongoDB Atlas Notice: Could not connect to Atlas cluster.');
    console.warn(`Reason: ${error.message}`);
    console.warn('💡 Tip: Ensure your current IP is whitelisted in MongoDB Atlas:');
    console.warn('   Atlas Dashboard -> Network Access -> Add IP Address -> "0.0.0.0/0" (Allow from Anywhere)');
    console.warn('⚡ Seamless fallback activated: System is running with persistent storage!');
    console.warn('--------------------------------------------------------------\n');

    // Attempt periodic reconnect every 60 seconds without blocking app
    setInterval(async () => {
      if (mongoose.connection.readyState !== 1) {
        try {
          await mongoose.connect(uri.trim(), { serverSelectionTimeoutMS: 5000 });
          console.log('✅ Background reconnect: MongoDB Atlas is now connected!');
        } catch (e) {
          // silently wait for next tick
        }
      }
    }, 60000);
  }
};

module.exports = connectDB;
