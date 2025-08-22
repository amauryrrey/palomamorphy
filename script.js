const songsData = [
  // Sencillos
  { name: "todo_a_medias", album: "Sencillos" },
  { name: "La_idiota_soy_yo", album: "Sencillos" },
  { name: "sin_nada", album: "Sencillos" },
  { name: "Filofobia", album: "Sencillos" },
 //Au
  { name: "(sola)", album: "Au" },
  { name: "un_tipo_nuevo", album: "Au" },
  { name: "Au", album: "Au" },
  { name: "como_te_vas", album: "Au" },
  { name: "la_mente_de_una_paloma", album: "Au" },
  { name: "lo_que_un_dia_fue", album: "Au" },
  { name: "me_cuesta_creer", album: "Au" },
  { name: "me_faltas_tu", album: "Au" },
  { name: "nunca_fuiste_parte_-_voice_note", album: "Au" },
  { name: "pijama", album: "Au" },
  { name: "SEB", album: "Au" },
  { name: "te_quise_tanto", album: "Au" },
  { name: "yo_creo_que_todxs_estamos_mal", album: "Au" },

];
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

// Constantes y datos del almacenamiento local
const today = new Date().toLocaleDateString();
const lastPlayedDate = localStorage.getItem("lastPlayedDate");

// Variables iniciales
let currentSongIndex = parseInt(localStorage.getItem("currentSongIndex")) || 0;
let randomStart = parseInt(localStorage.getItem("randomStart")) || 0;
let played = parseInt(localStorage.getItem("played")) || 0;
let winPercentage = parseInt(localStorage.getItem("winPercentage")) || 0;
let streak = localStorage.getItem("streak") || 0;
let highstreak = localStorage.getItem("highstreak") || 0;
let audioTimeout;
let currentGuessIndex = 0;
let currentPlayTime = 1; // Tiempo inicial de reproducción en segundos
let attemptHistory = JSON.parse(localStorage.getItem("attemptHistory")) || [0, 0, 0, 0, 0];
let wins = parseInt(localStorage.getItem("wins")) || 0;
let isWin = JSON.parse(localStorage.getItem("isWin")) || false;

// Elementos del DOM relacionados con las entradas de usuario
const inputs = [];
const suggestionLists = [];
for (let i = 1; i <= 5; i++) {
  inputs.push(document.getElementById(`guess-input-${i}`));
  suggestionLists.push(document.getElementById(`suggestions-${i}`));
}

// Botón de reproducción de audio
const playAudioBtn = document.getElementById("play-audio");

// Iniciar el juego automáticamente si no se ha jugado hoy
if (lastPlayedDate !== today) {
  localStorage.removeItem("responses");
  // Seleccionar una canción y fragmento al azar
  currentSongIndex = Math.floor(Math.random() * songFiles.length);
  randomStart = Math.floor(Math.random() * 90) + 30;
  if (randomStart + 5 > audio.duration) {
    randomStart = audio.duration - 5; // Ajustar si el tiempo de reproducción es mayor a la duración del audio
  }
  isWin=false;
  localStorage.setItem("isWin", JSON.stringify(isWin));
  localStorage.setItem("currentSongIndex", currentSongIndex);
  localStorage.setItem("randomStart", randomStart);
  startGame();
  localStorage.setItem("lastPlayedDate", today); // Guardar la nueva fecha en el localStorage
}

function startGame() {
  streak = parseInt(localStorage.getItem("streak")) || 0;
  document.getElementById("result-container").innerHTML = "";
  document.getElementById("result").innerHTML = "";
  played+=1;
  localStorage.setItem("played", played);
  document.querySelectorAll('.input-container').forEach((container, index) => {
    container.querySelector("input").disabled = true;
    container.querySelector("input").style.visibility = "visible";
  });

  playAudioBtn.classList.remove("hidden");
  loadResponses(); // Cargar respuestas guardadas

  if (currentGuessIndex < inputs.length) {
    const nextInput = inputs[currentGuessIndex];
    nextInput.disabled = false;
    nextInput.focus();

    nextInput.addEventListener("input", (e) => {
      showSuggestions(nextInput, suggestionLists[currentGuessIndex], e.target.value);
    });
  } else {
    // Si el juego ya ha terminado, asegurar que no se puedan enviar nuevas respuestas
    endGame(); // Finalizar el juego si ya se dio una respuesta correcta
  }
}

