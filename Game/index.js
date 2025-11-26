//gestion de la puntuacion de los usuarios
async function addPointsToCurrentUser(delta) {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        console.warn('No hay usuario en sesión');
        return false;
    }

    if (typeof delta !== 'number') {
        console.warn('delta debe ser un número');
        return false;
    }

    try {
        // Obtener puntos actuales del usuario
        const userRes = await fetch(`/api/auth/user/${userId}`);
        if (!userRes.ok) {
            console.error('Error obteniendo usuario actual');
            return false;
        }
        const user = await userRes.json();
        const currentScore = user.score || 0;

        // Calcular nuevo score (
        const newScore = Math.max(0, currentScore + delta);

        // Enviar al backend
        const res = await fetch(`/api/auth/user/${userId}/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: newScore })
        });

        if (!res.ok) {
            console.error('Error guardando puntuación:', await res.text());
            return false;
        }

        const updatedUser = await res.json();
        console.log(`Puntos actualizados: ${currentScore} + ${delta} = ${updatedUser.score}`);

        return true;
    } catch (err) {
        console.error('Error en addPointsToCurrentUser:', err);
        return false;
    }
}

// Exponer globalmente para uso en consola
window.addPointsToCurrentUser = addPointsToCurrentUser;

let player1 = null;
let player2 = null;
let ws = null;
let battle = null;
const backgroundImage = new Image();

async function connectWS() {
    const res = await fetch("/ip");
    const data = await res.json();

    const serverIP = data.ip;
    console.log("Conectando a WS:", serverIP);
    if (serverIP) {
        document.getElementById('shareLink').value = `http://${serverIP}:3000`;
    }
    ws = new WebSocket(`ws://${serverIP}:3000`);

    ws.onopen = async() =>{
      console.log("WS conectado");
      const userId = localStorage.getItem('userId');
      console.log("User ID:", userId);
      const respuesta = await fetch('/api/gallos');
      misGallosGlobal = await respuesta.json();
      console.log("Mis gallos:", misGallosGlobal);
      let savedGallos = [];
      if (userId) {
          try {
              const teamRes = await fetch(`/api/auth/team/${userId}`);
              if (teamRes.ok) {
                  const teamData = await teamRes.json();
                  savedGallos = teamData.gallos || [];
              }
          } catch (teamErr) {
              console.warn('No se pudo cargar el equipo guardado:', teamErr);
          }
      }
      console.log("Gallos guardados:", savedGallos);
      let miEquipo = [];
      let galloBase = misGallosGlobal.find(g => g._id === savedGallos[0]);
      let gallo = new Cock(galloBase.nombre,galloBase.vida,galloBase.poder,galloBase.bullet,galloBase.cura,galloBase.sprites,galloBase.action);
      miEquipo.push(gallo);
      galloBase = misGallosGlobal.find(g => g._id === savedGallos[1]);
      gallo = new Cock(galloBase.nombre,galloBase.vida,galloBase.poder,galloBase.bullet,galloBase.cura,galloBase.sprites,galloBase.action);
      miEquipo.push(gallo);
      console.log("Mi equipo final:", miEquipo);

      ws.send(JSON.stringify({
        type: "set_team",
        team: miEquipo
      }));
    }
    ws.onclose = () => {
        console.log("Te has desconectado del servidor");
        alert("Se perdió la conexión con el servidor");
        window.location.href = "menuP.html";
    };
    ws.onerror = e => console.error("WS error", e);
    ws.onmessage = async (e) => {
        const data = JSON.parse(e.data);

        if (data.type === "player_id") {
          console.log("Soy el jugador:", data.id);
          console.log("Mi equipo es:", data.team[0].nombre);
          console.log(localStorage.selectedFondoRoute);
          if (data.id === 1) {
            document.getElementById('shareModal').classList.remove('hidden');
            player1 = crearPlayer1(data.team,localStorage.selectedFondoRoute);
            player1.player_awake();
            document.getElementById("player1Area").style.display = "";
            document.getElementById("player2Area").style.display = "none";
          }
          else if (data.id === 2) {
            player2 = crearPlayer2(data.team,localStorage.selectedFondoRoute);
            player2.player_awake();
            document.getElementById("player1Area").style.display = "none";
            document.getElementById("player2Area").style.display = "";
          }
          return;
        }

        if (data.type === "opponent_joined") {
          console.log("El enemigo es el jugador:", data.opponent);
          console.log(data);
          if (data.opponent === 1) {
            player1 = crearPlayer1(data.opponentTeam);
            player1.player_awake();
          } else {
            player2 = crearPlayer2(data.opponentTeam);
            player2.player_awake();
          }
          if (player1 && player2) {
            console.log("Ambos jugadores conectados. Iniciando batalla.");
            document.getElementById('shareModal').classList.add('hidden');
            battle = new Battle(player1, player2);
            gameLoop();
          }
          return;
        }

        if (data.type === "move") {
          console.log("Movimiento recibido del jugador", data.player, ":", data.move);
          battle.playerChooseMove(data.player, data.move);
        }

        if(data.type === "nextText") {
          console.log("nextText recibido");
          battle.nextTxt();
        }

        if (data.type === "you_win") {
            alert("¡Ganaste la batalla! +200 puntos");
            await addPointsToCurrentUser(200);
            window.location.href = "menuP.html";
            return;
        }

        if (data.type === "you_lose") {
            alert("Perdiste la batalla -100 puntos");
            await addPointsToCurrentUser(-100);
            window.location.href = "menuP.html";
            return;
        }

        if (data.type === "you_tie") {
            alert("¡Empate! +0 puntos");
            window.location.href = "menuP.html";
            return;
        }

        if (data.type === "opponent_disconnected") {
          console.log(`El jugador ${data.playerId} se ha desconectado`);
          alert("Tu oponente se ha desconectado. Regresando al menú...");
          window.location.href = "menuP.html";
          ws.send(JSON.stringify({
              type: "you_disconnect"
          }));
          return;
        }
        if(data.type === "you_disconnect") {
            alert("Te Has sido desconectado.");
            window.location.href = "menuP.html";
        }
        if(data.type === "server_full") {
            alert("El servidor del juego está lleno. Intenta más tarde.");
            window.location.href = "menuP.html";
        }
    };
}

