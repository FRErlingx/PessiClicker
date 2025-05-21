// ==== Données de base ====
let count = 0;
let pps = 0;
let clickcount = 0;
let clickPower = 1;

const counter      = document.getElementById('counter');
const totalPessis  = document.getElementById('totalpessis');
const pessi        = document.getElementById('pessi');
const factoryList  = document.getElementById('factoryList');
const ppcDisplay   = document.getElementById('ppc'); // Affichage PPC (facultatif si dans HTML)

const clickSound = new Audio('click-sound.wav');
const buySound   = new Audio('buy-sound.wav');
const errorSound = new Audio('error-sound.wav');

const factories = [
  { name: "🖱️ Clicker",       price: 100,     pps: 0,   owned: 0 },
  { name: "🧌 Shrek Swamp Factory",       price: 100,     pps: 1,   owned: 0 },
  { name: "🔥 Gigachad Gym",              price: 1100,     pps: 8,   owned: 0 },
  { name: "🗿 Moai Monument Builders",    price: 12000,    pps: 47,  owned: 0 },
  { name: "🔫 John Wick Arsenal",         price: 130000,    pps: 260,  owned: 0 },
  { name: "😈 Sigma Grindset Studio",     price: 1400000,   pps: 1400,  owned: 0 },
  { name: "🍕 Pizza Time Pizzeria",       price: 20000000,   pps: 7800, owned: 0 },
  { name: "🧠 Chad AI Mainframe",         price: 330000000,   pps: 44000, owned: 0 },
  { name: "🕶️ Matrix Code Generator",    price: 5100000000,  pps: 260000, owned: 0 }
];

// ==== Sauvegarde serveur ====

async function saveGameToServer() {
  const user = JSON.parse(localStorage.getItem('pessiUser'));
  if (!user) return;

  const save = {
    count,
    pps,
    clickcount,
    clickPower,
    factories: factories.map(f => ({
      owned: f.owned,
      price: f.price
    }))
  };

  try {
    await fetch('save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id, saveData: save })
    });
  } catch (e) {
    console.error("Erreur lors de la sauvegarde", e);
  }

  const saveKey = `pessiSave_${user.user_id}`;
  localStorage.setItem(saveKey, JSON.stringify(save));
}

async function loadGameFromServer() {
  const user = JSON.parse(localStorage.getItem('pessiUser'));
  if (!user) return false;

  try {
    const res = await fetch('load.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id })
    });
    const result = await res.json();

    if (result.status === 'success' && result.saveData) {
      const save = result.saveData;
      count = save.count || 0;
      pps = save.pps || 0;
      clickcount = save.clickcount || 0;
      clickPower = save.clickPower || 1;

      if (Array.isArray(save.factories)) {
        save.factories.forEach((sf, i) => {
          if (factories[i]) {
            factories[i].owned = sf.owned || 0;
            factories[i].price = sf.price || factories[i].price;
          }
        });
      }

      return true;
    } else {
      return loadGameFromLocal();
    }
  } catch (e) {
    return loadGameFromLocal();
  }
}

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
    clickPower = save.clickPower || 1;

    if (Array.isArray(save.factories)) {
      save.factories.forEach((sf, i) => {
        if (factories[i]) {
          factories[i].owned = sf.owned || 0;
          factories[i].price = sf.price || factories[i].price;
        }
      });
    }

    return true;
  } catch (e) {
    return false;
  }
}

async function loadGame() {
  await loadGameFromServer();
  updatePPS();
}

// ==== Throttled Save ====

let saveTimeout = null;
function scheduleSave() {
  if (saveTimeout) return;
  saveTimeout = setTimeout(() => {
    saveGameToServer();
    saveTimeout = null;
  }, 10_000);
}

// ==== Init ====

window.addEventListener('load', async () => {
  await loadGame();
  refreshFactoryList();
  updateDisplay();
});

window.addEventListener('pagehide', saveGameToServer);

// ==== Click manuel ====

function getClickPower() {
  return clickPower;
}

pessi.addEventListener('click', e => {
  count += getClickPower();
  clickcount++;
  clickSound.currentTime = 0;
  clickSound.play();
  animateClick();
  createParticle(e.clientX, e.clientY);
  updateDisplay();
  scheduleSave();
});

// ==== Animation et Particules ====

function animateClick() {
  counter.classList.add('pulse');
  setTimeout(() => counter.classList.remove('pulse'), 150);
}

function createParticle(x, y) {
  const particle = document.createElement('img');
  particle.src = pessi.src;
  particle.classList.add('pessi-particle');
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  document.body.appendChild(particle);
  setTimeout(() => particle.remove(), 1000);
}

// ==== Génération passive ====

setInterval(() => {
  count += pps;
  updateDisplay();
  scheduleSave();
}, 1000);

// ==== Affichage ====

function updateDisplay() {
  counter.textContent     = `${Math.floor(count)} Pessis`;
  totalPessis.textContent = Math.floor(count);

  document.querySelector('.stats').innerHTML = `
    <p><strong>Total de pessis :</strong> ${Math.floor(count)}</p>
    <p><strong>Usines possédées :</strong> ${factories.reduce((sum, f) => sum + f.owned, 0)}</p>
    <p><strong>Pessis par seconde (PPS) :</strong> ${pps}</p>
    <p><strong>Pessis par clic (PPC) :</strong> ${clickPower}</p>
    <p><strong>Nombre de clics :</strong> ${clickcount}</p>
  `;

  if (ppcDisplay) {
    ppcDisplay.textContent = `Pessis par clic : ${clickPower}`;
  }
}

function updatePPS() {
  pps = factories.reduce((total, f) => total + (f.pps * f.owned), 0);
}

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

function buyFactory(index) {
  const factory = factories[index];

  if (count >= factory.price) {
    count -= factory.price;
    factory.owned++;
    updatePPS();

    if (index === 0) {
      clickPower *= 2;
      factory.price = Math.floor(factory.price ** 2);
    } else {
      factory.price = Math.floor(factory.price * 1.15);
    }

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
