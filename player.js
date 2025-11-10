class Player {
    constructor(position, scale, spriteSrc) {
        this.position = position;
        this.sprite = spriteSrc;
        this.sprite = new SpriteRender(this.position, scale,spriteSrc);
    }

    draw(ctx) {
        this.sprite.draw(ctx);
        //prueba
    }
}