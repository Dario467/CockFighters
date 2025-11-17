class SpriteRender{
    position;
    #scale;
    image;
    constructor(position, scale, imageSrc){
        this.position = position;
        this.#scale = scale;

        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw(ctx){
        if (!this.image.complete) return;

        ctx.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.#scale.x,
        this.#scale.y
        );
    }
}