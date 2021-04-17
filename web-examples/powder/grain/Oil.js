class Oil extends Grain {

    constructor() {
        super('#ffff00', 1);
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