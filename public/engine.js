/* ===============================
   GAMEHUB CORE ENGINE
   =============================== */

/* ---------- GLOBAL STATE ---------- */
const Engine = {
  user: {
    id: null,
    name: "Guest",
    xp: 0,
    unlocked: []
  },
  currentGame: null,
  games: []
};

/* ---------- LOAD USER ---------- */
function loadUser() {
  const saved = localStorage.getItem("gamehub_user");
  if (saved) {
    Engine.user = JSON.parse(saved);
  } else {
    saveUser();
  }
}

function saveUser() {
  localStorage.setItem("gamehub_user", JSON.stringify(Engine.user));
}

/* ---------- XP SYSTEM ---------- */
function addXP(amount) {
  Engine.user.xp += amount;
  unlockGames();
  saveUser();
}

function unlockGames() {
  Engine.games.forEach(game => {
    if (
      !Engine.user.unlocked.includes(game.id) &&
      Engine.user.xp >= game.xpRequired
    ) {
      Engine.user.unlocked.push(game.id);
    }
  });
}

/* ---------- LOAD GAMES ---------- */
function loadGames(gameList) {
  Engine.games = gameList;
  unlockGames();
}

/* ---------- GAME ACCESS ---------- */
function canPlay(gameId) {
  return Engine.user.unlocked.includes(gameId);
}

function launchGame(gameId) {
  const game = Engine.games.find(g => g.id === gameId);
  if (!game) {
    window.location.href = "404.html";
    return;
  }

  if (!canPlay(gameId)) {
    alert("Game locked. Play more to unlock.");
    return;
  }

  localStorage.setItem("current_game", JSON.stringify(game));
  window.location.href = "game.html";
}

/* ---------- LOAD CURRENT GAME ---------- */
function loadCurrentGame() {
  const saved = localStorage.getItem("current_game");
  if (!saved) {
    window.location.href = "404.html";
    return;
  }

  Engine.currentGame = JSON.parse(saved);
  return Engine.currentGame;
}

/* ---------- GAME COMPLETE ---------- */
function completeGame(xpReward = 10) {
  addXP(xpReward);
}

/* ---------- UI HELPERS ---------- */
function createGameCard(game) {
  const card = document.createElement("div");
  card.className = "game-card";

  const title = document.createElement("h3");
  title.textContent = game.name;

  const genre = document.createElement("p");
  genre.textContent = game.genre;

  const button = document.createElement("button");

  if (canPlay(game.id)) {
    button.textContent = "Play";
    button.onclick = () => launchGame(game.id);
  } else {
    button.textContent = `Locked (${game.xpRequired} XP)`;
    button.disabled = true;
  }

  card.appendChild(title);
  card.appendChild(genre);
  card.appendChild(button);

  return card;
}

/* ---------- RENDER GRID ---------- */
function renderGames(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  Engine.games.forEach(game => {
    container.appendChild(createGameCard(game));
  });
}

/* ---------- SETTINGS ---------- */
function resetProgress() {
  if (!confirm("Reset all progress?")) return;
  localStorage.clear();
  location.reload();
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadUser();
});
