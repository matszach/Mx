class Water extends Grain {

    constructor(rng) {
        super(0, rng.int(0, 50), rng.int(200, 255), 2);
        this.isLiquid = true;
    }

    doFrame(x, y, table, rng) {
        if(!this.tryToMoveInDirection(x, y, 0, 1, table, 3)) {
            if(rng.chance(0.5)) {
                if(!this.tryToMoveInDirection(x, y, -1, 1, table, 2)) {
                    this.tryToMoveInDirection(x, y, -1, 0, table, 3);
                }
            } else {
                if(!this.tryToMoveInDirection(x, y, 1, 1, table, 2)) {
                    this.tryToMoveInDirection(x, y, 1, 0, table, 3);
                }
            }
        }
    }

}