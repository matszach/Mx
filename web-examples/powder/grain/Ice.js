class Ice extends Grain {

    constructor(rng) {
        super(rng.int(205, 225), rng.int(205, 225), 255, 5);
        this.meltability = 0.03;
        this.meltsIntoClass = Water;
    }

    doFrame(x, y, table, rng) {
        if(rng.chance(0.000003)) {
            this.replaceWith(x, y, table, new Water(rng));
            return;
        }
    }

}