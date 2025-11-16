class PlayerException{
    constructor(errorMessage){
        this.message = errorMessage;
    }
}

class Player {
    #spriteRender;

    #position;
    #position2;
    #selectedCock;
    #player;

    #uiHealthBar;
    #uiTopBar;
    #uiHealthNum;
    #uiBullets;

    constructor(position, position2, scale, cocks, player) {
        this.#position = position;
        this.#position2 = position2;
        this.scale = scale;
        this.cocks = cocks;
        this.#selectedCock = cocks[0];
        this.player = player;
    }

    player_awake() {
        this.#spriteRender = new SpriteRender(this.#position, this.scale,this.#selectedCock.sprites[0]);
        if(this.#player === 1){
            this.#uiHealthBar = document.querySelectorAll(".p1_bar");
            this.#uiTopBar = document.querySelectorAll(".top1_bar");
            this.#uiHealthNum = document.querySelectorAll(".health_n1");
            this.#uiBullets = document.querySelectorAll(".bullet1");
        }else{
            this.#uiHealthBar = document.querySelectorAll(".p2_bar");
            this.#uiTopBar = document.querySelectorAll(".top2_bar");
            this.#uiHealthNum = document.querySelectorAll(".health_n2");
            this.#uiBullets = document.querySelectorAll(".bullet2");
        }
        
        this.updateTopUI();
        this.updateHealthUI();
        this.updateBulletsUI();
    }

    draw(ctx, sprite_id, view1) {
        if(view1){
            this.#spriteRender = new SpriteRender(this.#position, this.scale,this.#selectedCock.sprites[sprite_id]);
            this.#spriteRender.draw(ctx);
        }else{
            this.#spriteRender = new SpriteRender(this.#position2, this.scale,this.#selectedCock.sprites[sprite_id]);
            this.#spriteRender.draw(ctx);
        }
    }

    set position(newPosition) {
        this.#position = newPosition;
    }
    
    get position() {
        return this.#position;
    }

    set player(n){
        if (n < 1 || n > 2){
            throw new PlayerException("Player number must be 1 or 2");
        }else{
            this.#player = n;
        }
    }

    get player(){
        return this.#player;
    }

    damage(amount) {
        this.#selectedCock.vida -= amount;
        if (this.#selectedCock.vida < 0) {
            this.#selectedCock.vida = 0;
        }
        this.updateHealthUI();
    }

    heal(amount){
        this.#selectedCock.vida += amount;
        if (this.#selectedCock.vida > this.#selectedCock.vidaMax) {
            this.#selectedCock.vida = this.#selectedCock.vidaMax;
        }
        this.updateHealthUI();
    }

    recharge(amount){
        this.#selectedCock.bullets += amount;
        if (this.#selectedCock.bullets > this.#selectedCock.bulletsMax) {
            this.#selectedCock.bullets = this.#selectedCock.bulletsMax;
        }
        this.updateBulletsUI();
    }

    useBullets(amount){
        this.#selectedCock.bullets -= amount;
        if (this.#selectedCock.bullets < 0) {
            this.#selectedCock.bullets = 0;
        }
        this.updateBulletsUI();
    }

    updateHealthUI() {
        this.#uiHealthBar[0].style.width = ( this.#selectedCock.vida * 100 / this.#selectedCock.vidaMax) + "%";
        this.#uiHealthBar[1].style.width = ( this.#selectedCock.vida * 100 / this.#selectedCock.vidaMax) + "%";
        this.#uiHealthNum[0].innerText = this.#selectedCock.vida + "/ " + this.#selectedCock.vidaMax;
        this.#uiHealthNum[1].innerText = this.#selectedCock.vida + "/ " + this.#selectedCock.vidaMax;
    }

    updateTopUI(){
        this.#uiTopBar[0].children[0].innerText = this.#selectedCock.nombre;
        this.#uiTopBar[1].children[0].innerText = this.#selectedCock.nombre;
        this.#uiTopBar[0].children[1].innerText = "Poder: " + this.#selectedCock.poder;
        this.#uiTopBar[1].children[1].innerText = "Poder: " + this.#selectedCock.poder;
    }

    updateBulletsUI(){
        let entry = false;

        this.#uiBullets[0].innerHTML = `
            <p class="text2">2/4</p>
        `;

        this.#uiBullets[1].innerHTML = `
            <p class="text2">2/4</p>
        `;

        this.#uiBullets[0].children[0].innerText = this.#selectedCock.bullets + "/ " + this.#selectedCock.bulletsMax;
        this.#uiBullets[1].children[0].innerText = this.#selectedCock.bullets + "/ " + this.#selectedCock.bulletsMax;
        
        for (let i = 0; i < this.#selectedCock.bullets; i++) {
            let icon1 = document.createElement("img");
            icon1.src = "https://png.pngtree.com/png-vector/20240623/ourmid/pngtree-dark-gold-bullet-decoration-illustration-png-image_12827945.png";
            icon1.className = "img_bullet";
            this.#uiBullets[0].appendChild(icon1);

            let icon2 = document.createElement("img");
            icon2.src = "https://png.pngtree.com/png-vector/20240623/ourmid/pngtree-dark-gold-bullet-decoration-illustration-png-image_12827945.png";
            icon2.className = "img_bullet";
            this.#uiBullets[1].appendChild(icon2);

            entry = true;
        }
        if(!entry){
            let icon1 = document.createElement("img");
            icon1.src = "https://png.pngtree.com/png-vector/20240623/ourmid/pngtree-dark-gold-bullet-decoration-illustration-png-image_12827945.png";
            icon1.className = "img_bullet";
            icon1.style.filter = "grayscale(100%)";
            this.#uiBullets[0].appendChild(icon1);

            let icon2 = document.createElement("img");
            icon2.src = "https://png.pngtree.com/png-vector/20240623/ourmid/pngtree-dark-gold-bullet-decoration-illustration-png-image_12827945.png";
            icon2.className = "img_bullet";
            icon2.style.filter = "grayscale(100%)";
            this.#uiBullets[1].appendChild(icon2);
        }
    }
}