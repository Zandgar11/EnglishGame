let songs = [];
let time;
let intervalId;

const vBtnTac = document.getElementById("tac");
vBtnTac.addEventListener("click", GetRandomSong);

const vBtnTimer = document.getElementById("timer");
vBtnTimer.addEventListener("click", () => {
  // ⚡ Lancer le Timer normal
  Timer();

  // ⚡ Activer le cooldown visuel
  startCooldown(vBtnTimer, 15000); // 15s
});

// Charger le JSON
fetch('convertcsv.json')
  .then(resp => resp.json())
  .then(data => {
    const keys = ["Titre","Année","Artiste","Difficulté"];
    songs = data.map(row => {
      let obj = {};
      keys.forEach((key, i) => {
        obj[key] = row[i];
      });
      return obj;
    });
    console.log("Songs chargées :", songs);
  })
  .catch(err => console.error("Erreur chargement JSON :", err));

// 🎵 Choisir une chanson
function GetRandomSong() {
  if (songs.length === 0) {
    alert("Les chansons ne sont pas encore chargées !");
    return;
  }

  const difficulty = document.getElementById("difficulté").value;

  switch (difficulty.toLowerCase()) {
    case "easy": time = 30; break;
    case "medium": time = 45; break;
    default: time = 60; break;
  }

  document.getElementById("ClockInfo").textContent = `The clock is set for ${time} seconds`;

  const filtered = songs.filter(song =>
    song.Difficulté.trim().toLowerCase() === difficulty.trim().toLowerCase()
  );

  if (filtered.length === 0) {
    alert("Aucune chanson trouvée pour cette difficulté !");
    return;
  }

  const index = Math.floor(Math.random() * filtered.length);
  const song = filtered[index];

  document.getElementById("resultat").textContent =
    `${song.Titre} - ${song.Artiste}, (${song.Difficulté})`;
}

// ⏱️ Timer
function Timer() {
  if (intervalId) clearInterval(intervalId);

  document.getElementById("ClockInfo").textContent = `Time remaining: ${time} seconds`;

  intervalId = setInterval(() => {
    time--;

    if (time <= 0) {
      clearInterval(intervalId);
      time = 0;
      document.getElementById("ClockInfo").textContent = `Time remaining: ${time} seconds`;
      alert("Time's up !");
    } else {
      document.getElementById("ClockInfo").textContent = `Time remaining: ${time} seconds`;
    }
  }, 1000);
}

// 🔒 Gestion du cooldown
function startCooldown(button, duration) {
  button.disabled = true;

  // Quand la durée est écoulée → réactiver
  setTimeout(() => {
    button.disabled = false;
  }, duration);
}
