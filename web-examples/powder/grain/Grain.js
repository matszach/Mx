class Grain {

    constructor(color, density, pattern) {
        this.color = color;
        this.density = density;
        this.pattern = pattern;
        this.timeExisted = 0;
        this.updatedThisTurn = false;
    }

    doFrame(x, y, table, rng) {
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

}