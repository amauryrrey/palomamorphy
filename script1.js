const songs = [
    "todo_a_medias",
    "(sola)",
    "un_tipo_nuevo",
    "Au",
    "como_te_vas",
    "Filofobia",
    "La_idiota_soy_yo",
    "la_mente_de_una_paloma",
    "lo_que_un_dia_fue",
    "me_cuesta_creer",
    "me_faltas_tu",
    "nunca_fuiste_parte_-_voice_note",
    "pijama",
    "SEB",
    "sin_nada",
    "te_quise_tanto",
    "yo_creo_que_todxs_estamos_mal"
];
let songFiles = [
    "1_todo_a_medias.mp3",
    "2_(sola).mp3",
    "3_un_tipo_nuevo.mp3",
    "4_Au.mp3",
    "5_como_te_vas.mp3",
    "6_Filofobia.mp3",
    "7_La_idiota_soy_yo.mp3",
    "8_la_mente_de_una_paloma.mp3",
    "9_lo_que_un_dia_fue.mp3",
    "10_me_cuesta_creer.mp3",
    "11_me_faltas_tu.mp3",
    "12_nunca_fuiste_parte_-_voice_note.mp3",
    "13_pijama.mp3",
    "14_SEB.mp3",
    "15_sin_nada.mp3",
    "16_te_quise_tanto.mp3",
    "17_yo_creo_que_todxs_estamos_mal.mp3"
];

    let currentSongIndex = 0;
    let score = 0;
    let highScore11 = localStorage.getItem("highScore11") || 0;
    document.getElementById("high-score").innerText = `Puntuación más alta: ${highScore11}`;

    const input = document.getElementById("guess-input");
    const suggestions = document.getElementById("suggestions");
    const submitGuessBtn = document.getElementById("submit-guess");

    function showSuggestions(value) {
  suggestions.innerHTML = "";
  const filteredSongs = songs.filter(song =>
    song.toLowerCase().includes(value.toLowerCase().replace(/\s/g, "_"))
  );
  filteredSongs.forEach(song => {
    const li = document.createElement("li");
    li.textContent = song.replace(/_/g, " ");
    li.classList.add('suggestion-item');  // Añadir clase para los ítems de sugerencias
    li.addEventListener("click", () => {
      input.value = song.replace(/_/g, " ");
      suggestions.innerHTML = "";
      submitGuess(); // Enviar la respuesta al hacer clic en la sugerencia
    });
    suggestions.appendChild(li);
  });
  selectedIndex = -1; // Reiniciar el índice seleccionado
}

let selectedIndex = -1;

input.addEventListener("input", (e) => {
  showSuggestions(e.target.value);
});

input.addEventListener("keydown", (e) => {
  const items = suggestions.getElementsByClassName("suggestion-item");
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (selectedIndex < items.length - 1) {
      selectedIndex++;
    } else {
      selectedIndex = 0; // Volver al primer elemento si se llega al final
    }
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove("selected");
    }
    items[selectedIndex].classList.add("selected");
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (selectedIndex > 0) {
      selectedIndex--;
    } else {
      selectedIndex = items.length - 1; // Volver al último elemento si se llega al inicio
    }
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove("selected");
    }
    items[selectedIndex].classList.add("selected");
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (selectedIndex >= 0) {
      input.value = items[selectedIndex].textContent;
      suggestions.innerHTML = "";
      selectedIndex = -1; // Reiniciar el índice seleccionado
      submitGuess(); // Enviar la respuesta al presionar Enter
    } else {
      submitGuess(); // Enviar la respuesta al presionar Enter si no hay ninguna selección
    }
  }
});


function startGame() {
  score = 0;
  document.getElementById("score").innerText = `Puntuación: ${score}`;
  document.getElementById("result-container").innerHTML = ""; // Limpiar el contenedor de resultados
  document.getElementById("result").innerHTML = ""; // Limpiar la respuesta correcta
  document.querySelector('.input-container-rapid').classList.remove("hidden"); // Mostrar la casilla de entrada exclusiva de rapid.html
  document.getElementById("start-game").classList.add("hidden"); // Ocultar el botón de empezar juego

  currentSongIndex = Math.floor(Math.random() * songFiles.length); // Seleccionar una canción aleatoria al inicio del juego

  // Reiniciar la barra de progreso y el temporizador
  const progressBar = document.getElementById("progress-bar");
  progressBar.style.transition = "none"; // Desactivar la transición para reiniciar
  progressBar.style.width = "100%";
  setTimeout(() => {
    progressBar.style.transition = "width 10s linear"; // Reactivar la transición
    progressBar.style.width = "0%";
  }, 0);

  clearTimeout(audioTimeout); // Cancelar cualquier temporizador de audio anterior
  playNextSong();
}

let audioTimeout;

