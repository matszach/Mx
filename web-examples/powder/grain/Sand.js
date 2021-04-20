class Sand extends Grain {

    constructor(rng) {
        super(rng.int(140, 180), rng.int(60, 100), rng.int(0, 20), 5, false);
        this.corrodability = 0.003;
    }

    doFrame(x, y, table, rng) {
        if(!this.tryToMoveInDirection(x, y, 0, 1, table, 4)) {
            if(rng.chance(0.5)) {
                this.tryToMoveInDirection(x, y, -1, 1, table, 2);
            } else {
                this.tryToMoveInDirection(x, y, 1, 1, table, 2);
            }
        }
    }

}