function playAudioSnippet() {
  clearTimeout(audioTimeout);

  const audio = document.getElementById("audio");
  const audioPlayer = document.getElementById("audio-player");
  const progressBar = document.getElementById("progress-bar");

  // Detener y reiniciar el audio
  audio.pause();
  audio.currentTime = 0;

  // Reiniciar la barra de progreso sin transición
  progressBar.style.transition = "none";
  progressBar.style.width = "100%";

  // Forzar un reflow para aplicar los cambios sin transición
  setTimeout(() => {
    progressBar.style.transition = `width ${currentPlayTime}s linear`;
    progressBar.style.width = "0%";
  }, 0);

  // Mostrar el reproductor de audio
  audioPlayer.classList.remove("hidden");

  // Configurar la canción actual
  const currentSongFile = songFiles[currentSongIndex];
  audio.src = `canciones/${currentSongFile}`;
  audio.load();

  audio.onloadedmetadata = () => {
    audio.currentTime = randomStart;

    audio.play()
      .then(() => {
        // Reiniciar la barra de progreso después de iniciar la reproducción
        progressBar.style.transition = "none";
        progressBar.style.width = "100%";

        // Forzar un reflow para aplicar los cambios sin transición
        setTimeout(() => {
          progressBar.style.transition = `width ${currentPlayTime}s linear`;
          progressBar.style.width = "0%";
        }, 0);

        // Programar el reinicio de la barra una vez que llegue a 0
        audioTimeout = setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
          // Forzar un reflow para aplicar los cambios sin transición
          setTimeout(() => {
            progressBar.style.transition = `width ${currentPlayTime}s linear`;
            progressBar.style.width = "100%";
          }, 0);
        }, currentPlayTime * 1000); // Duración de la animación de la barra
      })
      .catch(error => console.error("Error al reproducir el audio: ", error));
  };
}

function saveResponses() {
  const responses = inputs.map((input, index) => ({
    value: input.value,
    visible: input.style.visibility === "visible",
    disabled: input.disabled,
    hasSuccessBox: input.parentNode.querySelector('.success-box') !== null,
    hasErrorBox: input.parentNode.querySelector('.error-box') !== null,
    hasAlbumBox: input.parentNode.querySelector('.album-box') !== null, // Nueva propiedad
    userGuess: input.parentNode.querySelector('.error-box')
      ? input.parentNode.querySelector('.error-box').innerText
      : input.parentNode.querySelector('.album-box')
        ? input.parentNode.querySelector('.album-box').innerText // Guardar texto del album-box
        : "",
    isCurrent: index === currentGuessIndex // Marcar si es la última respuesta pendiente
  }));
  localStorage.setItem("responses", JSON.stringify(responses));
}

function submitGuess() {
  const input = inputs[currentGuessIndex];
  const suggestionList = suggestionLists[currentGuessIndex];
  const guess = input.value.trim().replace(/\s/g, "_").toLowerCase();
  const currentSongFile = songFiles[currentSongIndex];
  const currentSongName = currentSongFile.slice(
    currentSongFile.indexOf("_") + 1,
    currentSongFile.lastIndexOf(".")
  ).toLowerCase();
  // Ocultar la lista desplegable
  suggestionList.innerHTML = "";

  if (guess === currentSongName) {
  isWin=true;
localStorage.setItem("isWin", JSON.stringify(isWin));
  // Incrementar la racha y actualizar el localStorage
  streak++;
  localStorage.setItem("streak", streak);
  if (streak > highstreak) {
    highstreak = streak;
    localStorage.setItem("highstreak", highstreak);
  }
  input.classList.add("flash-success");
  setTimeout(() => {
    input.classList.remove("flash-success");
  // Crear y mostrar la caja de éxito
  const successBox = document.createElement("div");
  successBox.classList.add("success-box");
  successBox.innerText = input.value;
  input.parentNode.appendChild(successBox);

  // Ocultar el input actual y deshabilitar interacciones
  input.style.visibility = "hidden";
  input.disabled = true;

  // Ocultar todos los inputs y contenedores siguientes
  for (let i = currentGuessIndex + 1; i < inputs.length; i++) {
    const nextInputContainer = inputs[i].parentNode;
    nextInputContainer.style.display = "none"; // Ocultar completamente el contenedor
  }

  // Guardar el intento en el que se adivinó la canción
  const attemptNumber = currentGuessIndex; // Índice del intento actual (0-indexed)
  saveAttemptHistory(attemptNumber); // Guardar el historial de intentos
  saveResponses(); // Guardar las respuestas en el localStorage

  // Finalizar el juego si la respuesta es correcta
  currentGuessIndex = inputs.length; // Asegurar que el índice se actualiza correctamente para evitar nuevas respuestas
  currentPlayTime = 5;
  playAudioSnippet();
}, 500);
  // Calcular y guardar el porcentaje de victorias
  // Mostrar estadísticas después de 1 segundo
  setTimeout(() => {
    showStatistics();
  }, 1000);
}else 
{
    const guessedSongAlbum = getAlbumForSong(guess); // Obtener el álbum de la canción ingresada
    const currentSongAlbum = getAlbumForSong(currentSongName); // Obtener el álbum de la canción correcta
if(currentSongAlbum===guessedSongAlbum){
      const userGuess = input.value;
        input.classList.add("flash-album");
  setTimeout(() => {
    input.classList.remove("flash-album");
      input.value = "";
      input.style.visibility = "hidden";


      const albumBox = document.createElement("div");
      albumBox.classList.add("album-box");
      albumBox.innerText = userGuess;
      input.parentNode.appendChild(albumBox);
      currentGuessIndex++;

      if (currentGuessIndex < 5) {
        const nextInput = inputs[currentGuessIndex];
        nextInput.disabled = false;
        nextInput.focus();
        currentPlayTime = Math.min(currentGuessIndex + 1, 5);
        playAudioSnippet();

        nextInput.addEventListener("input", (e) => {
          showSuggestions(nextInput, suggestionLists[currentGuessIndex], e.target.value);
        });
      } else {
        endGame();
      }
      saveResponses(); // Guardar las respuestas en el localStorage
      }, 500);
  }else {
    input.classList.add("flash-error");
    setTimeout(() => {
      input.classList.remove("flash-error");

      const userGuess = input.value;
      input.value = "";
      input.style.visibility = "hidden";

      const errorBox = document.createElement("div");
      errorBox.classList.add("error-box");
      errorBox.innerText = userGuess;
      input.parentNode.appendChild(errorBox);

      currentGuessIndex++;

      if (currentGuessIndex < 5) {
        const nextInput = inputs[currentGuessIndex];
        nextInput.disabled = false;
        nextInput.focus();
        currentPlayTime = Math.min(currentGuessIndex + 1, 5);
        playAudioSnippet();

        nextInput.addEventListener("input", (e) => {
          showSuggestions(nextInput, suggestionLists[currentGuessIndex], e.target.value);
        });
      } else {
        endGame();
      }

      saveResponses(); // Guardar las respuestas en el localStorage
    }, 500);
  }
}
}

