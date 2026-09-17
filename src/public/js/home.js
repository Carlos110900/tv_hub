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
  // TODO 3 implementado: logoUrl se usa como origen de la imagen.
  logo.src = channel.logoUrl;
  logo.alt = `${channel.name} logo`;
  logo.className = 'channel-logo';

  const name = document.createElement('h3');
  // TODO 2 implementado: name se muestra como título de la tarjeta.
  name.textContent = channel.name;

  const country = document.createElement('p');
  // MISIÓN OPCIONAL A implementada: country se muestra debajo del nombre.
  country.textContent = channel.country;
  country.className = 'channel-country';

  const categories = document.createElement('p');
  // TODO 4 implementado: join convierte las categorías en texto separado por ·.
  categories.textContent = channel.categories.join(' · ');
  categories.className = 'channel-categories';

  card.append(logo, name, country, categories);
  return card;
}

function displayChannels(channels) {
  channelList.replaceChildren(...channels.map(createChannelCard));
  channelStatus.textContent = `${channels.length} channel${channels.length === 1 ? '' : 's'} from MongoDB`;
}

async function loadChannels(search = '') {
  channelStatus.textContent = 'Loading channels from the backend…';
  // TODO 5 implementado: search se envía al parámetro que ya reconoce la API.
  const query = search ? `?${new URLSearchParams({ search })}` : '';
  const response = await fetch(`/api/channels${query}`);

  if (!response.ok) {
    channelStatus.textContent = 'Could not load channels.';
    return;
  }

  const { channels } = await response.json();
  displayChannels(channels);
}

searchInput.addEventListener('input', () => loadChannels(searchInput.value));
document.querySelector('#logout').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  location.href = '/login';
});
loadUser();
loadChannels();
