import { readFile } from 'node:fs/promises';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Channel } from '../models/channel.model.js';
import { parseM3u } from '../utils/m3u-parser.js';

async function importPlaylist(): Promise<void> {
  const [filePath, country] = process.argv.slice(2);

  if (!filePath || !country) {
    throw new Error('Usage: npm run import:m3u -- <playlist-file> <country>');
  }

  const playlist = await readFile(filePath, 'utf8');
  const channels = parseM3u(playlist, country);

  if (channels.length === 0) {
    throw new Error('The playlist did not contain channels with name, logo, and stream URL');
  }

  await connectDatabase();

  // Re-importing a country replaces only that country, not every channel in MongoDB.
  await Channel.deleteMany({ country: country.trim() });
  await Channel.insertMany(channels);

  console.log(`${channels.length} channels from ${country.trim()} were imported.`);
  await disconnectDatabase();
}

importPlaylist().catch(async (error: unknown) => {
  console.error('Could not import M3U playlist:', error);
  await disconnectDatabase();
  process.exit(1);
});