const canvas = document.getElementById("canvas1");
const c = canvas.getContext("2d");
const canvas2 = document.getElementById("canvas2");
const c2 = canvas2.getContext("2d");

canvas.width = 1024;
canvas.height = 576;
canvas2.width = 1024;
canvas2.height = 576;
let awake = false;
let in_animation = false;

c.fillRect(0,0,canvas.width, canvas.height);
c2.fillRect(0,0,canvas2.width, canvas2.height);

connectWS();

function chooseMove(playerId, moveIndex) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.error("WebSocket no está conectado");
        return;
    }
    ws.send(JSON.stringify({
          type: "move",
          player: playerId,
          move: moveIndex
    }));
    console.log("Movimiento elegido:", moveIndex);
    battle.playerChooseMove(playerId, moveIndex);
};

function nextFun(){
  ws.send(JSON.stringify({
    type: "nextText"
  }));
  battle.nextTxt();
}


function gameLoop() {
  if (!awake){
    awake = true;
    console.log("Game Started");
    animationMove(player2, 945, 1,400);
    animationMove(player1, -325, 1,-400);
    backgroundImage.src = localStorage.selectedFondoRoute;
    console.log(backgroundImage.src);
  }
  if(!backgroundImage.src || backgroundImage.naturalWidth === 0){
    backgroundImage.src = "";
    c.fillStyle = "lightgray";
    c.fillRect(0,0,canvas.width, canvas.height);
    c2.fillStyle = "lightgray";
    c2.fillRect(0,0,canvas2.width, canvas2.height);
  }else{
    c.filter = "brightness(70%) blur(1px) grayscale(30%)";
    c.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    c.filter = "none";
    c2.filter = "brightness(70%) blur(1px) grayscale(30%)";
    c2.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    c2.filter = "none";
  }

  player1.draw(c,"spriteBack",true);
  player2.draw(c,"spriteFront",true);

  player1.draw(c2,"spriteFront",false);
  player2.draw(c2,"spriteBack",false);
  window.requestAnimationFrame(gameLoop);
}

function animationMove(player, initialPos, duration, speed) {
  return new Promise(resolve => {
    let lastTime = 0;
    let time = 0;
    player.position.x = initialPos;

    function step(timestamp) {
      if (!lastTime) lastTime = timestamp;

      const delta = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      time += delta;

      player.position.x -= speed * delta;

      if (time < duration) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}

async function run() {
  await animationMove(player2, 900, 0.5);
  await animationMove(player2, 800, 0.5);
  await animationMove(player2, 700, 0.5);
  console.log("Listo!");
}

function copyLink() {
    const linkInput = document.getElementById('shareLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    document.execCommand('copy');

    const copyText = document.getElementById('copyText');
    copyText.textContent = '¡Copiado!';
    setTimeout(() => {
        copyText.textContent = 'Copiar';
    }, 2000);
}

function returnToMenu() {
    window.location.href = 'menuP.html';
}

function crearPlayer1(cocksData,background){
  const cocks = cocksData.map(cockData => new Cock(
        cockData.nombre,
        cockData.vidaMax || cockData.vida,
        cockData.poder,
        cockData.bulletsMax || cockData.bullet,
        cockData.curacion,
        cockData.sprites,
        cockData.acciones || cockData.action
  ));
  return new Player({
    x:75,
    y:0+canvas.height-250
  },
  {
    x:canvas.width-480,
    y:60
  },
  {
    x:370,
    y:250
  },
  cocks,
  1,
  "/Assets/FONDO_bosque.jpg");
}

function crearPlayer2(cocksData,background){
  const cocks = cocksData.map(cockData => new Cock(
        cockData.nombre,
        cockData.vidaMax || cockData.vida,
        cockData.poder,
        cockData.bulletsMax || cockData.bullet,
        cockData.curacion,
        cockData.sprites,
        cockData.acciones || cockData.action
  ));
  return new Player({
      x:canvas.width-480,
      y:60
  },
  {
      x:75,
      y:0+canvas.height-250
  },
  {
      x:370,
      y:250
  },
  cocks,
  2,
  "/Assets/FONDO_bosque.jpg");
}

function sendEndInfo(empate,ganador,perdedor){
  ws.send(JSON.stringify({
    type: "endResults",
    empate: empate,
    winner: ganador,
    loser: perdedor
  }));
}
