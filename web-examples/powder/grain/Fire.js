class Fire extends Grain {

    constructor(rng) {
        super(rng.int(210, 255), rng.int(0, 125), 0, 0);
        this.isLiquid = true;
    }

    doFrame(x, y, table, rng) {
        if(rng.chance(0.02)) {
            this.replaceWith(x, y, table, new Smoke(rng));
            return;
        }
        if(this.doMelt(x, y, table, rng) && rng.chance(0.5)) {
            this.replaceWith(x, y, table, new Smoke(rng));
            return;
        }
        this.doSetOnFire(x, y, table, rng);
        if(rng.chance(0.6)) {
            if(rng.chance(0.5)) {
                this.tryToMoveInDirection(x, y, -1, 0, table, 1);
            } else {
                this.tryToMoveInDirection(x, y, 1, 0, table, 1);
            }
            return;
        }
        if(!this.tryToMoveInDirection(x, y, 0, 1, table, 1)) {
            if(rng.chance(0.5)) {
                this.tryToMoveInDirection(x, y, -1, 1, table, 1);
            } else {
                this.tryToMoveInDirection(x, y, 1, 1, table, 1);
            }
        }
    }

}