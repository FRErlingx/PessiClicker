// ==== Données de base ====
let count = 0;
let pps = 0;
let clickcount = 0;

const counter      = document.getElementById('counter');
const totalPessis  = document.getElementById('totalpessis');
const pessi        = document.getElementById('pessi');
const factoryList  = document.getElementById('factoryList');

const clickSound = new Audio('click-sound.wav');
const buySound   = new Audio('buy-sound.wav');
const errorSound = new Audio('error-sound.wav');

const factories = [
  { name: "🧌 Shrek Swamp Factory",       price: 10,     pps: 1,   owned: 0 },
  { name: "🔥 Gigachad Gym",              price: 50,     pps: 5,   owned: 0 },
  { name: "🗿 Moai Monument Builders",    price: 150,    pps: 10,  owned: 0 },
  { name: "🔫 John Wick Arsenal",         price: 400,    pps: 25,  owned: 0 },
  { name: "😈 Sigma Grindset Studio",     price: 1000,   pps: 60,  owned: 0 },
  { name: "🍕 Pizza Time Pizzeria",       price: 2000,   pps: 100, owned: 0 },
  { name: "🧠 Chad AI Mainframe",         price: 5000,   pps: 200, owned: 0 },
  { name: "🕶️ Matrix Code Generator",    price: 10000,  pps: 400, owned: 0 }
];

// ==== Sauvegarde / Chargement avec utilisateur connecté via serveur ====

// Envoie la sauvegarde au serveur en POST JSON
async function saveGameToServer() {
  const user = JSON.parse(localStorage.getItem('pessiUser'));
  if (!user) {
    console.warn('Pas d’utilisateur connecté, sauvegarde serveur ignorée');
    return;
  }
  const save = {
    count,
    pps,
    clickcount,
    factories: factories.map(f => ({
      owned: f.owned,
      price: f.price
    }))
  };

  console.log('Sauvegarde envoyée au serveur:', JSON.stringify(save)); // Log debug

  try {
    const response = await fetch('save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id, saveData: save })
    });
    const result = await response.json();
    if (result.status !== 'success') {
      console.error('Erreur sauvegarde serveur :', result.error || result);
    } else {
      console.log('Sauvegarde serveur réussie');
    }
  } catch (e) {
    console.error('Erreur réseau sauvegarde serveur :', e);
  }

  // Sauvegarde locale en backup
  const saveKey = `pessiSave_${user.user_id}`;
  localStorage.setItem(saveKey, JSON.stringify(save));
}

// Charge la sauvegarde depuis le serveur en POST JSON
async function loadGameFromServer() {
  const user = JSON.parse(localStorage.getItem('pessiUser'));
  if (!user) {
    alert('Veuillez vous connecter avant de jouer');
    window.location.href = 'main.html';
    return false;
  }

  try {
    const response = await fetch('load.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id })
    });
    const result = await response.json();

    if (result.status === 'success' && result.saveData) {
      const save = result.saveData;
      count = save.count || 0;
      pps = save.pps || 0;
      clickcount = save.clickcount || 0;

      if (Array.isArray(save.factories)) {
        save.factories.forEach((sf, i) => {
          if (factories[i]) {
            factories[i].owned = sf.owned || 0;
            factories[i].price = sf.price || factories[i].price;
          }
        });
      } else {
        console.warn('factories dans sauvegarde invalide:', save.factories);
      }

      console.log('Chargement serveur réussi', factories);
      return true;
    } else if (result.status === 'no_save') {
      console.log('Aucune sauvegarde serveur trouvée, tentative chargement locale...');
      return loadGameFromLocal();
    } else {
      console.error('Erreur chargement serveur :', result.error || result);
      return loadGameFromLocal();
    }
  } catch (e) {
    console.error('Erreur réseau chargement serveur :', e);
    return loadGameFromLocal();
  }
}

