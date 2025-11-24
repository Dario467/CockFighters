class Cock {
    constructor(nombre, vida, poder,bulletsMax, sprites, acciones) {
        this.nombre = nombre;
        this.vida = vida;
        this.vidaMax = vida;
        this.poder = poder;
        this.bulletsMax = bulletsMax;
        this.bullets = 0;
        this.shields = 0;
        this.sprites = sprites;
        this.acciones = acciones;
        this.curacion = 5;
    }

    damage(amount) {
        this.vida -= amount;
        if (this.vida < 0) {
            this.vida = 0;
        }
    }

    heal(amount){
        this.vida += amount;
        if (this.vida > this.vidaMax) {
            this.vida = this.vidaMax;
        }
    }

    recharge(amount){
        this.bullets += amount;
        if (this.bullets > this.bulletsMax) {
            this.bullets = this.bulletsMax;
        }
    }

    useBullets(amount){
        this.bullets -= amount;
        if (this.bullets < 0) {
            this.bullets = 0;
        }
    }

    rechargeShield(amount, max = 8){
        if(this.shields === 0){
            this.shields += 1;
        }
        this.shields += amount;
        if(this.shields > max){
            this.shields = max;
        }
    }

    useShield(amount){
        this.shields -= amount;
        if (this.shields < 0) {
            this.shields = 0;
        }
    }
}