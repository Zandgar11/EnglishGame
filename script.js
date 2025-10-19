let songs = [];
let time = 0;
let timerDuration = null; // fixe en secondes (30/45/60)
let intervalId = null;

const vBtnTac = document.getElementById("tac");
const vBtnTimer = document.getElementById("timer");
const resultatEl = document.getElementById("resultat");
const clockEl = document.getElementById("ClockInfo");
const difficultySelect = document.getElementById("difficulté");

// bouton désactivé par défaut tant qu'aucune carte n'a été prise
vBtnTimer.disabled = true;

vBtnTac.addEventListener("click", GetRandomSong);
vBtnTimer.addEventListener("click", () => {
  if (vBtnTimer.disabled) return; // sécurité
  // applique la variable CSS en secondes (ex: "30s") AVANT de désactiver le bouton
  vBtnTimer.style.setProperty('--cooldown-duration', `${timerDuration}s`);
  // désactive le bouton pour déclencher :disabled et l'animation CSS
  vBtnTimer.disabled = true;
  // démarre le timer (la réactivation aura lieu à la fin du timer)
  Timer();
});

// Charger le JSON (convertcsv.json doit être dans le même dossier)
fetch('convertcsv.json')
  .then(resp => resp.json())
  .then(data => {
    const keys = ["Titre","Année","Artiste","Difficulté"];
    songs = data.map(row => {
      let obj = {};
      keys.forEach((key, i) => obj[key] = row[i]);
      return obj;
    });
    console.log("Songs chargées :", songs);
  })
  .catch(err => console.error("Erreur chargement JSON :", err));

// Choisir une chanson
function GetRandomSong() {
  if (!songs || songs.length === 0) {
    alert("Les chansons ne sont pas encore chargées !");
    return;
  }

  const difficulty = difficultySelect.value || "Easy";

  switch (difficulty.toLowerCase()) {
    case "easy": timerDuration = 30; break;
    case "medium": timerDuration = 45; break;
    default: timerDuration = 60; break;
  }

  // reset compteur et affichage
  time = timerDuration;
  clockEl.textContent = `The clock is set for ${time} seconds`;

  const filtered = songs.filter(song =>
    String(song.Difficulté || "").trim().toLowerCase() === difficulty.trim().toLowerCase()
  );

  if (filtered.length === 0) {
    alert("Aucune chanson trouvée pour cette difficulté !");
    return;
  }

  const index = Math.floor(Math.random() * filtered.length);
  const song = filtered[index];
  resultatEl.textContent = `${song.Titre} - ${song.Artiste}, (${song.Difficulté})`;

  // Activer le bouton "Set Timer" (maintient l'état si on relance une nouvelle carte)
  vBtnTimer.disabled = false;

  // Si un timer était en cours, on l'arrête (sécurité)
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Timer
function Timer() {
  if (intervalId) clearInterval(intervalId);

  // affichage initial
  clockEl.textContent = `Time remaining: ${time} seconds`;

  intervalId = setInterval(() => {
    time--;

    if (time <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      time = 0;
      clockEl.textContent = `Time remaining: ${time} seconds`;
      alert("Time's up !");
      // réactiver le bouton seulement après la fin effective du timer
      vBtnTimer.disabled = false;
      // (optionnel) retirer la variable CSS pour remettre l'animation à l'état initial
      // vBtnTimer.style.removeProperty('--cooldown-duration');
    } else {
      clockEl.textContent = `Time remaining: ${time} seconds`;
    }
  }, 1000);
}
