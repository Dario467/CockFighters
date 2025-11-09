const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0,0,canvas.width, canvas.height);

const player = new Player({
    x:0+20,
    y:0+canvas.height-200
},
{
    x:300,
    y:207
},
 "./Assets/gallo_sprite_front1.png");

function gameLoop() {
  window.requestAnimationFrame(gameLoop);
  c.fillStyle = "black";
  c.fillRect(0,0,canvas.width, canvas.height);
  player.draw(c);
}
gameLoop();