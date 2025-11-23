const actionDefinitions = {

    recharge: new Action("Recargar",0,"normal",{
        execute(attacker, defender){
            attacker.selectedCock.recharge(1);
            attacker.selectedCock.rechargeShield(2);
            return `${attacker.selectedCock.nombre} recargó° +1 bala y +2 escudos.`;
        }
    },{
        canUse(attacker){
            return attacker.selectedCock.bullets < attacker.selectedCock.bulletsMax && attacker.selectedCock.shields < 8;
        }
    }),

    shield: new Action("Escudo",2,"prioritario",{
        execute(attacker, defender){
            attacker.selectedCock.useShield(2);
            attacker.activeShield();
            return `${attacker.selectedCock.nombre} se portegió con un escudo.`;
        }
    },{
        canUse(attacker){
            return attacker.selectedCock.shields >= 2;
        }
    }),

    attack: new Action("Disparar",1,"daño",{
        execute(attacker, defender){
            if(defender.haveShield){
                return `${attacker.selectedCock.nombre} ataco. Pero no tuvo efecto ya que ${defender.selectedCock.nombre} ha bloqueado el ataque con su escudo.`;
            }
            defender.selectedCock.damage(attacker.selectedCock.poder);
            attacker.selectedCock.useBullets(1);
            return `${attacker.selectedCock.nombre} atacó a ${defender.selectedCock.nombre}° causando ${attacker.selectedCock.poder} de daño.`;
        }
    },{
        canUse(attacker){
            return attacker.selectedCock.bullets >= 1;
        }
    }),

    heal: new Action("Botequin",1,"prioritario",{
        execute(attacker, defender){
            attacker.selectedCock.useShield(1);
            attacker.selectedCock.heal(attacker.selectedCock.curacion);
            return `${attacker.selectedCock.nombre} se curó ° +${attacker.selectedCock.curacion} de vida.`;        
        }
    },{
        canUse(attacker){
            return attacker.selectedCock.shields >= 1;
        }
    })
}