class Player {
    #spriteRender;
    #position;
    constructor(position, scale, cocks, backView) {
        this.#position = position;
        this.scale = scale;
        this.cocks = cocks;
        this.backView = backView;
    }

    player_awake() {
        this.#spriteRender = new SpriteRender(this.#position, this.scale,this.cocks[0].sprites[0]);
    }

    draw(ctx, sprite_id) {
        this.#spriteRender = new SpriteRender(this.#position, this.scale,this.cocks[0].sprites[sprite_id]);
        this.#spriteRender.draw(ctx);
    }

    set position(newPosition) {
        this.#position = newPosition;
    }
    
    get position() {
        return this.#position;
    }
}