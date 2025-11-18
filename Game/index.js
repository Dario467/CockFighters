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

//c.fillRect(0,0,canvas.width, canvas.height);
c2.fillRect(0,0,canvas2.width, canvas2.height);

const player1 = new Player({
    x:100,
    y:0+canvas.height-240
},
{
    x:canvas.width-480,
    y:60
},
{
    x:340,
    y:240
},
[
  new Cock("GunCock",15,12,6,["/Assets/gallo_sprite_front1.png","/Assets/gallo_sprite_front.png"])
],
1);

const player2 = new Player({
    x:canvas.width-480,
    y:60
},
{
    x:100,
    y:0+canvas.height-240
},
{
    x:340,
    y:240
},
[
  new Cock("GunCock",20,8,6,["/Assets/gallo_sprite_front1.png","/Assets/gallo_sprite_front.png"])
],
2);

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
  
  c2.fillStyle = "lightgray";
  c2.fillRect(0,0,canvas2.width, canvas2.height);
  
  player1.draw(c,0,true);
  player2.draw(c,1,true);

  player1.draw(c2,1,false);
  player2.draw(c2,0,false);

  player1.damage(1);
  player1.recharge(1);
}
gameLoop();