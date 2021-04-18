class Wood extends Grain {

    constructor(rng) {
        super(rng.int(50, 70), rng.int(20, 40), 0, 7, false);
    }

    doFrame(x, y, table, rng) {
        // do nothing
    }

}