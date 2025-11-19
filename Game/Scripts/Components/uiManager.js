class UIManager{
    #uiHealthBar;
    #uiTopBar;
    #uiHealthNum;
    #uiBullets;
    #uiShield;

    constructor(player){
        this.Awake(player)
    }

    Awake(player){
        if(player === 1){
            this.#uiHealthBar = document.querySelectorAll(".p1_bar");
            this.#uiTopBar = document.querySelectorAll(".top1_bar");
            this.#uiHealthNum = document.querySelectorAll(".health_n1");
            this.#uiBullets = document.querySelectorAll(".bullet1");
            this.#uiShield = document.querySelectorAll(".shield1");
        }else{
            this.#uiHealthBar = document.querySelectorAll(".p2_bar");
            this.#uiTopBar = document.querySelectorAll(".top2_bar");
            this.#uiHealthNum = document.querySelectorAll(".health_n2");
            this.#uiBullets = document.querySelectorAll(".bullet2");
            this.#uiShield = document.querySelectorAll(".shield2");
        }
    }

    updateHealthUI(vida, vidaMax) {
        this.#uiHealthBar[0].style.width = ( vida * 100 / vidaMax) + "%";
        this.#uiHealthBar[1].style.width = ( vida * 100 / vidaMax) + "%";
        this.#uiHealthNum[0].innerText = vida + "/ " + vidaMax;
        this.#uiHealthNum[1].innerText = vida + "/ " + vidaMax;
    }

    updateTopUI(nombre, poder){
        this.#uiTopBar[0].children[0].innerText = nombre;
        this.#uiTopBar[1].children[0].innerText = nombre;
        this.#uiTopBar[0].children[1].innerText = "Poder: " + poder;
        this.#uiTopBar[1].children[1].innerText = "Poder: " + poder;
    }

    updateBulletsUI(bullets, bulletsMax){
        let entry = false;

        this.#uiBullets[0].innerHTML = `
            <p class="text2">2/4</p>
        `;

        this.#uiBullets[1].innerHTML = `
            <p class="text2">2/4</p>
        `;

        this.#uiBullets[0].children[0].innerText = bullets + "/ " + bulletsMax;
        this.#uiBullets[1].children[0].innerText = bullets + "/ " + bulletsMax;
        
        for (let i = 0; i < bullets; i++) {
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

    updateShieldUI(shields){
        this.#uiShield[0].innerHTML = "";
        this.#uiShield[1].innerHTML = "";
        for (let i = 0; i < shields; i++) {
            let icon1 = document.createElement("img");
            icon1.src = "https://img1.picmix.com/output/stamp/normal/4/5/1/1/551154_f9f85.png";
            icon1.className = "img_shield";
            this.#uiShield[0].appendChild(icon1);

            let icon2 = document.createElement("img");
            icon2.src = "https://img1.picmix.com/output/stamp/normal/4/5/1/1/551154_f9f85.png";
            icon2.className = "img_shield";
            this.#uiShield[1].appendChild(icon2);
        }
    }
}