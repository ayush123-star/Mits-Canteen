const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mongodProcess = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_canteen';

  const tryConnect = async (timeoutMs = 4000) => {
    return await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs,
    });
  };

  try {
    console.log(`[Database] Connecting to MongoDB at ${uri}...`);
    await tryConnect(3000);
    console.log('[Database] MongoDB connected successfully.');
  } catch (err) {
    console.warn(`[Database] Could not connect directly to ${uri}. Attempting local mongod instance...`);

    // Ensure data/db directory exists
    const dbPath = path.join(__dirname, '..', 'data', 'db');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    try {
      mongodProcess = spawn('mongod', ['--dbpath', dbPath, '--bind_ip', '127.0.0.1', '--port', '27017'], {
        detached: false,
        stdio: 'ignore',
      });

      mongodProcess.on('error', (spawnErr) => {
        console.error('[Database] Failed to spawn mongod process:', spawnErr.message);
      });

      // Wait 3 seconds for mongod to initialize
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await tryConnect(5000);
      console.log('[Database] Connected to local spawned mongod successfully.');
    } catch (fallbackErr) {
      console.error('[Database] MongoDB connection failed:', fallbackErr.message);
      console.log('[Database] TIP: Ensure MongoDB is running or configure MONGODB_URI in server/.env');
    }
  }
};

process.on('SIGINT', () => {
  if (mongodProcess) {
    mongodProcess.kill();
  }
  process.exit(0);
});

module.exports = connectDB;
