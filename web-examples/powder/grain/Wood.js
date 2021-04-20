class Wood extends Grain {

    constructor(rng) {
        super(rng.int(50, 70), rng.int(20, 40), 0, 7, false);
        this.flamability = 0.02;
        this.burnsIntoClass = Fire;
    }

    doFrame(x, y, table, rng) {
        // do nothing
    }

}