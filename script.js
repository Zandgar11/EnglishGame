let songs = [];
let timerDuration = 30;
let timeLeft = 0;
let interval = null;

const takeCardBtn = document.getElementById("takeCard");
const hideCardBtn = document.getElementById("hideCard");
const startTimerBtn = document.getElementById("startTimer");
const cardText = document.getElementById("cardText");
const difficultySelect = document.getElementById("difficulty");
const timer1 = document.getElementById("timer1");
const timer2 = document.getElementById("timer2");

const team1 = document.getElementById("team1");
const team2 = document.getElementById("team2");

// Charger les chansons
fetch("convertcsv.json")
  .then(r => r.json())
  .then(data => {
    const keys = ["Titre", "Année", "Artiste", "Difficulté"];
    songs = data.map(row => {
      let o = {};
      keys.forEach((k, i) => o[k] = row[i]);
      return o;
    });
  })
  .catch(err => console.error("Erreur chargement JSON :", err));

takeCardBtn.addEventListener("click", () => {
  if (!songs.length) {
    alert("Les chansons ne sont pas encore chargées !");
    return;
  }

  const diff = difficultySelect.value.toLowerCase();
  switch (diff) {
    case "easy": timerDuration = 30; break;
    case "medium": timerDuration = 45; break;
    case "hard": timerDuration = 60; break;
  }

  const filtered = songs.filter(s => (s.Difficulté || "").toLowerCase() === diff);
  if (!filtered.length) return alert("Aucune chanson pour cette difficulté !");
  const song = filtered[Math.floor(Math.random() * filtered.length)];

  cardText.textContent = `${song.Titre} — ${song.Artiste} (${song.Difficulté})`;
  hideCardBtn.style.display = "block";
  startTimerBtn.disabled = false;
});

hideCardBtn.addEventListener("click", () => {
  cardText.style.filter = "blur(20px)";
  hideCardBtn.style.display = "none";
});

startTimerBtn.addEventListener("click", () => {
  startTimerBtn.disabled = true;
  cardText.style.filter = "blur(0)";
  timeLeft = timerDuration;
  updateTimers();

  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    timeLeft--;
    updateTimers();

    if (timeLeft <= 0) {
      clearInterval(interval);
      interval = null;
      alert("⏰ Temps écoulé !");
      startTimerBtn.disabled = false;
    }
  }, 1000);
});

function updateTimers() {
  timer1.textContent = timeLeft.toString().padStart(2, "0");
  timer2.textContent = timeLeft.toString().padStart(2, "0");
}

// Effet "buzzer" tactile pour les zones d’équipe
function buzz(team) {
  team.classList.add("buzzed");
  setTimeout(() => team.classList.remove("buzzed"), 600);
}

team1.addEventListener("click", () => buzz(team1));
team2.addEventListener("click", () => buzz(team2));
