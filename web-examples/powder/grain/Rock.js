class Rock extends Grain {

    constructor(rng) {
        super(rng.int(60, 70), rng.int(60, 70), rng.int(60, 70), 7, false);
        this.corrodability = 0.002;
    }

    doFrame(x, y, table, rng) {
        // do nothing
    }

}