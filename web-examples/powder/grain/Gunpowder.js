class Gunpowder extends Grain {

    constructor(rng) {
        super(rng.int(30, 40), rng.int(30, 40), rng.int(30, 40), 5, false);
        this.flamability = 0.20;
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