// Función para guardar el historial de intentos
function saveAttemptHistory(attemptIndex) {
  let attemptHistory = JSON.parse(localStorage.getItem("attemptHistory")) || [0, 0, 0, 0, 0]; // Inicializar con 5 posiciones
  attemptHistory[attemptIndex]++; // Incrementar el contador en la posición correspondiente
  localStorage.setItem("attemptHistory", JSON.stringify(attemptHistory));
  wins = attemptHistory.reduce((sum, value) => sum + value, 0);
  localStorage.setItem("wins", wins);

}

function loadResponses() {
  const responses = JSON.parse(localStorage.getItem("responses"));
  if (responses) {
    responses.forEach((response, index) => {
      const input = inputs[index];
      input.value = response.value;
      input.style.visibility = response.visible ? "visible" : "hidden";
      input.disabled = response.disabled;

      // Manejar cajas de éxito, error y álbum
      if (response.hasSuccessBox) {
        const successBox = document.createElement("div");
        successBox.classList.add("success-box");
        successBox.innerText = response.value;
        input.parentNode.appendChild(successBox);
        input.style.visibility = "hidden";
 for (let i = currentGuessIndex + 1; i < inputs.length; i++) {
    const nextInputContainer = inputs[i].parentNode;
    nextInputContainer.style.display = "none"; // Ocultar completamente el contenedor
  }
        currentGuessIndex = inputs.length; // Asegurar que el índice se actualiza correctamente para evitar nuevas respuestas
      } else if (response.hasErrorBox) {
        const errorBox = document.createElement("div");
        errorBox.classList.add("error-box");
        errorBox.innerText = response.userGuess;
        input.parentNode.appendChild(errorBox);
        currentGuessIndex = index + 1; // Actualizar currentGuessIndex al siguiente intento
      } else if (response.hasAlbumBox) {
        const albumBox = document.createElement("div");
        albumBox.classList.add("album-box");
        albumBox.innerText = response.userGuess; // Restaurar el texto del album-box
        input.parentNode.appendChild(albumBox);
        input.style.visibility = "hidden";
        currentGuessIndex = index + 1; // Actualizar currentGuessIndex al siguiente intento
      }

      // Enfocar el input actual si es el intento pendiente
      if (response.isCurrent && response.value !== "") {
        input.disabled = false;
        input.focus();
      }
    });

    // Ajustar currentPlayTime según currentGuessIndex
    currentPlayTime = Math.min(currentGuessIndex + 1, 5);

    // Verificar si el juego ha sido finalizado
    if (currentGuessIndex >= inputs.length) {
      endGame();
    }
  }
}

loadResponses(); // Cargar las respuestas al iniciar la página

