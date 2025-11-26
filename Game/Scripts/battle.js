class Battle {
    constructor(player1, player2) {
        this.p1 = player1;
        this.p2 = player2;
        this.Msgstack = false;
        this.msgStack = [];
    }

    playerChangeCock(playerId,cockIndex){
        let player = null;
        if(playerId === 1){
            player = this.p1
        }else{
            player = this.p2
        }
        player.chooseAction(-1);

        if (this.p1.selectAction && this.p2.selectAction) {
            this.resolveTurn();
        }
    }

    playerChooseMove(playerId, moveIndex) {
        let player = null;
        if(playerId === 1){
            player = this.p1
        }else{
            player = this.p2
        }
        console.log(player);
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
            console.log("player 1 ", this.p1.selectAction);
            this.executeMove(this.p1, this.p2);
        }
        //if (this.p2.cock.vida > 0) { 
            //this.executeMove(this.p2, this.p1);
        //}
        //this.endTurn();
    }

    executeMove(first, second) {
        let msg1 = {
            player: first,
            otherPlayer: second,
            msg: first.selectAction.execute(first,second)
        };
        let msg2 = {
            player: second,
            otherPlayer: first,
            msg: second.selectAction.execute(second,first)
        };
        this.msgStack.push(msg2);
        this.msgStack.push(msg1);
        console.log(this.msgStack);
        this.nextTxt();
    }

    nextTxt(){
        let actionObj = null;
        if(this.msgStack.length > 0) {
            console.log("next");
            actionObj = this.msgStack.pop();
            if(actionObj.player.selectAction.tipo === "daño"){
                actionObj.otherPlayer.rechargeUI();
                this.p1.UIManager.updateTextBoxUI(actionObj.msg,20);
                this.p2.UIManager.updateTextBoxUI(actionObj.msg,20);
            }else{
                actionObj.player.rechargeUI();
                this.p1.UIManager.updateTextBoxUI(actionObj.msg,20);
                this.p2.UIManager.updateTextBoxUI(actionObj.msg,20);
            }
        }else{
            this.endTurn();
        }
    }

    endTurn() {
        // limpiar
        this.p1.removeAction();
        this.p2.removeAction();
        this.p1.deactiveShield();
        this.p2.deactiveShield();
        
        if(!this.p1.selectedCock.alive && !this.p2.selectedCock.alive){
            let p1Change = this.p1.changeToAliveCock();
            let p2Change = this.p2.changeToAliveCock()
            if(!p1Change && !p2Change){
                console.log("empate");
                return;
            }else if(!p1Change){
                console.log("jugador 1 perdio");
                return;
            }else if(!p2Change){
                console.log("jugador 2 perdio");
                return;
            }
        }
        else if(!this.p1.selectedCock.alive){
            if(!this.p1.changeToAliveCock()){
                console.log("jugador 1 perdio");
                return;
            }
        }
        else{
            if(!this.p2.changeToAliveCock()){
                console.log("jugador 2 perdio");
                return;
            }
        }
        
        this.p1.rechargeUI();
        this.p2.rechargeUI();
        this.p1.UIManager.textBoxMenuDisplay(this.p1.player, this.p1.selectedCock.acciones, this.p1.cocks);
        this.p2.UIManager.textBoxMenuDisplay(this.p2.player, this.p2.selectedCock.acciones, this.p2.cocks);
        // ¿Victoria?
        //if (this.p1.cock.vida <= 0) {
            //this.ui.matchEnd(2);
        //} else if (this.p2.cock.vida <= 0) {
            //this.ui.matchEnd(1);
        //}
    }
}
