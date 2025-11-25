async function connectWS() {
    const res = await fetch("/ip");
    const data = await res.json();

    const serverIP = data.ip;
    console.log("Conectando a WS:", serverIP);
    console.log(`\nUsa el link: http://${serverIP}:3000 para invitar a otro jugador.\n\n`);

    window.ws = new WebSocket(`ws://${serverIP}:3000`);

    ws.onopen = () => console.log("WS conectado");
    ws.onerror = e => console.error("WS error", e);
    ws.onmessage = e => {
        const data = JSON.parse(e.data);

        if (data.type === "player_id") {
          console.log("Soy el jugador:", data.id);
          if (data.id === 1) {
            document.getElementById("player1Area").style.display = "";
            document.getElementById("player2Area").style.display = "none";
          }
          else if (data.id === 2) {
            document.getElementById("player1Area").style.display = "none";
            document.getElementById("player2Area").style.display = "";
          }
          return;
        }

        if (data.type === "move") {
            battle.playerChooseMove(data.player, data.move);
        }

        if(data.type === "server_full") {
            alert("El servidor del juego está lleno. Intenta más tarde.");
            window.location.href = "menuP.html";
        }
    };
}

connectWS();

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

const player1 = new Player({
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
[
  new Cock("CYBER COCK",25,12,4,5,["/Assets/cyber_cock_back.png","/Assets/cyber_cock_front.png"],["recharge","shield","attack","heal"]),
  new Cock("MAGALLO",30,10,4,5,["/Assets/magallo_back.png","/Assets/magallo_front.png"],["recharge","shield","attack","heal"])
],
1);

const player2 = new Player({
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
[
  new Cock("CUBETA KFC",35,8,4,5,["/Assets/bucket_back.png","/Assets/bucket_front.png"],["recharge","shield","attack","heal"]),
  new Cock("BIG BLACK COCK",10,20,4,5,["/Assets/big_black_cock_back.png","/Assets/big_black_cock_front1.png"],["recharge","shield","attack","heal"])
],
2);

const battle = new Battle(player1,player2);

function chooseMove(playerId, moveIndex) {
    battle.playerChooseMove(playerId, moveIndex);
};

function gameLoop() {
  if (!awake){
    awake = true;
    console.log("Game Started");
    player1.player_awake();
    player2.player_awake();
    animationMove(player2, 945, 1,400);
    animationMove(player1, -325, 1,-400);
  }
  c.fillStyle = "lightgray";
  c.fillRect(0,0,canvas.width, canvas.height);
  
  c2.fillStyle = "lightgray";
  c2.fillRect(0,0,canvas2.width, canvas2.height);
  
  player1.draw(c,0,true);
  player2.draw(c,1,true);

  player1.draw(c2,1,false);
  player2.draw(c2,0,false);
  window.requestAnimationFrame(gameLoop);
}
gameLoop();

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