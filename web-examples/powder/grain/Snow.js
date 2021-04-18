class Snow extends Grain {

    constructor(rng) {
        super(rng.int(235, 255), rng.int(235, 255), 255, 5);
    }

    doFrame(x, y, table, rng) {
        if(rng.chance(0.00001)) {
            this.replaceWith(x, y, table, new Water(rng));
            return;
        }
        if(!this.tryToMoveInDirection(x, y, 0, 1, table, 1)) {
            if(rng.chance(0.5)) {
                this.tryToMoveInDirection(x, y, -1, 1, table, 1);
            } else {
                this.tryToMoveInDirection(x, y, 1, 1, table, 1);
            }
        }
    }

}