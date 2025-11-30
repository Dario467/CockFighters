const actionDefinitions = {

    recharge: new Action("Recargar",0,"normal",{
        execute(attacker, defender){
            attacker.selectedCock.recharge(1);
            attacker.selectedCock.rechargeShield(2);
            return `${attacker.selectedCock.nombre} recargó° +1 bala y +2 escudos.`;
        }
    },{
        canUse(attacker){
            return attacker.selectedCock.bullets < attacker.selectedCock.bulletsMax || attacker.selectedCock.shields < 8;
        }
    },{
        audioVisual(){
            const soundM = new SoundManager();
            soundM.play("recharge");
        }
    }),

    shield: new Action("Escudo",2,"prioritario",{
        execute(attacker, defender){
            attacker.selectedCock.useShield(2);
            attacker.activeShield();
            return `${attacker.selectedCock.nombre} se protegió con un escudo.`;
        }
    },{
        canUse(attacker){
            return attacker.selectedCock.shields >= 2;
        }
    },{
        audioVisual(){
            const soundM = new SoundManager();
            soundM.play("shield");
        }
    }),

    attack: new Action("Disparar",1,"daño",{
        execute(attacker, defender){
            if(defender.haveShield){
                attacker.selectedCock.useBullets(1);
                return `${attacker.selectedCock.nombre} Disparo. Pero no tuvo efecto ya que ${defender.selectedCock.nombre} ha bloqueado el ataque con su escudo.`;
            }
            defender.selectedCock.damage(attacker.selectedCock.poder);
            attacker.selectedCock.useBullets(1);
            return `${attacker.selectedCock.nombre} atacó a ${defender.selectedCock.nombre}° causando ${attacker.selectedCock.poder} de daño.`;
        }
    },{
        canUse(attacker){
            return attacker.selectedCock.bullets >= 1;
        }
    },{
        audioVisual(){
            const soundM = new SoundManager();
            soundM.play("shot");
        }
    }),

    heal: new Action("Botiquin",1,"prioritario",{
        execute(attacker, defender){
            attacker.selectedCock.useShield(1);
            attacker.selectedCock.heal(attacker.selectedCock.curacion);
            return `${attacker.selectedCock.nombre} se curó ° +${attacker.selectedCock.curacion} de vida.`;        
        }
    },{
        canUse(attacker){
            return attacker.selectedCock.shields >= 1;
        }
    },{
        audioVisual(){
            const soundM = new SoundManager();
            soundM.play("heal");
        }
    }),

    change: new Action("Cambiar",1,"prioritario",{
        execute(attacker, defender){
            attacker.selectNewCock();
            return `${attacker.selectedCock.nombre} fue enviado al campo de batalla`;        
        }
    },{
        canUse(attacker){
            return true;
        }
    },{
        audioVisual(){
            const soundM = new SoundManager();
            soundM.play("change");
        }
    })
}