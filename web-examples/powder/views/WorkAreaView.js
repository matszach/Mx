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
        this._isMouseOverAButton = false;
        this._tooltipContent = '';
    }

    onCreate() {
        this.grainButtons = [];
        this.sizeButtons = [];
        this.miscButtons = [];
        this.tooltip = null;
        const view = this;
        [
            ['Sand', Sand, '#994400', true],
            ['Fine sand', FineSand, '#bbaa00'],
            ['Water', Water, '#0000ff'],
            ['Snow', Snow, '#ffffff'],
            ['Ice', Ice, '#ddddff'],
            ['Steam', Steam, '#777799'],
            ['Wood', Wood, '#442200'],
            ['Brick', Brick, '#660011'],
            ['Oil', Oil, '#999900'],
            ['Air', undefined, '#000000'],
            ['Smoke', Smoke, '#333333'],
            ['Fire', Fire, '#ff5500'],
            ['Gunpowder', Gunpowder, '#333333'],
            ['Fuse', Fuse, '#aaaa00'],
            ['Rock', Rock, '#555555'],
            ['Lava', Lava, '#992200'],
            ['Stone', Stone, '#555555'],
            ['Acid', Acid, '#66dd00'],
            ['Void', Void, '#990044'],
        ].forEach(v => {
            const button = Mx.Geo.Rectangle.create(0, 0, 20, 20, v[2], '#ffffff', 2);
            if(v[3]) {
                view._selectedGrainType = v[1];
                button.borderColor = '#ff0000';
            }
            button.on('over', () => {
                document.body.style.cursor = 'pointer';
                view._isMouseOverAButton = true;
                button.borderThickness = 3;
                view._tooltipContent = v[0];
            }).on('out', () => {
                document.body.style.cursor = 'default';
                view._isMouseOverAButton = false;
                button.borderThickness = 2;
            }).on('up', () => {
                view._selectedGrainType = v[1];
                view.grainButtons.forEach(b => b.borderColor = '#ffffff');
                button.borderColor = '#ff0000';
            });
            view.grainButtons.push(button);
        });
        [
            ['S ', 'Small', 3, true],
            ['M ', 'Medium', 7],
            ['L ', 'Large', 15],
        ].forEach(v => {
            const button = Mx.Text.create(0, 0, v[0], '#ffffff', 28, 'Roboto Sans-Serif');
            if(v[3]) {
                view._selectedBrushSize = v[1];
                button.color = '#ff0000';
            }
            button.on('over', () => {
                document.body.style.cursor = 'pointer';
                view._isMouseOverAButton = true;
                view._tooltipContent = `${v[1]} brush (${v[2]}x${v[2]})`;
            }).on('out', () => {
                document.body.style.cursor = 'default';
                view._isMouseOverAButton = false;
            }).on('up', () => {
                view._selectedBrushSize = v[2];
                view.sizeButtons.forEach(b => b.color = '#ffffff');
                button.color = '#ff0000';
            });
            view.sizeButtons.push(button);
        });
        [
            ['Clear', 'Clears the work area', view => view.clearPowderTable()],
            ['Menu', 'Returns to main menu', view => Game.toView('Menu')]
        ].forEach(v => {
            const button = Mx.Text.create(0, 0, v[0], '#ffffff', 28, 'Roboto Sans-Serif');
            button.on('over', () => {
                document.body.style.cursor = 'pointer';
                view._isMouseOverAButton = true;
                view._tooltipContent = v[1];
            }).on('out', () => {
                document.body.style.cursor = 'default';
                view._isMouseOverAButton = false;
            }).on('up', () => {
                v[2](view);
            });
            view.miscButtons.push(button);
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
        [...this.grainButtons, ...this.sizeButtons, ...this.miscButtons].forEach(b => {
            handler.draw(b);
            b.listen();
        });
    }

    drawTooltip(handler) {
        if(this._isMouseOverAButton) {
            handler.write(handler.canvas.width/2 - 48, this._vpY + 40, this._tooltipContent, '#ffffff', 28);
        }
    }

    doGrainDrop(input) {
        if(this._isMouseOverAButton) {
            return;
        }
        const mouse = input.mouse();
        const tx = (mouse.xInCanvas - this._vpX)/this._grainSize;
        const ty = (mouse.yInCanvas - this._vpY)/this._grainSize;
        if(mouse.left || mouse.right) {
            const sx = Math.floor(tx - this._selectedBrushSize/2);
            const sy = Math.floor(ty - this._selectedBrushSize/2);
            const ex = Math.floor(tx + this._selectedBrushSize/2);
            const ey = Math.floor(ty + this._selectedBrushSize/2);
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
        this.drawTooltip(handler);
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
            b.x = this._vpX + 15 + (i % 10) * 25;
            b.y = this._vpY + 15 + Math.floor(i / 10) * 25;
        }, this);
        this.sizeButtons.forEach((b, i) => {
            b.x = this._vpX + this._vpWidth - 35;
            b.y = this._vpY + 30 + i * 30;
        }, this);
        this.miscButtons.forEach((b, i) => {
            b.x = this._vpX + 10;
            b.y = this._vpY + 120 + i * 30;
        }, this);
    }

    clearPowderTable() {
        this.table.map(g => undefined);
    }

}