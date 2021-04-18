class Steam extends Grain {

    constructor(rng) {
        super(rng.int(110, 130), rng.int(110, 130), rng.int(130, 150), -1);
        this.isLiquid = true;
    }

    doFrame(x, y, table, rng) {
        if(rng.chance(0.0001)) {
            if(rng.chance(0.2)) {
                this.replaceWith(x, y, table, new Water(rng));
            } else {
                this.replaceWith(x, y, table, undefined);
            }
            return;
        }
        if(rng.chance(0.5)) {
            if(rng.chance(0.5)) {
                this.tryToMoveInDirection(x, y, -1, 0, table, 1);
            } else {
                this.tryToMoveInDirection(x, y, 1, 0, table, 1);
            }
            return;
        }
        if(!this.tryToMoveInDirection(x, y, 0, -1, table, 1)) {
            if(rng.chance(0.5)) {
                if(!this.tryToMoveInDirection(x, y, -1, -1, table, 1)) {
                    this.tryToMoveInDirection(x, y, -1, 0, table, 1);
                }
            } else {
                if(!this.tryToMoveInDirection(x, y, 1, -1, table, 1)) {
                    this.tryToMoveInDirection(x, y, 1, 0, table, 1);
                }
            }
        }
    }

}