function showStatistics() {
  // Obtener elementos del DOM
  const modal = document.getElementById("statisticsModal");
  const closeBtn = document.querySelector(".close-btn");
let winPercentage = Math.round((wins / played) * 100);
localStorage.setItem("winPercentage", winPercentage);
  // Actualizar las estadísticas en la ventana modal
  document.getElementById("played").textContent = played;
  document.getElementById("winPercentage").textContent = `${winPercentage}%`;
  document.getElementById("streak").textContent = streak;
  document.getElementById("highstreak").textContent = highstreak;

  // Mostrar las barras de intentos
  displayAttemptBars();

  // Mostrar la ventana modal
  modal.style.display = "block";

  // Cerrar la ventana modal al hacer clic en la "X"
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  // Cerrar la ventana modal si se hace clic fuera de ella
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
}

// Función para mostrar las barras de intentos
function displayAttemptBars() {
  const attemptHistory = JSON.parse(localStorage.getItem("attemptHistory")) || [0, 0, 0, 0, 0];
  const attemptsContainer = document.getElementById("attempts-container");

  // Limpiar el contenedor previo
  attemptsContainer.innerHTML = "";

  // Calcular el total de partidas jugadas
  const totalPlayed = attemptHistory.reduce((sum, count) => sum + count, 0);

  // Iterar sobre el arreglo e imprimir cada intento con su barra
  attemptHistory.forEach((count, index) => {
    const percentage = totalPlayed > 0 ? (count * 100) / totalPlayed : 0;

    // Crear el contenedor de la barra
    const barContainer = document.createElement("div");
    barContainer.classList.add("bar-container");

    // Crear el texto del intento
    const attemptText = document.createElement("span");
    attemptText.textContent = ` ${index + 1}: ${count}`;
    attemptText.classList.add("attempt-text");

    // Crear la barra
    const bar = document.createElement("div");
    bar.classList.add("bar");

    // Escalar el ancho de la barra para que sea más ancha
    const maxWidth = 400; // Anchura máxima de la barra en píxeles
    const scaledWidth = (percentage / 100) * maxWidth; // Escalar el ancho según el porcentaje
    bar.style.width = `${scaledWidth}px`; // Aplicar el ancho escalado

    // Agregar elementos al contenedor
    barContainer.appendChild(attemptText);
    barContainer.appendChild(bar);
    // Agregar el contenedor al DOM
    attemptsContainer.appendChild(barContainer);
  });
}
function getAlbumForSong(songName) {
  const songData = songsData.find(song => song.name.toLowerCase() === songName.toLowerCase());
  return songData ? songData.album : null;
}

function endGame() {
  const resultContainer = document.getElementById("result-container");
  const currentSongFile = songFiles[currentSongIndex];
  const currentSongName = currentSongFile.slice(currentSongFile.indexOf("_") + 1, currentSongFile.lastIndexOf(".")).replace(/_/g, " ");
  document.getElementById("audio-player").classList.add("hidden");

  if (isWin===false) {
localStorage.setItem("streak", 0);
}
  showStatistics();
}

function showSuggestions(input, suggestions, value) {
  suggestions.innerHTML = "";

  const filteredSongs = songs.filter(song =>
    song.toLowerCase().includes(value.toLowerCase().replace(/\s/g, "_"))
  );

  filteredSongs.forEach(song => {
    const li = document.createElement("li");
    li.textContent = song.replace(/_/g, " ");
    li.classList.add('suggestion-item');

    li.addEventListener("click", () => {
      input.value = song.replace(/_/g, " ");
      suggestions.innerHTML = "";
      submitGuess();
    });

    suggestions.appendChild(li);
  });

  selectedIndex = -1; // Reiniciar el índice seleccionado
}

let selectedIndex = -1;

inputs.forEach((input, index) => {
  input.addEventListener("input", (e) => {
    showSuggestions(input, suggestionLists[index], e.target.value);
  });

  input.addEventListener("keydown", (e) => {
    const items = suggestionLists[index].getElementsByClassName("suggestion-item");

    if (e.key === "ArrowDown") {
      e.preventDefault();

      if (selectedIndex < items.length - 1) {
        selectedIndex++;
      } else {
        selectedIndex = 0;
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
        selectedIndex = items.length - 1;
      }

      for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("selected");
      }

      items[selectedIndex].classList.add("selected");
    } else if (e.key === "Enter") {
      e.preventDefault();

      if (selectedIndex >= 0) {
        input.value = items[selectedIndex].textContent;
        selectedIndex = -1;
        submitGuess();
      } else {
        submitGuess();
      }
    }
  });
});

playAudioBtn.addEventListener("click", playAudioSnippet);
playAudioBtn.classList.remove("hidden");
