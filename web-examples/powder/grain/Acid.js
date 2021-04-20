class Acid extends Grain {

    constructor(rng) {
        super(rng.int(80, 100), rng.int(200, 220), 0, 2);
        this.isLiquid = true;
    }

    doFrame(x, y, table, rng) {
        if(this.doCorrode(x, y, table, rng) && rng.chance(0.3)) {
            this.replaceWith(x, y, table, undefined);
        }
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