// Chargement depuis localStorage si serveur indisponible ou pas de sauvegarde
function loadGameFromLocal() {
  const user = JSON.parse(localStorage.getItem('pessiUser'));
  if (!user) return false;
  const saveKey = `pessiSave_${user.user_id}`;
  const raw = localStorage.getItem(saveKey);
  if (!raw) return false;

  try {
    const save = JSON.parse(raw);
    count = save.count || 0;
    pps = save.pps || 0;
    clickcount = save.clickcount || 0;

    if (Array.isArray(save.factories)) {
      save.factories.forEach((sf, i) => {
        if (factories[i]) {
          factories[i].owned = sf.owned || 0;
          factories[i].price = sf.price || factories[i].price;
        }
      });
    }

    console.log('Chargement local réussi', factories);
    return true;
  } catch (e) {
    console.warn('Sauvegarde locale corrompue, réinitialisation :', e);
    localStorage.removeItem(saveKey);
    return false;
  }
}

// Remplacer la fonction loadGame par celle qui charge depuis serveur (avec fallback)
async function loadGame() {
  await loadGameFromServer();
  updatePPS();
}

// ==== Throttled save (max toutes les 10s) ====

let saveTimeout = null;
function scheduleSave() {
  if (saveTimeout) return;
  saveTimeout = setTimeout(() => {
    saveGameToServer();
    saveTimeout = null;
  }, 10_000);
}

// ==== Initialisation au chargement de la page ====

window.addEventListener('load', async () => {
  await loadGame();
  refreshFactoryList();
  updateDisplay();
});

// Sauvegarde à la fermeture / changement d’onglet
window.addEventListener('pagehide', saveGameToServer);

// ==== Click manuel ====

pessi.addEventListener('click', e => {
  count++;
  clickcount++;
  clickSound.currentTime = 0;
  clickSound.play();
  animateClick();
  createParticle(e.clientX, e.clientY);
  updateDisplay();
  scheduleSave();
});

// ==== Animation de clic ====

function animateClick() {
  counter.classList.add('pulse');
  setTimeout(() => counter.classList.remove('pulse'), 150);
}

// ==== Particules ====

function createParticle(x, y) {
  const particle = document.createElement('img');
  particle.src = pessi.src;
  particle.classList.add('pessi-particle');
  particle.style.left = `${x}px`;
  particle.style.top  = `${y}px`;
  document.body.appendChild(particle);
  setTimeout(() => particle.remove(), 1000);
}

// ==== Génération passive de pessis ====

setInterval(() => {
  count += pps;
  updateDisplay();
  scheduleSave();
}, 1000);

// ==== Mise à jour de l'affichage ====

function updateDisplay() {
  counter.textContent     = `${Math.floor(count)} Pessis`;
  totalPessis.textContent = Math.floor(count);
  document.querySelector('.stats').innerHTML = `
    <p>Total de pessis           : ${Math.floor(count)}</p>
    <p>Usines possédées          : ${factories.reduce((sum, f) => sum + f.owned, 0)}</p>
    <p>Pessis par seconde (PPS)  : ${pps}</p>
    <p>Nombre de clic            : ${clickcount}</p>
  `;
}

// ==== Mise à jour du PPS (recalcule total) ====

function updatePPS() {
  pps = factories.reduce((total, f) => total + (f.pps * f.owned), 0);
}

// ==== Affichage dynamique des usines ====

function refreshFactoryList() {
  factoryList.innerHTML = '';
  factories.forEach((factory, index) => {
    const el = document.createElement('div');
    el.classList.add('factory');
    el.textContent = `${factory.name} — ${factory.price} 🪙 (${factory.owned})`;
    el.addEventListener('click', () => buyFactory(index));
    factoryList.appendChild(el);
  });
}

// ==== Achat d'usine ====

function buyFactory(index) {
  const factory = factories[index];
  console.log(`Tentative d'achat usine "${factory.name}": avant owned=${factory.owned}, prix=${factory.price}, count=${count}`);

  if (count >= factory.price) {
    count -= factory.price;
    factory.owned++;
    updatePPS();
    factory.price = Math.floor(factory.price * 1.15);

    console.log(`Usine "${factory.name}" achetée: now owned=${factory.owned}, nouveau prix=${factory.price}`);

    buySound.currentTime = 0;
    buySound.play();

    updateDisplay();
    refreshFactoryList();
    scheduleSave();
  } else {
    errorSound.currentTime = 0;
    errorSound.play();
    console.warn(`Pas assez de pessis pour acheter "${factory.name}"`);
  }
}
