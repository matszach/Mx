class Void extends Grain {

    constructor(rng) {
        super(rng.int(80, 100), 0, rng.int(40, 50), 7, false);
        this.isVoid = true;
    }

    doFrame(x, y, table, rng) {
        this.r = rng.int(80, 100);
        this.b = rng.int(40, 50);
        this.consume(x, y + 1, table);
        this.consume(x, y - 1, table);
        this.consume(x + 1, y, table);
        this.consume(x - 1, y, table);
    }

    consume(x, y, table) {
        const g = table.safeGet(x, y, undefined);
        if(!!g && !g.isVoid) {
            this.replaceWith(x, y, table, undefined);
        }
    }

}