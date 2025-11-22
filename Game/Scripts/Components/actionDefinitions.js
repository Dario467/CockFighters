const actionDefinitions = {
    recharge: new Action("Recargar",0,"normal",{
        execute(attacker, defender){
            attacker.recharge(1);
        }
    },{
        canUse(attacker){
            return attacker.bullets < attacker.bulletsMax;
        }
    })
}