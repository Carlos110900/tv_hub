async function loadUser() {
  const response = await fetch('/api/users/me');
  if (!response.ok) { location.href = '/login'; return; }
  const user = await response.json();
  document.querySelector('#welcome').textContent = `Welcome, ${user.email} (${user.role})`;
}

const channelList = document.querySelector('#channel-list');
const channelStatus = document.querySelector('#channel-status');
const searchInput = document.querySelector('#channel-search');

function createChannelCard(channel) {
  const card = document.createElement('article');
  card.className = 'channel-card';

  const logo = document.createElement('img');
  logo.src = channel.logoUrl;
  logo.alt = `${channel.name} logo`;
  logo.className = 'channel-logo';

  const name = document.createElement('h3');
  name.textContent = channel.name;

  const country = document.createElement('p');
  country.textContent = channel.country;
  country.className = 'channel-country';

  const categories = document.createElement('p');
  categories.textContent = channel.categories.join(' · ');
  categories.className = 'channel-categories';

  card.append(logo, name, country, categories);
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
  const collections = [
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
loadUser();
loadChannels();
