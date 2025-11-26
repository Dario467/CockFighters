class PlayerException{
    constructor(errorMessage){
        this.message = errorMessage;
    }
}

class Player {
    #spriteRender;
    #UIManager;

    #position;
    #position2;
    #selectedCock;
    #selectAction;
    #player;
    #haveShield;

    constructor(position, position2, scale, cocks, player,background) {
        this.#position = position;
        this.#position2 = position2;
        this.scale = scale;
        this.cocks = cocks;
        this.#selectedCock = cocks[0];
        this.#player = player;
        this.#selectAction = null;
        this.#haveShield = false;
        this.background = background;
    }

    player_awake() {
        this.#spriteRender = new SpriteRender(this.#position, this.scale,this.#selectedCock.sprites["spriteBack"]);
        this.#UIManager = new UIManager(this.#player);
        this.#UIManager.updateHealthUI(this.#selectedCock.vida,this.#selectedCock.vidaMax);
        this.#UIManager.updateTopUI(this.#selectedCock.nombre,this.#selectedCock.poder);
        this.#UIManager.updateBulletsUI(this.#selectedCock.bullets,this.#selectedCock.bulletsMax);
        this.#UIManager.updateShieldUI(this.#selectedCock.shields);
        this.#UIManager.textBoxMenuDisplay(this.#player,this.#selectedCock.acciones);
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

    get selectedCock(){
        return this.#selectedCock;
    }

    get selectAction(){
        return this.#selectAction;
    }

    get UIManager(){
        return this.#UIManager;
    }

    get haveShield(){
        return this.#haveShield;
    }

    chooseAction(moveIndex){
        if(moveIndex === -1){
            this.#selectAction = "cambiar";
            return;
        }
        this.#selectAction = actionDefinitions[this.#selectedCock.acciones[moveIndex]];
    }

    removeAction(){
        this.#selectAction = null;
    }

    activeShield(){
        this.#haveShield = true;
    }

    deactiveShield(){
        this.#haveShield = false;
    }

    changeToAliveCock(){
        for(const cock of this.cocks){
            if(cock.alive){
                this.#selectedCock = cock;
                return true;
            }
        }
        return false;
    }

    rechargeUI(){
        this.#UIManager.updateBulletsUI(this.#selectedCock.bullets,this.#selectedCock.bulletsMax);
        this.#UIManager.updateShieldUI(this.#selectedCock.shields);
        this.#UIManager.updateHealthUI(this.#selectedCock.vida,this.#selectedCock.vidaMax);
        this.#UIManager.updateBulletsUI(this.#selectedCock.bullets,this.#selectedCock.bulletsMax);
        this.#UIManager.updateShieldUI(this.#selectedCock.shields);
        this.#UIManager.updateHealthUI(this.#selectedCock.vida,this.#selectedCock.vidaMax);    
    }
}