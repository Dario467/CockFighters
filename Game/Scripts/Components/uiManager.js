class UIManager{
    #uiHealthBar;
    #uiTopBar;
    #uiHealthNum;
    #uiBullets;
    #uiShield;
    #uiActionMenu;

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
            this.#uiActionMenu = document.getElementById("cardMenu1");
        }else{
            this.#uiHealthBar = document.querySelectorAll(".p2_bar");
            this.#uiTopBar = document.querySelectorAll(".top2_bar");
            this.#uiHealthNum = document.querySelectorAll(".health_n2");
            this.#uiBullets = document.querySelectorAll(".bullet2");
            this.#uiShield = document.querySelectorAll(".shield2");
            this.#uiActionMenu = document.getElementById("cardMenu2");
        }
    }

    async updateTextBoxUI(text,speed,loading = false){
        this.#uiActionMenu.innerHTML = `
        <div class="card_container">
            <div class="card textCenter txt_box" style="width:1030px; height:170px">
                <p class="box_txt action_txt"></p>
            </div>
        </div>
        `;
        if(loading){
            let actionText = this.#uiActionMenu.querySelector(".action_txt");
            this.type(actionText, text, speed);
            let img1 = document.createElement("img");
            img1.src = "https://i.pinimg.com/originals/a4/f2/cb/a4f2cb80ff2ae2772e80bf30e9d78d4c.gif"
            img1.className = "next";
            this.#uiActionMenu.querySelector(".txt_box").appendChild(img1);
        }else{
            let actionText = this.#uiActionMenu.querySelector(".action_txt");
            await this.type(actionText, text, speed);
            let img1 = document.createElement("img");
            img1.src = "https://cdn-icons-png.flaticon.com/512/3416/3416083.png";
            img1.className = "next";
            img1.onclick = () => nextFun();
            this.#uiActionMenu.querySelector(".txt_box").appendChild(img1);
        }
    }

    textBoxMenuDisplay(player, actions, gallos){
         this.#uiActionMenu.innerHTML = `
         <div class="card_container">
                <div class="card textback" style="width:764px; height:170px">
                    <h2 class="title_txt">Selector de acciones</h2>
                    <div class="containerButtons">
                        
                    </div>
                </div>
            </div>
            <div class="card_container">
                <div class="card textback" style="width:258px; height:170px">
                    <h2 class="title_txt">Tus Gallo</h2>
                    <div class="container containerCock">
                    
                    </div>
                </div>
            </div>
        </div>
        `;
        let button_cont = this.#uiActionMenu.querySelector(".containerButtons");
        for(let i = 0; i < actions.length; i++){
            let action = actions[i];
            let boton = document.createElement("button");
            boton.className = "action-button";
            boton.onclick = () => chooseMove(player, i);
            boton.innerText = actionDefinitions[action].nombre;
            button_cont.appendChild(boton);
        }

        let cock_cont = this.#uiActionMenu.querySelector(".containerCock");
        for(let i = 0; i < gallos.length; i++){
            let gallo = gallos[i];
            let galloSprite = gallo.sprites["spriteBack"];
            let galloCardHTML = null;
            if(gallo.isSelected){
                galloCardHTML = `
                <div class="gallo-card selected-gallo" style="width:80px; height:80px" onclick="chooseCock(${player},${i})">
                    <img src="${galloSprite}" width="75" height="75">
                </div>
                `;
            }else if(gallo.alive){
                galloCardHTML = `
                <div class="gallo-card" style="width:80px; height:80px" onclick="chooseCock(${player},${i})">
                    <img src="${galloSprite}" style="filter: brightness(100%);" width="75" height="75">
                </div>
                `;
            }else{
                galloCardHTML = `
                <div class="gallo-card" style="width:80px; height:80px" onclick="chooseCock(${player},${i})">
                    <img src="${galloSprite}" style="filter: grayscale(100%);" width="75" height="75">
                </div>
                `;
            }
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = galloCardHTML;
            const galloCard = tempDiv.firstElementChild;
            cock_cont.appendChild(galloCard);
        }
    }

    async type(elem, text, speed) {
        elem.innerHTML = "";
        for (let char of text) {
            if(char === "°"){
                elem.innerHTML += "<br>";
            }else{
                elem.innerHTML += char;
            }
            await new Promise(res => setTimeout(res, speed));
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