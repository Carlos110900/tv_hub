async function loadUser() {
  const response = await fetch('/api/users/me');
  if (!response.ok) { location.href = '/login'; return false; }
  const user = await response.json();
  document.querySelector('#welcome').textContent = `Welcome, ${user.email} (${user.role})`;
  return true;
}

const channelList = document.querySelector('#channel-list');
const channelStatus = document.querySelector('#channel-status');
const searchInput = document.querySelector('#channel-search');
let favoriteChannelIds = new Set();

async function loadFavorites() {
  const response = await fetch('/api/favorites');
  if (!response.ok) return;

  const { favorites } = await response.json();
  favoriteChannelIds = new Set(favorites.map((favorite) => favorite.channelId._id));
}

async function toggleFavorite(channelId) {
  const isFavorite = favoriteChannelIds.has(channelId);
  // TODO 4
  // Si el canal ya es favorito, debe quitarse. De lo contrario, debe agregarse.
  // Pista: el método HTTP depende del estado actual.
  const response = await fetch(`/api/favorites/${channelId}`, {
    method: isFavorite ? '_______' : '_______'
  });

  if (!response.ok) {
    channelStatus.textContent = 'Could not update favorites.';
    return;
  }

  if (isFavorite) favoriteChannelIds.delete(channelId);
  else favoriteChannelIds.add(channelId);

  loadChannels(searchInput.value);
}

function createChannelCard(channel) {
  const card = document.createElement('article');
  card.className = 'channel-card';

  const logo = document.createElement('img');
  logo.src = channel.logoUrl;
  logo.alt = `${channel.name} logo`;
  logo.className = 'channel-logo';

  const name = document.createElement('h3');
  name.textContent = channel.name;

  const favoriteButton = document.createElement('button');
  const isFavorite = favoriteChannelIds.has(channel._id);
  favoriteButton.type = 'button';
  favoriteButton.className = 'favorite-button';
  // TODO 5
  // Muestre el estado actual del favorito en la tarjeta.
  // Pista: un favorito usa estrella llena y los demas usan estrella vacia.
  favoriteButton.textContent = isFavorite ? '___' : '___';
  favoriteButton.setAttribute('aria-label', isFavorite ? `Remove ${channel.name} from favorites` : `Add ${channel.name} to favorites`);
  favoriteButton.addEventListener('click', () => toggleFavorite(channel._id));

  const header = document.createElement('div');
  header.className = 'channel-card-header';
  header.append(name, favoriteButton);

  const country = document.createElement('p');
  country.textContent = channel.country;
  country.className = 'channel-country';

  const categories = document.createElement('p');
  categories.textContent = channel.categories.join(', ');
  categories.className = 'channel-categories';

  card.append(logo, header, country, categories);
  return card;
}

function createChannelRow(title, channels) {
  const section = document.createElement('section');
  section.className = 'category-section';

  const heading = document.createElement('h2');
  heading.textContent = title;

  const row = document.createElement('div');
  row.className = 'channel-row';
  row.append(...channels.slice(0, 6).map(createChannelCard));

  section.append(heading, row);
  return section;
}

function displayBrowseCollections(channels) {
  const categoryNames = ['News', 'General', 'Music', 'Entertainment', 'Sports', 'Movies'];
  const favorites = channels.filter((channel) => favoriteChannelIds.has(channel._id));
  const favoriteSection = favorites.length > 0 ? createChannelRow('Your favorites', favorites) : null;
  if (favoriteSection) favoriteSection.id = 'favorites';
  const collections = [
    ...(favoriteSection ? [favoriteSection] : []),
    createChannelRow('Featured channels', channels),
    ...categoryNames
      .map((category) => ({
        category,
        channels: channels.filter((channel) => channel.categories.includes(category))
      }))
      .filter(({ channels }) => channels.length > 0)
      .map(({ category, channels }) => createChannelRow(category, channels))
  ];

  channelList.replaceChildren(...collections);
}

function displaySearchResults(channels, search) {
  const section = document.createElement('section');
  section.className = 'category-section';

  const heading = document.createElement('h2');
  heading.textContent = `Results for “${search}”`;

  const results = document.createElement('div');
  results.className = 'search-results';
  results.append(...channels.map(createChannelCard));

  section.append(heading, results);
  channelList.replaceChildren(section);
}

async function loadChannels(search = '') {
  channelStatus.textContent = 'Loading channels from the backend…';
  const query = search ? `?${new URLSearchParams({ search })}` : '';
  const response = await fetch(`/api/channels${query}`);

  if (!response.ok) {
    channelStatus.textContent = 'Could not load channels.';
    return;
  }

  const { channels } = await response.json();
  channelStatus.textContent = `${channels.length} channel${channels.length === 1 ? '' : 's'} available`;

  if (search) {
    displaySearchResults(channels, search);
    return;
  }

  displayBrowseCollections(channels);
}

searchInput.addEventListener('input', () => loadChannels(searchInput.value));
document.querySelector('#logout').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  location.href = '/login';
});
async function start() {
  const hasSession = await loadUser();
  if (!hasSession) return;

  await loadFavorites();
  loadChannels();
}

start();
