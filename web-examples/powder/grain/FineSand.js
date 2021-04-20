class FineSand extends Grain {

    constructor(rng) {
        super(rng.int(180, 220), rng.int(160, 200), rng.int(0, 20), 5, false);
    }

    doFrame(x, y, table, rng) {
        if(!this.tryToMoveInDirection(x, y, 0, 1, table, 4)) {
            if(rng.chance(0.5)) {
                if(!this.tryToMoveInDirection(x, y, -1, 1, table, 2)) {
                    this.tryToMoveInDirection(x, y, -2, 1, table, 2)
                }
            } else {
                if(!this.tryToMoveInDirection(x, y, 1, 1, table, 2)) {
                    this.tryToMoveInDirection(x, y, 2, 1, table, 2)
                }
            }
        }
    }

}