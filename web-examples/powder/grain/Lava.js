class Lava extends Grain {

    constructor(rng) {
        super(rng.int(110, 155), rng.int(0, 65), 0, 4);
        this.isLiquid = true;
    }

    doFrame(x, y, table, rng) {
        if(table.safeGet(x, y - 1, false) === undefined && rng.chance(0.0005)) {
            this.replaceWith(x, y, table, new Stone(rng));
            return;
        }
        if(this.doMelt(x, y, table, rng) && rng.chance(0.25)) {
            this.replaceWith(x, y, table, new Stone(rng));
            return;
        }
        this.doSetOnFire(x, y, table, rng);
        if(!this.tryToMoveInDirection(x, y, 0, 1, table, 4)) {
            if(rng.chance(0.80)) {
                return;
            }
            if(rng.chance(0.5)) {
                if(!this.tryToMoveInDirection(x, y, -1, 1, table, 1)) {
                    this.tryToMoveInDirection(x, y, -1, 0, table, 1);
                }
            } else {
                if(!this.tryToMoveInDirection(x, y, 1, 1, table, 1)) {
                    this.tryToMoveInDirection(x, y, 1, 0, table, 1);
                }
            }
        }
    }

}