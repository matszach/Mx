class Sand extends Grain {

    constructor() {
        super('#994400', 5);
    }

    doFrame(x, y, table) {
        if(this.tryToMoveTo(x, y, x, y + 1, table)) { 
            return;
        } else if(this.tryToMoveTo(x, y, x - 1, y + 1, table)) {
            return;
        } else if(this.tryToMoveTo(x, y, x + 1, y + 1, table)) {
            return;
        }
    }

}