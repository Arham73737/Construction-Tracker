import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let bucket = null;

export const getBucket = async () => {
  if (bucket) return bucket;
  if (!mongoose.connection.readyState || !mongoose.connection.db) {
    // Wait for mongoose connection if not ready
    await new Promise((resolve, reject) => {
      mongoose.connection.once('open', resolve);
      mongoose.connection.once('error', reject);
      setTimeout(() => reject(new Error('Mongoose connection timeout')), 5000);
    });
  }
  bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
  return bucket;
};
