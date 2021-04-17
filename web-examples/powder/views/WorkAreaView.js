class WorkAreaView extends BaseView {
    
    constructor(xSize, ySize) {
        super();
        this.table = new Mx.Ds.Array2D(xSize, ySize);
        this.rng = Mx.Rng.fromMathRandom();
        this._vpX = 10;
        this._vpY = 10;
        this._vpWidth = 100;
        this._vpHeight = 100;
        this._grainSize = 1;
    }

    unmarkGrains() {
        this.table.forEach(v => {
            if(!!v) {
                v.updatedThisTurn = false;
            }
        });
    }

    moveGrains() { 
        this.table.forEach((v, x, y) => {
            if(!v || v.updatedThisTurn) {
                return;
            }
            v.doFrame(x, y, this.table, this.rng);
            v.updatedThisTurn = true;
        });
    }

    drawGrains(handler) {
        handler.pix.initImageData(Math.floor(this._vpWidth), Math.floor(this._vpHeight));
        handler.pix.clear(0, 0, 0);
        const gs = Math.ceil(this._grainSize);
        this.table.forEach((v, x, y) => {
            if(!!v) {
                handler.pix.putRectangle(
                    Math.floor(x * this._grainSize), 
                    Math.floor(y * this._grainSize),
                    gs, gs, v.r, v.g, v.b
                );
            }
        });
        handler.pix.displayImageData(Math.floor(this._vpX), Math.floor(this._vpY));
    }

    doGrainDrop(input) {
        const mouse = input.mouse();
        const tx = Math.round((mouse.xInCanvas - this._vpX)/this._grainSize);
        const ty = Math.round((mouse.yInCanvas - this._vpY)/this._grainSize);
        if(mouse.left) {
            this.table.put(tx, ty, new Sand(this.rng));
            this.table.put(tx + 1, ty, new Sand(this.rng));
            this.table.put(tx, ty + 1, new Sand(this.rng));
            this.table.put(tx + 1, ty + 1, new Sand(this.rng));
        } else if(mouse.right) {
            this.table.put(tx, ty, new Water(this.rng));
            this.table.put(tx + 1, ty, new Water(this.rng));
            this.table.put(tx, ty + 1, new Water(this.rng));
            this.table.put(tx + 1, ty + 1, new Water(this.rng));
        }
    }

    doFrame(input, handler, loop) {
        // let time = Date.now();
        this.unmarkGrains();
        this.moveGrains();
        this.doGrainDrop(input);
        // let logic = Date.now();
        this.drawBackground(handler);
        this.drawGrains(handler);
        // let draw = Date.now();
        // console.log('draw time ', draw - logic, 'logic time ', logic - time);
    }

    onRefit(handler) {
        const viewWidth = handler.canvas.width - 20;
        const viewHeight = handler.canvas.height - 20;
        const areaWidth = this.table.xSize;
        const areaHeight = this.table.ySize;
        if(viewHeight/viewWidth > areaHeight/areaWidth) {
            this._vpWidth = viewWidth;
            this._vpHeight = viewWidth * areaHeight/areaWidth;
            this._vpX = 10;
            this._vpY = 10 + (viewHeight - this._vpHeight) / 2;
        } else {
            this._vpWidth = viewHeight * areaWidth/areaHeight;
            this._vpHeight = viewHeight;
            this._vpX = 10 + (viewWidth - this._vpWidth) / 2;
            this._vpY = 10; 
        }
        this._grainSize = this._vpHeight/areaHeight;
    }

}