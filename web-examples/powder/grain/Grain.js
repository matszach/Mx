class Grain {

    constructor(r, g, b, density) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.density = density;
        this.isLiquid = false;
        this.timeExisted = 0;
        this.updatedThisTurn = false;
    }

    doFrame(x, y, table, rng) {
        // abstract
    }

    tryToMoveTo(x, y, tx, ty, table) {
        if(table.inRange(tx, ty)) {
            const target = table.get(tx, ty);
            if(this.canSwap(target, y === ty)) {
                table.put(x, y, target);
                table.put(tx, ty, this);
                return true;
            }
        } 
        return false;
    }

    canSwap(target, sameYLevel) {
        if(target === undefined) {
            return true;
        } else if(this.isLiquid && target.isLiquid && sameYLevel) {
            return this.density >= target.density;
        } else {
            return this.density > target.density;
        }
    }

    tryToMoveInDirection(x, y, dx, dy, table, steps) {
        let moved = false;
        for(let i = 0; i < steps; i++) {
            const cx = x + i * dx;
            const cy = y + i * dy;
            const tx = x + (i + 1) * dx;
            const ty = y + (i + 1) * dy;
            if(this.tryToMoveTo(cx, cy, tx, ty, table)) {
                moved = true
            } else {
                break;
            }
        }
        return moved;
    }

    replaceWith(x, y, table, grain) {
        table.put(x, y, grain);
    }

}