function playNextSong() {
  if (songFiles.length === 0) {
    alert("¡No hay más canciones disponibles!");
    return;
  }

  const audio = document.getElementById("audio");
  const audioPlayer = document.getElementById("audio-player");
  const progressBar = document.getElementById("progress-bar");

   console.log(currentSongIndex);

  const currentSongFile = songFiles[currentSongIndex];
  audio.src = `canciones/${currentSongFile}`;
  audio.load(); // Cargar el archivo de audio
  audio.onloadeddata = () => { // Verificar que el audio se ha cargado
    const duration = audio.duration;

    // Calcular un punto de inicio aleatorio entre los 30 y 120 segundos
    let randomStart = Math.floor(Math.random() * 90) + 30; // 90 + 30 = 120
    if (randomStart + 10 > duration) {
      // Si el punto de inicio + 10 segundos supera la duración de la canción, ajustar el punto de inicio
      randomStart = duration - 10;
    }
    audio.currentTime = randomStart;
    audio.play().catch(error => console.error("Error al reproducir el audio: ", error));

    // Iniciar la animación de la barra de progreso
    progressBar.style.transition = "none"; // Desactivar la transición para reiniciar
    progressBar.style.width = "100%";
    setTimeout(() => {
      progressBar.style.transition = "width 10s linear"; // Reactivar la transición
      progressBar.style.width = "0%";
    }, 0);

    audioTimeout = setTimeout(() => {
      audio.pause();
      audio.currentTime = 0; // Reiniciar el tiempo del audio
      progressBar.style.transition = "none"; // Desactivar la transición
      progressBar.style.width = "0%"; // Asegurarse de que la barra se queda en 0
      endGame(); // Terminar el juego al llegar a cero
    }, 10000); // Reproducir durante 10 segundos

    audio.onpause = () => clearTimeout(audioTimeout); // Limpiar el timeout si el audio se pausa
  };
}

function submitGuess() {
  const guess = input.value.trim().replace(/\s/g, "_").toLowerCase();
  const currentSongFile = songFiles[currentSongIndex];
  const currentSongName = currentSongFile.slice(currentSongFile.indexOf("_") + 1, currentSongFile.lastIndexOf(".")).toLowerCase();

  if (guess === currentSongName) {
    score++;
    document.getElementById("score").innerText = `Puntuación: ${score}`;
    input.value = "";

    // Mostrar flash verde para respuesta correcta en la casilla de entrada
    input.classList.add("flash-success");
    setTimeout(() => input.classList.remove("flash-success"), 500);

    // Reiniciar la barra de progreso y el temporizador
    const progressBar = document.getElementById("progress-bar");
    progressBar.style.transition = "none"; // Desactivar la transición para reiniciar
    progressBar.style.width = "100%";

    // Cancelar cualquier temporizador de audio anterior
    clearTimeout(audioTimeout);

    // Seleccionar una nueva canción aleatoria
    if (songFiles.length > 0) {
      currentSongIndex = Math.floor(Math.random() * songFiles.length);
      // Reiniciar la barra de progreso y el temporizador al reproducir la nueva canción
      setTimeout(playNextSong, 0);
    } else {
      endGame();
    }
  } else {
    // Mostrar flash rojo para respuesta incorrecta en la casilla de entrada
    input.classList.add("flash-error");
    setTimeout(() => input.classList.remove("flash-error"), 500);

    // La respuesta es incorrecta pero el juego continúa, así que no terminamos el juego
    input.value = "";
  }
}

function endGame() {
  const resultContainer = document.getElementById("result-container");
  const currentSongFile = songFiles[currentSongIndex];
  const currentSongName = currentSongFile.slice(currentSongFile.indexOf("_") + 1, currentSongFile.lastIndexOf(".")).replace(/_/g, " ");
if (score==1){
resultContainer.innerHTML = `
    <p>Partida terminada :( Obtuviste ${score} punto.</p>
    <p>La respuesta correcta era: ${currentSongName}.</p>
    ${score > highScore11 ? `<p>Nueva puntuación más alta!</p>` : ""}
<button class="play-again-graphic" onclick="startGame()"></button>
`
}
else{
  resultContainer.innerHTML = `
    <p>Partida terminada :( Obtuviste ${score} puntos.</p>
    <p>La respuesta correcta era: ${currentSongName}.</p>
    ${score > highScore11 ? `<p>Nueva puntuación más alta!</p>` : ""}
<button class="play-again-graphic" onclick="startGame()"></button>
`;
  if (score > highScore11) {
    highScore11 = score;
    localStorage.setItem("highScore11", highScore11);
    document.getElementById("high-score").innerText = `Puntuación más alta: ${highScore11}`;
  }
}
  submitGuessBtn.classList.add("hidden");
  input.value = "";
  document.getElementById("audio-player").classList.add("hidden");
  document.querySelector('.input-container-rapid').classList.add('hidden');
}
document.getElementById("start-game").addEventListener("click", startGame);
submitGuessBtn.addEventListener("click", submitGuess);