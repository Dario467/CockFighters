class SoundManager {
    constructor() {
        if (SoundManager.instancia) {
            return SoundManager.instancia; 
        }

        this.sounds = {
            recharge: new Audio("/Assets/Sounds/reloadCock.wav"),
            shot: new Audio("/Assets/Sounds/shotCock.wav"),
            heal: new Audio("/Assets/Sounds/healCock.mp3"),
            shield: new Audio("/Assets/Sounds/protectCock.wav"),
            change: new Audio("/Assets/Sounds/screamCock.wav")
        };

        this.muted = false;

        SoundManager.instancia = this;
    }

    play(name) {
        const sound = this.sounds[name];
        console.log(sound);
        if (!sound) {
            console.warn("Sonido no encontrado:", name);
            return;
        }
        sound.currentTime = 0;
        sound.play();
    }
}