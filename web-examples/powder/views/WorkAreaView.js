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

        // TEST
        for(let i = 120; i < 180; i++) {
            this.table.put(i, 50, new Wood());
        }
        for(let i = 180; i < 220; i++) {
            this.table.put(i, -50 + i, new Wood());
            this.table.put(i, -50 + i + 1, new Wood());
        }
        // TEST
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
        this.table.forEach((v, x, y) => {
            if(!!v) {
                handler.fillRect(
                    this._vpX + x * this._grainSize,
                    this._vpY + y * this._grainSize,
                    this._grainSize,
                    this._grainSize,
                    v.color
                );
            }
        });
    }

    drawBackground(handler) {
        super.drawBackground(handler);
        handler.fillRect(this._vpX, this._vpY, this._vpWidth, this._vpHeight);
    }

    doFrame(input, handler, loop) {

        // TEST
        this.table.put(this.rng.int(100, 200), 0, new Sand());
        this.table.put(this.rng.int(100, 200), 0, new Sand());
        this.table.put(this.rng.int(100, 200), 0, new Water());
        this.table.put(this.rng.int(100, 200), 0, new Water());
        this.table.put(this.rng.int(100, 200), 0, new Oil());
        // TEST

        // let time = Date.now();
        this.unmarkGrains();
        this.moveGrains();
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