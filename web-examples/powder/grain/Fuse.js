class Fuse extends Grain {

    constructor(rng) {
        super(rng.int(120, 140), rng.int(120, 140), 0, 7, false);
        this.flamability = 0.75;
        this.burnsIntoClass = Fire;
        this.corrodability = 0.1;
    }

    doFrame(x, y, table, rng) {
        // do nothing
    }

}