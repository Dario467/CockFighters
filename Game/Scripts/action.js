class Action{
    constructor(nombre,costo,tipo,execute = null,canUse = null,audioVisual = null){
        this.nombre = nombre;
        this.costo = costo;
        this.tipo = tipo;
        this.execute = execute.execute;
        this.canUse = canUse.canUse;
        this.audioVisual = audioVisual.audioVisual;
    }
}