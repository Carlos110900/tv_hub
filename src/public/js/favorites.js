async function loadUser() {
  const response = await fetch('/api/users/me');
  if (!response.ok) {
    location.href = '/login';
    return false;
  }

  return true;
}

const favoritesList = document.querySelector('#favorites-list');
const favoritesStatus = document.querySelector('#favorites-status');

function createFavoriteItem(favorite) {
  const item = document.createElement('li');
  const name = document.createElement('span');

  // TODO 6C
  // Muestre el nombre del canal favorito.
  // Pista: el Channel poblado esta disponible dentro de channelId.
  name.textContent = favorite.channelId.________;

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'remove-favorite';
  removeButton.textContent = '★';
  removeButton.setAttribute('aria-label', `Remove ${favorite.channelId.name} from favorites`);
  removeButton.addEventListener('click', () => removeFavorite(favorite.channelId._id));

  item.append(name, removeButton);
  return item;
}

async function loadFavorites() {
  // TODO 6B
  // Recupere los favoritos del usuario autenticado.
  // Pista: use el endpoint de favoritos que ya ofrece el backend.
  const response = await fetch('________________');

  if (!response.ok) {
    favoritesStatus.textContent = 'Could not load favorites.';
    return;
  }

  const { favorites } = await response.json();
  favoritesList.replaceChildren(...favorites.map(createFavoriteItem));
  favoritesStatus.textContent = `${favorites.length} favorite${favorites.length === 1 ? '' : 's'}`;
}

async function removeFavorite(channelId) {
  // TODO 6D
  // Quite este canal de los favoritos del usuario.
  // Pista: ¿qué método HTTP elimina un recurso?
  const response = await fetch(`/api/favorites/${channelId}`, {
    method: '_______'
  });

  if (response.ok) {
    await loadFavorites();
  }
}

async function start() {
  const hasSession = await loadUser();
  if (hasSession) await loadFavorites();
}

start();
