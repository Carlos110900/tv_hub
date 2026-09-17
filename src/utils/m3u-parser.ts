export type ImportedChannel = {
  name: string;
  logoUrl: string;
  streamUrl: string;
  country: string;
  categories: string[];
  isActive: boolean;
};

type ChannelInfo = {
  name: string;
  logoUrl: string;
  categories: string[];
  isActive: boolean;
};

function readAttributes(line: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attributePattern = /([\w-]+)="([^"]*)"/g;

  for (const match of line.matchAll(attributePattern)) {
    attributes[match[1]] = match[2];
  }

  return attributes;
}

function readChannelInfo(line: string): ChannelInfo | undefined {
  // The final comma separates M3U attributes from the visible channel name.
  const nameSeparator = line.lastIndexOf(',');
  if (nameSeparator === -1) return undefined;

  const attributes = readAttributes(line);
  const name = line.slice(nameSeparator + 1).trim();
  const categoryText = attributes['group-title'] ?? '';
  const categories = categoryText ? categoryText.split(';').map((category) => category.trim()).filter(Boolean) : [];

  if (!name || !attributes['tvg-logo']) return undefined;

  return {
    name,
    logoUrl: attributes['tvg-logo'],
    categories,
    // We trust this explicit label from the playlist without making network requests.
    isActive: !name.includes('[Geo-blocked]')
  };
}

function isStreamUrl(line: string): boolean {
  return line.startsWith('http://') || line.startsWith('https://');
}

// Reads the common #EXTINF + URL M3U format. Other # lines, such as
// #EXTVLCOPT, are intentionally ignored because V2 does not play streams.
export function parseM3u(playlist: string, country: string): ImportedChannel[] {
  const cleanCountry = country.trim();
  if (!cleanCountry) throw new Error('Country is required to import a playlist');

  const channels: ImportedChannel[] = [];
  let pendingChannel: ChannelInfo | undefined;

  for (const rawLine of playlist.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line.startsWith('#EXTINF:')) {
      pendingChannel = readChannelInfo(line);
      continue;
    }

    if (!isStreamUrl(line)) continue;

    if (pendingChannel) {
      channels.push({ ...pendingChannel, streamUrl: line, country: cleanCountry });
    }

    pendingChannel = undefined;
  }

  return channels;
}
