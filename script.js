let songs = [];
let currentSong = null;
let timerDuration = 30;
let timeLeft = 0;
let interval = null;
let isPaused = false;
let scores = { team1: 0, team2: 0 };

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
    if (!data?.length) throw new Error("vide");
    if (Array.isArray(data[0])) {
      const keys = ["Titre", "Année", "Artiste", "Difficulté"];
      songs = data.map(r => Object.fromEntries(keys.map((k, i) => [k, r[i]])));
    } else songs = data;
    console.log(`✅ ${songs.length} chansons`);
  })
  .catch(() => showNotice("⚠️ Erreur chargement chansons"));

takeCardBtn.addEventListener("click", () => {
  if (!songs.length) return showNotice("⏳ Chargement...");
  const diff = difficultySelect.value.toLowerCase();
  timerDuration = diff === "hard" ? 60 : diff === "medium" ? 45 : 30;
  const filtered = songs.filter(s => (s.Difficulté || "").trim().toLowerCase() === diff);
  if (!filtered.length) return showNotice("😕 Aucune chanson !");
  currentSong = filtered[Math.floor(Math.random() * filtered.length)];
  cardText.textContent = `${currentSong.Titre} — ${currentSong.Artiste}`;
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
    if (!isPaused) timeLeft--;
    updateTimers();
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
      <h3>${team.classList.contains("team1") ? "Team 1" : "Team 2"} buzzed!</h3>
      <button id="yesBtn">✅ Good guess!</button>
      <button id="noBtn">❌ Bad guess!</button>
    </div>
  `;
  document.body.appendChild(popup);

  document.getElementById("yesBtn").addEventListener("click", () => {
    endRound(team, true);
  });
  document.getElementById("noBtn").addEventListener("click", () => {
    endRound(team, false);
  });
}

function endRound(team, correct) {
  if (popup) popup.remove();
  popup = null;
  isPaused = false;
  clearInterval(interval);

  const teamName = team.classList.contains("team1") ? "Team 1" : "Team 2";
  const opponent = team.classList.contains("team1") ? "team2" : "team1";

  if (correct) scores[team.classList.contains("team1") ? "team1" : "team2"]++;
  else scores[opponent]++;

  showEndOverlay(
    correct ? `${teamName} guessed correctly!` : `${teamName} was wrong...`,
    currentSong,
    scores
  );

  startTimerBtn.disabled = false;
}

function showEndOverlay(message, song, scores) {
  if (endOverlay) endOverlay.remove();
  endOverlay = document.createElement("div");
  endOverlay.className = "end-overlay";
  endOverlay.innerHTML = `
    <div class="end-inner">
      <h2>${message}</h2>
      ${
        song
          ? `<p class="song-info"><strong>${song.Titre}</strong><br>${song.Artiste} (${song.Année})</p>`
          : ""
      }
      <p class="score">🏅 Team 1: ${scores.team1} | 🏅 Team 2: ${scores.team2}</p>
      <button id="closeEndBtn">Next round</button>
    </div>
  `;
  document.body.appendChild(endOverlay);

  document.getElementById("closeEndBtn").addEventListener("click", () => {
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
