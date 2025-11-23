class Battle {
    constructor(player1, player2) {
        this.p1 = player1;
        this.p2 = player2;
        this.Msgstack = false;
    }

    playerChooseMove(playerId, moveIndex) {
        let player = null;
        if(playerId === 1){
            player = this.p1
        }else{
            player = this.p2
        }
        player.chooseAction(moveIndex);

        if(player.selectAction){
            if(player.selectAction.canUse(player)){
                console.log(player.selectedCock.nombre + " ha selecciondo " + player.selectAction.nombre)
                player.UIManager.updateTextBoxUI("Se ha seleccionado tu acción°Esparando a que el otro jugador realice su acción",15,true);
            }else{
                console.log("No se puede usar la acción");
                player.removeAction();
            }
        }
        if (this.p1.selectAction && this.p2.selectAction) {
            this.p1.UIManager.updateTextBoxUI("listo",20);
            this.p2.UIManager.updateTextBoxUI("listo",20);
            this.resolveTurn();
        }
        
        //if(actionDefinitions[player.selectAction].canUse(player.selectedCock)){
            //actionDefinitions[player.selectAction].execute(player,player2);    
        //}else{
            //console.log("No se puede usar la acción");
        //}
    }

    resolveTurn() {
        if(this.p2.selectAction.tipo === "prioritario"){
            this.executeMove(this.p2, this.p1);
        }else{
            this.executeMove(this.p1, this.p2);
        }
        this.p1.rechargeUI();
        this.p2.rechargeUI();
        console.log("hola");
        //if (this.p2.cock.vida > 0) { 
            //this.executeMove(this.p2, this.p1);
        //}
        //this.endTurn();
    }

    executeMove(first, second) {
        let msg1 = first.selectAction.execute(first,second);
        console.log(msg1);
        let msg2 = second.selectAction.execute(second,first);
        console.log(msg2);
    }

    endTurn() {
        // limpiar
        this.p1.selectedMove = null;
        this.p2.selectedMove = null;

        // ¿Victoria?
        if (this.p1.cock.vida <= 0) {
            this.ui.matchEnd(2);
        } else if (this.p2.cock.vida <= 0) {
            this.ui.matchEnd(1);
        }
    }
}
