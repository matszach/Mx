class Grain {

    constructor(color, density) {
        this.color = color;
        this.density = density;
        this.timeExisted = 0;
        this.updatedThisTurn = false;
    }

    doFrame(x, y, table) {
        // abstract
    }

    tryToMoveTo(x, y, tx, ty, table) {
        if(table.inRange(tx, ty)) {
            const target = table.get(tx, ty);
            if(target === undefined || target.density < this.density) {
                table.put(x, y, target);
                table.put(tx, ty, this);
                return true;
            }
        } 
        return false;
    }

}