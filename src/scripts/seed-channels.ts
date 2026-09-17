import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { sampleChannels } from '../data/channels.sample.js';
import { Channel } from '../models/channel.model.js';

async function seedChannels(): Promise<void> {
  await connectDatabase();

  // Starting from a known set makes classroom demonstrations repeatable.
  await Channel.deleteMany({});
  await Channel.insertMany(sampleChannels);

  console.log(`${sampleChannels.length} sample channels loaded.`);
  await disconnectDatabase();
}

seedChannels().catch(async (error: unknown) => {
  console.error('Could not seed channels:', error);
  await disconnectDatabase();
  process.exit(1);
});
