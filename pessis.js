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

// ==== Sauvegarde / Chargement ====

function saveGame() {
  const save = {
    count,
    pps,
    clickcount,
    factories: factories.map(f => ({
      owned: f.owned,
      price: f.price
    }))
  };
  try {
    localStorage.setItem('pessiSave', JSON.stringify(save));
  } catch (e) {
    console.error('Erreur de sauvegarde :', e);
  }
}

function loadGame() {
  const raw = localStorage.getItem('pessiSave');
  if (!raw) return;
  try {
    const save = JSON.parse(raw);
    count = save.count;
    pps   = save.pps;
    clickcount = save.clickcount;
    save.factories.forEach((sf, i) => {
      factories[i].owned = sf.owned;
      factories[i].price = sf.price;
    });
  } catch (e) {
    console.warn('Sauvegarde corrompue, réinitialisation :', e);
    localStorage.removeItem('pessiSave');
  }
}

// ==== Throttled save (max toutes les 10s) ====

let saveTimeout = null;
function scheduleSave() {
  if (saveTimeout) return;
  saveTimeout = setTimeout(() => {
    saveGame();
    saveTimeout = null;
  }, 10_000);
}

// ==== Initialisation au chargement de la page ====

window.addEventListener('load', () => {
  loadGame();
  refreshFactoryList();
  updateDisplay();
});

// Sauvegarde à la fermeture / changement d’onglet
window.addEventListener('pagehide', saveGame);
// (pour compatibilité étendue, tu peux aussi activer beforeunload)

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
    <p>Total de pessis       : ${Math.floor(count)}</p>
    <p>Usines possédées      : ${factories.reduce((sum, f) => sum + f.owned, 0)}</p>
    <p>Pessis par seconde (PPS) : ${pps}</p>
    <p>Nombre de clic : ${clickcount}</p>
  `;
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
  if (count >= factory.price) {
    count   -= factory.price;
    factory.owned++;
    pps     += factory.pps;
    factory.price = Math.floor(factory.price * 1.15);

    buySound.currentTime = 0;
    buySound.play();

    updateDisplay();
    refreshFactoryList();
    scheduleSave();
  } else {
    errorSound.currentTime = 0;
    errorSound.play();
  }
}
