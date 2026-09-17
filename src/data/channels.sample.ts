export type SampleChannel = {
  name: string;
  logoUrl: string;
  streamUrl: string;
  country: string;
  categories: string[];
  isActive: boolean;
};

// These are local classroom examples. streamUrl is stored for a future version,
// but V2 does not play streams or contact an IPTV provider.
export const sampleChannels: SampleChannel[] = [
  { name: 'Noticias 24', logoUrl: 'https://placehold.co/160x90/155eef/ffffff?text=N24', streamUrl: 'https://example.com/streams/noticias-24.m3u8', country: 'Mexico', categories: ['News'], isActive: true },
  { name: 'Cultura MX', logoUrl: 'https://placehold.co/160x90/7f56d9/ffffff?text=CMX', streamUrl: 'https://example.com/streams/cultura-mx.m3u8', country: 'Mexico', categories: ['Culture', 'Education'], isActive: true },
  { name: 'Deportes Uno', logoUrl: 'https://placehold.co/160x90/f79009/ffffff?text=D1', streamUrl: 'https://example.com/streams/deportes-uno.m3u8', country: 'Mexico', categories: ['Sports'], isActive: true },
  { name: 'Cine Latino', logoUrl: 'https://placehold.co/160x90/d92d20/ffffff?text=CL', streamUrl: 'https://example.com/streams/cine-latino.m3u8', country: 'Mexico', categories: ['Movies'], isActive: true },
  { name: 'Música Viva', logoUrl: 'https://placehold.co/160x90/039855/ffffff?text=MV', streamUrl: 'https://example.com/streams/musica-viva.m3u8', country: 'Mexico', categories: ['Music'], isActive: true },
  { name: 'Canal Infantil', logoUrl: 'https://placehold.co/160x90/ee46bc/ffffff?text=CI', streamUrl: 'https://example.com/streams/canal-infantil.m3u8', country: 'Mexico', categories: ['Kids'], isActive: true },
  { name: 'World News', logoUrl: 'https://placehold.co/160x90/175cd3/ffffff?text=WN', streamUrl: 'https://example.com/streams/world-news.m3u8', country: 'United States', categories: ['News'], isActive: true },
  { name: 'Nature Now', logoUrl: 'https://placehold.co/160x90/12b76a/ffffff?text=NN', streamUrl: 'https://example.com/streams/nature-now.m3u8', country: 'United States', categories: ['Documentary'], isActive: true },
  { name: 'Classic Cinema', logoUrl: 'https://placehold.co/160x90/475467/ffffff?text=CC', streamUrl: 'https://example.com/streams/classic-cinema.m3u8', country: 'United States', categories: ['Movies'], isActive: true },
  { name: 'Sports Central', logoUrl: 'https://placehold.co/160x90/f04438/ffffff?text=SC', streamUrl: 'https://example.com/streams/sports-central.m3u8', country: 'United States', categories: ['Sports'], isActive: true },
  { name: 'BBC Learning', logoUrl: 'https://placehold.co/160x90/101828/ffffff?text=BBC', streamUrl: 'https://example.com/streams/bbc-learning.m3u8', country: 'United Kingdom', categories: ['Education', 'News'], isActive: true },
  { name: 'London Arts', logoUrl: 'https://placehold.co/160x90/6941c6/ffffff?text=LA', streamUrl: 'https://example.com/streams/london-arts.m3u8', country: 'United Kingdom', categories: ['Culture'], isActive: true },
  { name: 'France Découverte', logoUrl: 'https://placehold.co/160x90/2e90fa/ffffff?text=FD', streamUrl: 'https://example.com/streams/france-decouverte.m3u8', country: 'France', categories: ['Documentary', 'Culture'], isActive: true },
  { name: 'Paris Musique', logoUrl: 'https://placehold.co/160x90/9e77ed/ffffff?text=PM', streamUrl: 'https://example.com/streams/paris-musique.m3u8', country: 'France', categories: ['Music'], isActive: true },
  { name: 'España Historia', logoUrl: 'https://placehold.co/160x90/e04f16/ffffff?text=EH', streamUrl: 'https://example.com/streams/espana-historia.m3u8', country: 'Spain', categories: ['History', 'Education'], isActive: true },
  { name: 'Madrid Deportes', logoUrl: 'https://placehold.co/160x90/ec4a0a/ffffff?text=MD', streamUrl: 'https://example.com/streams/madrid-deportes.m3u8', country: 'Spain', categories: ['Sports'], isActive: true },
  { name: 'Brasil Agora', logoUrl: 'https://placehold.co/160x90/16a34a/ffffff?text=BA', streamUrl: 'https://example.com/streams/brasil-agora.m3u8', country: 'Brazil', categories: ['News'], isActive: true },
  { name: 'Rio Ritmos', logoUrl: 'https://placehold.co/160x90/ca8a04/ffffff?text=RR', streamUrl: 'https://example.com/streams/rio-ritmos.m3u8', country: 'Brazil', categories: ['Music', 'Culture'], isActive: true },
  { name: 'Japón Visual', logoUrl: 'https://placehold.co/160x90/df1c41/ffffff?text=JV', streamUrl: 'https://example.com/streams/japon-visual.m3u8', country: 'Japan', categories: ['Culture', 'Documentary'], isActive: true },
  { name: 'Tokyo Kids', logoUrl: 'https://placehold.co/160x90/0ba5ec/ffffff?text=TK', streamUrl: 'https://example.com/streams/tokyo-kids.m3u8', country: 'Japan', categories: ['Kids'], isActive: true }
];
