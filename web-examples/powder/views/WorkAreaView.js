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
        this._selectedGrainType;
        this._selectedBrushSize = 3;
    }

    onCreate() {
        this.grainButtons = [];
        this.sizeButtons = [];
        this.tooltip = null;
        const view = this;
        [
            ['Sand', Sand, '#994400', true],
            ['Water', Water, '#0000ff'],
            ['Wood', Wood, '#442200'],
            ['Oil', Oil, '#999900'],
            ['Air', undefined, '#000000']
        ].forEach(v => {
            const button = Mx.Geo.Rectangle.create(0, 0, 30, 30, v[2], '#ffffff', 2);
            if(v[3]) {
                view._selectedGrainType = v[1];
                button.borderColor = '#ff0000';
            }
            button.on('over', () => {
                document.body.style.cursor = 'pointer';
                button.borderThickness = 3;
                // tooltip.content = v[0];
                // tooltip.show();
            }).on('out', () => {
                document.body.style.cursor = 'default';
                button.borderThickness = 2;
                // tooltip.hide();
            }).on('up', () => {
                view._selectedGrainType = v[1];
                view.grainButtons.forEach(b => b.borderColor = '#ffffff');
                button.borderColor = '#ff0000';
            });
            view.grainButtons.push(button);
        });
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

    drawButtons(handler) {
        this.grainButtons.forEach(b => {
            handler.draw(b);
            b.listen();
        });
    }

    doGrainDrop(input) {
        const mouse = input.mouse();
        const tx = (mouse.xInCanvas - this._vpX)/this._grainSize;
        const ty = (mouse.yInCanvas - this._vpY)/this._grainSize;
        if(mouse.left || mouse.right) {
            const sx = Math.floor(tx - this._selectedBrushSize/2);
            const sy = Math.floor(ty - this._selectedBrushSize/2);
            const ex = Math.floor(tx + this._selectedBrushSize/2);
            const ey = Math.floor(ty + this._selectedBrushSize/2);
            console.log(this._selectedGrainType);
            for(let x = sx; x < ex; x++) {
                for(let y = sy; y < ey; y++) {
                    const grain = this._selectedGrainType ? new this._selectedGrainType(this.rng) : undefined;
                    this.table.put(x, y, grain);
                }
            }
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
        this.drawButtons(handler);
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
        this.grainButtons.forEach((b, i) => {
            b.x = this._vpX + 15 + i * 40;
            b.y = this._vpY + 15;
        }, this);
    }

}