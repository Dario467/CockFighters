class Cock {
    constructor(nombre, vida, poder,bulletsMax, sprites) {
        this.nombre = nombre;
        this.vida = vida;
        this.vidaMax = vida;
        this.poder = poder;
        this.bulletsMax = bulletsMax;
        this.bullets = 0;
        this.sprites = sprites;
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
}