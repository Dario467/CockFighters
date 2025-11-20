class Battle {
    constructor(player1, player2) {
        this.p1 = player1;
        this.p2 = player2;
    }

    playerChooseMove(playerId, moveIndex) {
        let player = null;
        if(playerId === 1){
            player = this.p1
        }else{
            player = this.p2
        }
        console.log(player.selectedCock.nombre + " eligió el movimiento " + moveIndex);

        //player.chooseMove(moveIndex);

        // si ambos eligieron, procesamos el turno
        //if (this.p1.selectedMove && this.p2.selectedMove) {
            //this.resolveTurn();
        //}
    }

    resolveTurn() {
        // prioridad simple: primero player 1, luego player 2
        this.executeMove(this.p1, this.p2);
        if (this.p2.cock.vida > 0) { 
            this.executeMove(this.p2, this.p1);
        }

        this.endTurn();
    }

    executeMove(attacker, defender) {
        const move = attacker.selectedMove;
        if (!move) return;

        // checar recursos (balas/energía)
        if (attacker.cock.bullets < move.cost) {
            console.warn(attacker.id, "no tiene balas suficientes");
            return;
        }

        attacker.cock.bullets -= move.cost;

        move.execute(attacker.cock, defender.cock);

        // ACTUALIZAR UI
        this.ui.updateHealth(defender.id, defender.cock.vida, defender.cock.vidaMax);
        this.ui.updateBullets(attacker.id, attacker.cock.bullets, attacker.cock.bulletsMax);
        this.ui.playAttackAnimation(attacker.id, move.type);
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
