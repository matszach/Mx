class Grain {

    constructor(r, g, b, density) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.density = density;
        this.isLiquid = false;
        this.timeExisted = 0;
        this.updatedThisTurn = false;
        this.flamability = 0;
        this.burnsIntoClass = null;
        this.meltability = 0;
        this.meltsIntoClass = null;
        this.putOutFireChance = 0;
        this.corrodability = 0;
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

    tryToSetOnFire(x, y, table, rng) {
        const g = table.safeGet(x, y, undefined);
        if(!!g && g.flamability > 0) {
            if(rng.chance(g.flamability)) {
                this.replaceWith(x, y, table, new g.burnsIntoClass(rng));
                return true;
            }
        }
        return false;
    }

    doSetOnFire(x, y, table, rng) {
        const u = this.tryToSetOnFire(x, y - 1, table, rng);
        const d = this.tryToSetOnFire(x, y + 1, table, rng);
        const l = this.tryToSetOnFire(x + 1, y, table, rng);
        const r = this.tryToSetOnFire(x - 1, y, table, rng);
        return u || d || l || r;
    }

    tryToMelt(x, y, table, rng) {
        const g = table.safeGet(x, y, undefined);
        if(!!g && g.meltability > 0) {
            if(rng.chance(g.meltability)) {
                this.replaceWith(x, y, table, new g.meltsIntoClass(rng));
                return true;
            }
        }
        return false;
    }

    doMelt(x, y, table, rng) {
        const u = this.tryToMelt(x, y - 1, table, rng);
        const d = this.tryToMelt(x, y + 1, table, rng);
        const l = this.tryToMelt(x + 1, y, table, rng);
        const r = this.tryToMelt(x - 1, y, table, rng);
        return u || d || l || r;
    }

    tryToCorrode(x, y, table, rng) {
        const g = table.safeGet(x, y, undefined);
        if(!!g && g.corrodability > 0) {
            if(rng.chance(g.corrodability)) {
                this.replaceWith(x, y, table, undefined);
                return true;
            }
        }
        return false;
    }

    doCorrode(x, y, table, rng) {
        const d = this.tryToCorrode(x, y + 1, table, rng);
        const l = this.tryToCorrode(x + 1, y, table, rng);
        const r = this.tryToCorrode(x - 1, y, table, rng);
        return d || l || r;
    }

}