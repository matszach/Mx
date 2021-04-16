class Sand extends Grain {

    constructor() {
        super('#994400', 5);
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