let songs = [];
let currentSong = null;
let timerDuration = 30;
let timeLeft = 0;
let interval = null;
let isPaused = false;

const takeCardBtn = document.getElementById("takeCard");
const hideCardBtn = document.getElementById("hideCard");
const startTimerBtn = document.getElementById("startTimer");
const cardText = document.getElementById("cardText");
const difficultySelect = document.getElementById("difficulty");
const timer1 = document.getElementById("timer1");
const timer2 = document.getElementById("timer2");
const team1 = document.getElementById("team1");
const team2 = document.getElementById("team2");
let popup = null;
let endOverlay = null;

fetch("convertcsv.json")
  .then(r => r.json())
  .then(data => {
    if (!data || !data.length) throw new Error("Fichier vide");
    if (Array.isArray(data[0])) {
      const keys = ["Titre", "Année", "Artiste", "Difficulté"];
      songs = data.map(row => {
        const obj = {};
        keys.forEach((k, i) => (obj[k] = row[i]));
        return obj;
      });
    } else if (typeof data[0] === "object") {
      songs = data;
    } else {
      throw new Error("Format JSON inconnu");
    }
    console.log(`✅ ${songs.length} chansons chargées`);
  })
  .catch(err => {
    console.error("Erreur chargement JSON :", err);
    showNotice("⚠️ Erreur : impossible de charger les chansons !");
  });

takeCardBtn.addEventListener("click", () => {
  if (!songs.length) {
    showNotice("⏳ Les chansons ne sont pas encore chargées !");
    return;
  }
  const diff = difficultySelect.value.toLowerCase();
  switch (diff) {
    case "easy":
      timerDuration = 30;
      break;
    case "medium":
      timerDuration = 45;
      break;
    case "hard":
      timerDuration = 60;
      break;
  }
  const filtered = songs.filter(s => (s.Difficulté || "").trim().toLowerCase() === diff);
  if (!filtered.length) {
    showNotice("😕 Aucune chanson trouvée pour cette difficulté !");
    return;
  }
  currentSong = filtered[Math.floor(Math.random() * filtered.length)];
  cardText.textContent = `${currentSong.Titre} — ${currentSong.Artiste} (${currentSong.Difficulté})`;
  cardText.style.filter = "blur(0)";
  hideCardBtn.style.display = "block";
  startTimerBtn.disabled = false;
});

hideCardBtn.addEventListener("click", () => {
  cardText.style.filter = "blur(20px)";
  hideCardBtn.style.display = "none";
});

startTimerBtn.addEventListener("click", () => {
  startTimerBtn.disabled = true;
  startTimer();
});

function startTimer() {
  timeLeft = timerDuration;
  updateTimers();
  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    if (!isPaused) {
      timeLeft--;
      updateTimers();
    }
    if (timeLeft <= 0) {
      clearInterval(interval);
      interval = null;
      showNotice("⏰ Temps écoulé !");
      startTimerBtn.disabled = false;
    }
  }, 1000);
}

function updateTimers() {
  timer1.textContent = timeLeft.toString().padStart(2, "0");
  timer2.textContent = timeLeft.toString().padStart(2, "0");
}

function buzz(team) {
  if (isPaused || timeLeft <= 0) return;
  team.classList.add("buzzed");
  setTimeout(() => team.classList.remove("buzzed"), 400);
  isPaused = true;
  showPopup(team);
}

team1.addEventListener("click", () => buzz(team1));
team2.addEventListener("click", () => buzz(team2));

function showPopup(team) {
  if (popup) popup.remove();
  popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = `
    <div class="popup-inner">
      <h3>${team === team1 ? "Team 1" : "Team 2"} buzzed!</h3>
      <button id="yesBtn">✅ Bonne réponse</button>
      <button id="noBtn">❌ Mauvaise réponse</button>
    </div>
  `;
  document.body.appendChild(popup);

  document.getElementById("yesBtn").addEventListener("click", () => {
    endRound(team);
  });

  document.getElementById("noBtn").addEventListener("click", () => {
    const otherTeam = team === team1 ? team2 : team1;
    endRound(otherTeam);
  });
}

function endRound(team) {
  if (popup) popup.remove();
  popup = null;
  isPaused = false;
  clearInterval(interval);
  if (currentSong) {
    showEndOverlay(team === team1 ? "Team 1" : "Team 2", currentSong);
  } else {
    showEndOverlay(team === team1 ? "Team 1" : "Team 2", null);
  }
  startTimerBtn.disabled = false;
}

function showEndOverlay(teamName, song) {
  if (endOverlay) endOverlay.remove();
  endOverlay = document.createElement("div");
  endOverlay.className = "end-overlay";
  endOverlay.innerHTML = `
    <div class="end-inner">
      <h2>🏆 ${teamName} gagne la manche !</h2>
      ${song ? `<p class="song-info"><strong>${song.Titre}</strong><br>${song.Artiste} (${song.Année})</p>` : ""}
      <button id="closeEndBtn">Manche suivante</button>
    </div>
  `;
  document.body.appendChild(endOverlay);
  const closeBtn = document.getElementById("closeEndBtn");
  closeBtn.addEventListener("click", () => {
    endOverlay.classList.add("fade-out");
    setTimeout(() => endOverlay.remove(), 400);
  });
}

function showNotice(text) {
  const div = document.createElement("div");
  div.className = "notice";
  div.textContent = text;
  document.body.appendChild(div);
  setTimeout(() => div.classList.add("visible"), 10);
  setTimeout(() => {
    div.classList.remove("visible");
    setTimeout(() => div.remove(), 400);
  }, 2500);
}
