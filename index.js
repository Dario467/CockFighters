const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;
let awake = false;
let in_animation = false;

c.fillRect(0,0,canvas.width, canvas.height);

const player1 = new Player({
    x:100,
    y:0+canvas.height-240
},
{
    x:340,
    y:240
},
[
  new Cock("GunCock",20,8,["./Assets/gallo_sprite_front1.png","./Assets/gallo_sprite_front.png"])
],
true);

const player2 = new Player({
    x:canvas.width-480,
    y:60
},
{
    x:340,
    y:240
},
[
  new Cock("GunCock",20,8,["./Assets/gallo_sprite_front1.png","./Assets/gallo_sprite_front.png"])
],
false);

function gameLoop() {
  if (!awake){
    awake = true;
    console.log("Game Started");
    player1.player_awake();
    player2.player_awake();
  }
  window.requestAnimationFrame(gameLoop);
  c.fillStyle = "lightgray";
  c.fillRect(0,0,canvas.width, canvas.height);
  player1.draw(c,0);
  player2.draw(c,1);
}
gameLoop();