// ==== Données de base ====
let count = 0;
let pps = 0;

const counter = document.getElementById('counter');
const totalPessis = document.getElementById('totalpessis');
const pessi = document.getElementById('pessi');
const factoryList = document.getElementById('factoryList');

const clickSound = new Audio('click-sound.wav');
const buySound = new Audio('buy-sound.wav');
const errorSound = new Audio('error-sound.wav');

const factories = [
  { name: "🧌 Shrek Swamp Factory", price: 10, pps: 1, owned: 0 },
  { name: "🔥 Gigachad Gym", price: 50, pps: 5, owned: 0 },
  { name: "🗿 Moai Monument Builders", price: 150, pps: 10, owned: 0 },
  { name: "🔫 John Wick Arsenal", price: 400, pps: 25, owned: 0 },
  { name: "😈 Sigma Grindset Studio", price: 1000, pps: 60, owned: 0 },
  { name: "🍕 Pizza Time Pizzeria", price: 2000, pps: 100, owned: 0 },
  { name: "🧠 Chad AI Mainframe", price: 5000, pps: 200, owned: 0 },
  { name: "🕶️ Matrix Code Generator", price: 10000, pps: 400, owned: 0 }
];

// ==== Click manuel ====
pessi.addEventListener('click', (e) => {
  count++;
  clickSound.currentTime = 0;
  clickSound.play();
  animateClick();
  updateDisplay();
  createParticle(e.clientX, e.clientY);
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
  particle.style.top = `${y}px`;

  document.body.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 1000);
}

// ==== Génération passive de pessis ====
setInterval(() => {
  count += pps;
  updateDisplay();
}, 1000);

// ==== Mise à jour de l'affichage ====
function updateDisplay() {
  counter.textContent = `${Math.floor(count)} Pessis`;
  totalPessis.textContent = Math.floor(count);

  document.querySelector('.stats').innerHTML = `
    <p>Total de pessis : <span id="totalpessis">${Math.floor(count)}</span></p>
    <p>Usines possédées : ${factories.reduce((sum, f) => sum + f.owned, 0)}</p>
    <p>pessis par seconde : ${pps}</p>
  `;
}

// ==== Affichage dynamique des usines ====
function refreshFactoryList() {
  factoryList.innerHTML = '';
  factories.forEach((factory, index) => {
    const el = document.createElement('div');
    el.classList.add('factory');
    el.innerHTML = `${factory.name} — ${factory.price} 🪙 (${factory.owned})`;
    el.addEventListener('click', () => buyFactory(index));
    factoryList.appendChild(el);
  });
}

// ==== Achat d'usine ====
function buyFactory(index) {
  const factory = factories[index];
  if (count >= factory.price) {
    count -= factory.price;
    factory.owned++;
    pps += factory.pps;
    factory.price = Math.floor(factory.price * 1.15);

    buySound.currentTime = 0;
    buySound.play();

    updateDisplay();
    refreshFactoryList();
  } else {
    errorSound.currentTime = 0;
    errorSound.play();
  }
}

// ==== Initialisation ====
refreshFactoryList();
updateDisplay();
