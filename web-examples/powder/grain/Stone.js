class Stone extends Grain {

    constructor(rng) {
        super(rng.int(60, 90), rng.int(60, 90), rng.int(60, 90), 5, false);
        this.corrodability = 0.002;
    }

    doFrame(x, y, table, rng) {
        if(!this.tryToMoveInDirection(x, y, 0, 1, table, 5)) {
            if(rng.chance(0.5)) {
                this.tryToMoveInDirection(x, y, -1, 1, table, 2);
            } else {
                this.tryToMoveInDirection(x, y, 1, 1, table, 2);
            }
        }
    }

}