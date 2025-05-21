document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) return;

  const messageDiv = document.getElementById('loginMessage');
  messageDiv.style.color = 'black';
  messageDiv.textContent = 'Chargement...';

  try {
    const response = await fetch('auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (response.ok) {
      if (result.status === 'connected') {
        messageDiv.style.color = 'green';
        messageDiv.textContent = `Connecté en tant que ${result.username}`;
        localStorage.setItem('pessiUser', JSON.stringify(result));
      } else if (result.status === 'registered') {
        messageDiv.style.color = 'green';
        messageDiv.textContent = `Compte créé ! Bienvenue, ${result.username}`;
        localStorage.setItem('pessiUser', JSON.stringify(result));
      }

      if (result.status === 'connected' || result.status === 'registered') {
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }
    } else {
      messageDiv.style.color = 'red';
      messageDiv.textContent = result.error || 'Erreur inconnue';
    }
  } catch (error) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'Erreur réseau';
    console.error(error);
  }
});
