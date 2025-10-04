let songs = [];
let time;

const vBtnTac = document.getElementById("tac");
vBtnTac.addEventListener("click", GetRandomSong);

const vBtnTimer = document.getElementById("timer");
vBtnTimer.addEventListener("click", Timer)

fetch('convertcsv.json')
  .then(resp => resp.json())
  .then(data => {
    // data = [["Imagine",1971,"John Lennon","Easy"], ...]
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

function GetRandomSong() {
    if (songs.length === 0) {
        alert("Les chansons ne sont pas encore chargées !");
        return;
    }

    const difficulty = document.getElementById("difficulté").value;

    switch (difficulty.toLowerCase()) {
        case "easy":
            time = 90;
            break;

        case "medium":
            time = 60;
            break;

        default:
            time = 30;
            break;
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

    document.getElementById("resultat").textContent = `${song.Titre}  - ${song.Artiste}, (${song.Difficulté})`;
}

function Timer() {
    let intervalId; // pour pouvoir stopper le timer
    // stopper un ancien timer si il existe
    if (intervalId) clearInterval(intervalId);

    // afficher immédiatement le temps au départ
    document.getElementById("ClockInfo").textContent = `Time remaining: ${time} seconds`;

    intervalId = setInterval(() => {
        time--; // décrémente le compteur

        if (time <= 0) {
            clearInterval(intervalId); // stop le timer
            time = 0; // reset le temps
            document.getElementById("ClockInfo").textContent = `Time remaining: ${time} seconds`;
            alert("Time's up !");
        } else {
            document.getElementById("ClockInfo").textContent = `Time remaining: ${time} seconds`;
        }
    }, 1000);
}



