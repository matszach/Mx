class Water extends Grain {

    constructor() {
        super(0, 0, 120, 2);
    }

    doFrame(x, y, table, rng) {
        if(!this.tryToMoveInDirection(x, y, 0, 1, table, 3)) {
            if(rng.chance(0.5)) {
                if(!this.tryToMoveInDirection(x, y, -1, 1, table, 5)) {
                    this.tryToMoveInDirection(x, y, -1, 0, table, 6);
                }
            } else {
                if(!this.tryToMoveInDirection(x, y, 1, 1, table, 5)) {
                    this.tryToMoveInDirection(x, y, 1, 0, table, 6);
                }
            }
        }
    }

}