class Brick extends Grain {

    constructor(rng) {
        super(rng.int(40, 60), 0, rng.int(0, 10), 5, false);
    }

    doFrame(x, y, table, rng) {
        this.tryToMoveInDirection(x, y, 0, 1, table, 5);
    }

}