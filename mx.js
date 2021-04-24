"use strict";
/** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== =====
 * Collection of tools that can be used to create games  with JS and HTML5 canvas
 * @author Lukasz Kaszubowski (matszach)
 * @see https://github.com/matszach
 * @version 0.10.0
 */

/** ===== ===== ===== ===== ===== ===== ===== ===== ===== =====
 * Base classes extended / used within the library
 */

/** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
 * Base entity class, extended by geometry classes and by image draw classes
 */
class _Entity {

    static create(...args) {
        return new this(...args);
    }

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.isMouseOver = false;
        this.isMouseDown = false;
        this.isMouseDrag = false;
        this.hidden = false;
        this.animations = [];
        this.onMouseOver = () => {};
        this.onMouseOut = () => {};
        this.onMouseDown = () => {};
        this.onMouseUp = () => {};
        this.onMouseDrag = () => {};
    }

    hide() {
        this.hidden = true;
        return this;   
    }

    show() {
        this.hidden = false;
        return this;
    }

    place(x, y) {
        this.x = x;
        this.y = y;    
        return this;       
    }

    move(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }

    easeTo(x, y, ratio = 0.1) {
        const dx = x - this.x;
        const dy = y - this.y;
        this.move(dx * ratio, dy * ratio);
        return this;
    }

    movePolar(phi, r) {
        const {x, y} = Mx.Geo.toCartesian(phi, r);
        return this.move(x, y);
    }
    
    scale(scaleX = 1, scaleY = scaleX, xOrigin = this.x, yOrigin = this.y) {
        this.x = scaleX * (this.x - xOrigin) + xOrigin;
        this.y = scaleY * (this.y - yOrigin) + yOrigin;
        return this;
    }

    rotate(phi, xOrigin = this.x, yOrigin = this.y) {
        const r = Mx.Geo.Distance.simple(xOrigin, yOrigin, this.x, this.y);
        const pCrd = Mx.Geo.toPolar(this.x - xOrigin, this.y - yOrigin);
        const cCrd = Mx.Geo.toCartesian(phi + pCrd.phi, r);
        this.place(cCrd.x + xOrigin, cCrd.y + yOrigin);
        return this;
    }

    _canBeDrawn(canvasHandler) {
        // abstract TODO, shoulsd return false when entity out of canvas draw range
        return true;
    }

    _getDrawn(canvasHandler) {
        // abstract
    }

    isPointOver(x, y) {
        // abstract
        return false;
    }

    listen() {
        // setup
        const mouse = Mx.Input.mouse();
        const isNowMouseOver = this.isPointOver(mouse.xInCanvas, mouse.yInCanvas);
        const isNowMouseDown = mouse.left;
        // mouse over
        if(isNowMouseOver) {
            if(!this.isMouseOver) {
                this.onMouseOver(mouse, this);
            }
            this.isMouseOver = true;
        } else {
            if(this.isMouseOver) {
                this.onMouseOut(mouse, this);
                this.isMouseOver = false;
            }
        } 
        // mouse down 
        if(isNowMouseDown) {
            if(!this.isMouseDown) {
                if(isNowMouseOver) {
                    this.onMouseDown(mouse, this);
                    this.isMouseDown = true;
                }
            } else {
                if(mouse.draggedEntity === null) {
                    mouse.draggedEntity = this;
                }
                if(mouse.draggedEntity === this) {
                    this.onMouseDrag(mouse, this);
                }
            }
        } else {
            if(this.isMouseDown) {
                this.onMouseUp(mouse, this);
                this.isMouseDown = false;
                mouse.draggedEntity = null;
            }
        }
        // fin
        return this;
    }

    on(event, callback = () => {}) {
        switch(event) {
            case 'over': this.onMouseOver = callback; break;
            case 'out': this.onMouseOut = callback; break;
            case 'down': this.onMouseDown = callback; break;
            case 'up': this.onMouseUp = callback; break;
            case 'drag': this.onMouseDrag = callback; break;
            default: break;
        }
        return this;
    }

    enableDrag() {
        return this.on('drag', (mouse, e) => e.place(mouse.xInCanvas, mouse.yInCanvas));
    }

    addAnimation(animation) {
        animation.onStart(this);
        this.animations.push(animation);
        return this;
    }

    clearAnimations() {
        this.animations.forEach(a => a.onFinish(this), this);
        this.animations = [];
        return this;
    }

    animate() {
        let finishedAnimationPresent = false;
        this.animations.forEach(a => {
            a.doFrame(this);
            if(a.finished) {
                finishedAnimationPresent = true;
            }
        }, this);
        if(finishedAnimationPresent) {
            this.animations = this.animations.filter(a => {
                if(a.finished) {
                    a.onFinish(this);
                    return false;
                }
                return true;
            });
        }
        return this;
    }

    clone() {
        return Mx.Entity.create(this.x, this.y);
    }

}

/** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
 * Base entity animation class
 */
class _Animation {

    static create(...args) {
        return new this(...args);
    }

    constructor() {
        this.currTick = 0;
        this.maxTick = 0;
        this.finished = false;
        this.repeat = false;
        this.backAndForth = false;    
        this.isNowReturn = false;
    }

    tick() {
        if(this.isNowReturn) {
            this.currTick--;
            if(this.currTick < 0) {
                if(this.repeat) {
                    this.isNowReturn = false;
                } else {
                    this.finished = true;
                }
            }
        } else {
            this.currTick++;
            if(this.currTick > this.maxTick) {
                if(this.repeat) {
                    if(this.backAndForth) {
                        this.isNowReturn = true;
                    } else {
                        this.currTick = 0;
                    }
                } else {
                    this.finished = true;
                }
            }
        }
        
    }

    onStart(entity) {
        // abstract
    }

    doFrame(entity) {
        this.tick();
        // abstract
    }

    onFinish(entity) {
        // abstract
    }

    clone() {
        // abstract
        return new _Animation();      
    }

    stop() {
        this.finished = true;
    }

}


/** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
 * ImageDataManager submodule for CanvasHandler
 */
class _PixImageDataManager {

    constructor(context, canvas, alphaBlend = true) {
        this.context = context;
        this.canvas = canvas;
        this._alphaBlend = alphaBlend;
        this._blendPixelData = () => {};
        this._initAlphaBlend();
    }

    _initAlphaBlend() {
        if(this._alphaBlend) {
            this.enableAlphaBlend();
        } else {
            this.disableAlphaBlend();
        }
    }

    disableAlphaBlend() {
        this._alphaBlend = false;
        this._blendPixelData = (i, r, g, b, a) => {
            this.imageDataArray[i] = r;
            this.imageDataArray[i + 1] = g;
            this.imageDataArray[i + 2] = b;
        };
        return this;
    }
    
    enableAlphaBlend() {
        this._alphaBlend = true;
        this._blendPixelData = (i, r, g, b, a) => {
            const blend = a / 255;
            const oBlend = (1 - blend);
            this.imageDataArray[i] = Math.round(r * blend + this.imageDataArray[i] * oBlend);
            this.imageDataArray[i + 1] = Math.round(g * blend + this.imageDataArray[i + 1] * oBlend);
            this.imageDataArray[i + 2] = Math.round(b * blend + this.imageDataArray[i + 2] * oBlend);
        };
        return this;
    }

    isAlphaBlend() {
        return this._alphaBlend;
    }

    enableRefitOnResize() {
        this.refitOnResize = true;
        this._attachResizeListeners();
        return this;
    }

    // ================================ LIFECYCLE METHODS ===============================
    initImageData(width = this.canvas.width, height = this.canvas.height) {
        this.imageDataWidth = width;
        this.imageDataHeight = height;
        this.imageData = this.context.createImageData(this.imageDataWidth, this.imageDataHeight);
        this.imageDataArray = this.imageData.data;
        for(let i = 3; i < this.imageDataArray.length; i += 4) {
            this.imageDataArray[i] = 255;
        }
    }

    fill(r = 0, g = 0, b = 0, a = 255) {
        for(let i = 0; i < this.imageDataArray.length; i += 4) {
            this._blendPixelData(i, r, g, b, a);
        }
    }

    clear(r = 0, g = 0, b = 0) {
        for(let i = 0; i < this.imageDataArray.length; i += 4) {
            this.imageDataArray[i] = r;
            this.imageDataArray[i + 1] = g;
            this.imageDataArray[i + 2] = b;
        }
    }

    getPixel(x, y) {
        const i = (y * this.imageDataWidth + x) * 4;
        return this.imageDataArray.slice(i - 1, i + 2);
    }

    putPixel(x, y, r = 0, g = 0, b = 0, a = 255) {
        const i = (y * this.imageDataWidth + x) * 4;
        this._blendPixelData(i, r, g, b, a);
    }

    putRectangle(x, y, width, height, r = 0, g = 0, b = 0, a = 255) {
        x = Math.round(x);
        y = Math.round(y);
        for(let xi = x; xi < x + width; xi++) {
            for(let yi = y; yi < y + height; yi++) {
                this.putPixel(xi, yi, r, g, b, a);
            }
        }
    }

    putBox(x, y, width, height, thickness = 1, r = 0, g = 0, b = 0, a = 255) {
        x = Math.round(x);
        y = Math.round(y);
        thickness = Math.round(thickness);
        const hThick = Math.round(thickness/2);
        this.putRectangle(x - hThick, y - hThick, width + thickness, thickness, r, g, b, a);
        this.putRectangle(x - hThick, y + hThick, thickness, height - thickness, r, g, b, a);
        this.putRectangle(x - hThick + width, y + hThick, thickness, height - thickness, r, g, b, a);
        this.putRectangle(x - hThick, y - hThick + height, width + thickness, thickness, r, g, b, a);
    }

    putCircle(x, y, radius, r = 0, g = 0, b = 0, a = 255) {
        x = Math.round(x);
        y = Math.round(y);
        radius = Math.round(radius);
        for(let xi = x - radius; xi < x + radius + 1; xi++) {
            for(let yi = y - radius; yi < y + radius + 1; yi++) {
                if((x - xi)**2 + (y - yi)**2 < radius**2) {
                    this.putPixel(xi, yi, r, g, b, a);
                }
            }
        }
    }
    
    putRing(x, y, radius, thickness = 1, r = 0, g = 0, b = 0, a = 255) {
        x = Math.round(x);
        y = Math.round(y);
        radius = Math.round(radius);
        thickness = Math.round(thickness);
        const radIn = radius - thickness/2;
        const radOut = radius + thickness/2;
        for(let xi = x - radOut; xi < x + radOut + 1; xi++) {
            for(let yi = y - radOut; yi < y + radOut + 1; yi++) {
                const sq = (x - xi)**2 + (y - yi)**2;
                if(sq < radOut**2 && sq > radIn**2) {
                    this.putPixel(xi, yi, r, g, b, a);
                }
            }
        }
    }

    putLine(x1, y1, x2, y2, thickness = 1, r = 0, g = 0, b = 0, a = 255) {
        x1 = Math.round(x1);
        y1 = Math.round(y1);
        x2 = Math.round(x2);
        y2 = Math.round(y2);
        thickness = Math.round(thickness);
        const absX = Math.abs(x1 - x2);
        const absY = Math.abs(y1 - y2);
        if(absX > absY) {
            const yStep = (y2 - y1) / absX;
            let currY = y1;
            if(x1 < x2) {
                for(let x = x1; x < x2; x++) {
                    const minY = Math.floor(currY - thickness/2);
                    const maxY = Math.ceil(currY + thickness/2)
                    for(let y = minY; y < maxY; y++) {
                        this.putPixel(x, y, r, g, b, a);
                    } 
                    currY += yStep;
                }
            } else {
                for(let x = x1; x > x2; x--) {
                    const minY = Math.floor(currY - thickness/2);
                    const maxY = Math.ceil(currY + thickness/2)
                    for(let y = minY; y < maxY; y++) {
                        this.putPixel(x, y, r, g, b, a);
                    } 
                    currY += yStep;
                }
            }
        } else {
            const xStep = (x2 - x1) / absY;
            let currX = x1;
            if(y1 < y2) {
                for(let y = y1; y < y2; y++) {
                    const minX = Math.floor(currX - thickness/2);
                    const maxX = Math.ceil(currX + thickness/2)
                    for(let x = minX; x < maxX; x++) {
                        this.putPixel(x, y, r, g, b, a);
                    } 
                    currX += xStep;
                }
            } else {
                for(let y = y1; y > y2; y--) {
                    const minX = Math.floor(currX - thickness/2);
                    const maxX = Math.ceil(currX + thickness/2)
                    for(let x = minX; x < maxX; x++) {
                        this.putPixel(x, y, r, g, b, a);
                    } 
                    currX += xStep;
                }
            } 
        }
    }

    putPolyline(points, thickness = 1, r = 0, g = 0, b = 0, a = 255) {
        for(let i = 0; i < points.length; i += 2) {
            this.putLine(points[i], points[i + 1], points[i + 2], points[i + 3], thickness, r, g, b, a);
        }
    }

    displayImageData(x = 0, y = 0) {
        this.context.putImageData(this.imageData, x, y);
    }


}

/** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
 * Library body proper
 */
const Mx = {

    /**
     * Initializes a simplified app
     * @param {*} update 
     */
    simpleInit(update) {
        const handler = Mx.Draw.CanvasHandler.create();
        const input = Mx.Input.init(handler);
        const rng = Mx.Rng.init();
        Mx.It.Loop.start(60, loop => update(handler, rng, input, loop));
    },

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Assigned here for public access
     */
    Entity: _Entity,

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Entity that can contain other entities
     */
    Container: class extends _Entity {

        constructor(x = 0, y = 0) {
            super(x, y);
            this.children = [];
        }

        add(entity) {
            this.children.push(entity);
        }

        adds(...entities) {
            for(let e of entities) {
                this.add(e);
            }
            return this;
        }

        forChild(callback) {
            this.children.forEach(callback);
        }

        place(x, y) {
            const dx = x - this.x;
            const dy = y - this.y;
            this.x = x;
            this.y = y;
            this.forChild(c => c.move(dx, dy));
        }
    
        move(x, y) {
            super.move(x, y);
            this.forChild(c => c.move(x, y));
            return this;
        }
        
        scale(scaleX = 1, scaleY = scaleX, xOrigin = this.x, yOrigin = this.y) {
            super.scale(scaleX, scaleY, xOrigin, yOrigin);
            this.forChild(c => c.scale(scaleX, scaleY, xOrigin, yOrigin));
            return this;
        }
    
        rotate(phi, xOrigin = this.x, yOrigin = this.y) {
            super.rotate(phi, xOrigin, yOrigin);
            this.forChild(c => c.rotate(phi, this.x, this.y));
            return this;
        }
    
        _getDrawn(canvasHandler) {
            this.forChild(c => c._getDrawn(canvasHandler))
        }

        listen() {
            this.forChild(c => c.listen());
            return this;
        }

        clone() {
            const cont = Mx.Container.create(this.x, this.y);
            this.forChild(c => cont.add(c.clone()));
            return cont;
        }
    
    },

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Text entity
     */
    Text: class extends _Entity {

        constructor(x, y, content = 'Text', color = 'black', fontSize = '12', fontFamily = 'Arial monospaced', rotation = 0, alpha = 1) {
            super(x, y);
            this.content = content;
            this.color = color;
            this.fontSize = fontSize;
            this.fontFamily = fontFamily;
            this.rotation = rotation;
            this.alpha = alpha;
            this.characterWidthRatio = 0.44;
            this.characterHeightRatio = 0.85;
        }

        _getDrawn(canvasHandler) {
            canvasHandler.write(
                this.x, this.y, this.content, this.color, 
                this.fontSize, this.fontFamily, this.rotation, this.alpha
            );
        }

        // FIXME not perfect but somewhat works for now
        getBoundingRectangle(backgroundColor = undefined, borderColor = 'red', borderThickness = 1) {
            const rotationOffset = Math.sin(this.rotation) * this.fontSize * 0.5;
            const x1 = this.x;
            const y1 = this.y - this.fontSize * this.characterHeightRatio + rotationOffset;
            const r = this.fontSize * this.characterWidthRatio * this.content.length;
            const {x: dx, y: dy} = Mx.Geo.toCartesian(this.rotation, r);
            const x2 = x1 + dx + rotationOffset;
            const y2 = y1 + dy + this.fontSize - rotationOffset;
            const x = x1 < x2 ? x1 : x2;
            const y = y1 < y2 ? y1 : y2;
            const width = Math.abs(x1 - x2);
            const height = Math.abs(y1 - y2);
            return new Mx.Geo.Rectangle(x, y, width, height, backgroundColor, borderColor, borderThickness);
        }

        isPointOver(x, y) {
            return this.getBoundingRectangle().isPointOver(x, y);
        }

        clone() {
            return Mx.Text.create(
                this.x, this.y,
                this.content, this.color, this.fontSize, this.fontFamily,
                this.rotation, this.alpha
            );
        }

    },

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Sprite sheet (~Sprite entity factory) / Spirte 
     */
    SpriteSheet: class {

        static create(src, spriteSizeX, spriteSizeY, borderThickness) {
            return new Mx.SpriteSheet(src, spriteSizeX, spriteSizeY, borderThickness);
        }

        constructor(src, spriteSizeX = 32, spriteSizeY = 32, borderThickness = 0) {
            this.img = new Image();
            this.img.src = src;
            this.spriteWidth = spriteSizeX;
            this.spriteHeight = spriteSizeY;
            this.borderThickness = borderThickness;
        }

        get(x, y) {
            return new Mx.Sprite(
                0, 0, this.img,
                this.spriteWidth, this.spriteHeight, this.borderThickness,
                x, y
            );
        }
    },

    Sprite: class extends _Entity {

        constructor(
            x, y, image, spriteWidth = 32, spriteHeight = 32, borderThickness = 0, 
            frameX = 0, frameY = 0, drawnWidth = spriteWidth, drawnHeight = spriteHeight,
            rotation = 0, alpha = 1
        ) {
            super(x, y);
            this.image = image;
            this.spriteWidth = spriteWidth;
            this.spriteHeight = spriteHeight;
            this.borderThickness = borderThickness;
            this.frameX = frameX;
            this.frameY = frameY;
            this.drawnWidth = drawnWidth;
            this.drawnHeight = drawnHeight;
            this.rotation = rotation;
            this.alpha = alpha;
        }

        scale(scaleX = 1, scaleY = scaleX, xOrigin = this.x, yOrigin = this.y) {
            super.scale(scaleX, scaleY, xOrigin, yOrigin);
            this.drawnWidth *= scaleX;
            this.drawnHeight *= scaleY;
            return this;
        }

        setDrawnSize(width, height = width) {
            this.drawnWidth = width;
            this.drawnHeight = height;
            return this;
        }

        setFrame(x, y) {
            this.frameX = x;
            this.frameY = y;
            return this;
        }

        setAlpha(alpha) {
            this.alpha = alpha;
            return this;
        }

        setRotation(rotation) {
            this.rotation = rotation;
            return this;
        }

        rotate(phi, xOrigin = this.x, yOrigin = this.y) {
            super.rotate(phi, xOrigin, yOrigin);
            this.rotation += phi;
            return this;
        }

        _getDrawn(canvasHandler) {
            canvasHandler.drawSprite(
                this.x, this.y, this.image, 
                this.frameX * (this.spriteWidth + this.borderThickness),
                this.frameY * (this.spriteHeight + this.borderThickness),
                this.spriteWidth, this.spriteHeight, this.drawnWidth, this.drawnHeight,
                this.rotation, this.alpha
            );
        }

        isPointOver(x, y) {
            // TODO probably move this elipsis equation to Math or Geo
            const a = this.drawnWidth/2;
            const b = this.drawnHeight/2;
            const dx = this.x - x;
            const dy = this.y - y;
            return dx**2 / a**2 + dy**2 / b**2 < 1;
        }

        clone() {
            return Mx.Sprite.create(
                this.x, this.y, 
                this.image, this.spriteWidth, this.spriteHeight, this.borderThickness, 
                this.frameX, this.frameY, this.drawnWidth, this.drawnHeight,
                this.rotation, this.alpha
            );
        }

    },

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Animations
     */
    Animation: _Animation,

    TranslateAnimation: class extends _Animation {

        constructor(x, y, duration = 100, repeat = false, backAndForth = false) {
            super();
            this.x = x;
            this.y = y;
            this.sx = x/duration;
            this.sy = y/duration;
            this.maxTick = duration;
            this.repeat = repeat;
            this.backAndForth = backAndForth;
        }

        doFrame(entity) {
            super.doFrame(entity);
            if(this.isNowReturn) {
                entity.move(-this.sx, -this.sy);
            } else {
                entity.move(this.sx, this.sy);
            }
            return this;
        }

        clone() {
            return Mx.TranslateAnimation.create(this.x, this.y, this.maxTick, this.repeat, this.backAndForth);
        }

    },

    SpriteAnimation: class extends _Animation {

        constructor(framesInfo, repeat, backAndForth) {
            super();
            this.framesInfo = framesInfo;
            this.maxTick = framesInfo.reduce((acc, curr) => acc + curr[2], 0);
            this.repeat = repeat;
            this.backAndForth = backAndForth;
        } 

        doFrame(entity) {
            super.doFrame(entity);
            let ticks = this.currTick;
            for(let fi of this.framesInfo) {
                ticks -= fi[2];
                console.log(fi, ticks);
                if(ticks < 0) {
                    entity.frameX = fi[0];
                    entity.frameY = fi[1];
                    break;
                }
            }
            return this;
        }

        clone() {
            return Mx.SpriteAnimation.create(this.framesInfo, this.repeat, this.backAndForth);
        }
    },

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Random number generator
     */
    Rng: class {
        
        static _MIN_CHAR_CODE = 33;
        static _MAX_CHAR_CODE = 127;

        static _transformSeed(seed) {
            const stringified = JSON.stringify(seed);
            const split = stringified.split('');
            const reduced = split.reduce((acc, curr, index) => acc + (curr.charCodeAt(0) - Mx.Rng._MIN_CHAR_CODE) * (index + 1), 0);
            const absolute = Math.abs(reduced);
            return absolute;
        }

        _generateRandomSeed() {
            let seed = '';
            for(let i = 0; i < 20; i++) {
                const charCode = Math.floor(Math.random() * (Mx.Rng._MAX_CHAR_CODE - Mx.Rng._MIN_CHAR_CODE) + Mx.Rng._MIN_CHAR_CODE);
                seed += String.fromCharCode(charCode)
            }
            return seed;
        }

        _initRandomGeneratorIndices() {
            this._indices = [];
            for(let i = 0; i < this.precision; i++) {
                this._indices.push((this._transformedSeed * i) % this._numbers.length);
            }
        }

        _random() {
            let counter = '';
            for(let i = 0; i < this.precision; i++) {
                const nextIndexValue = i < this.precision - 1 ? this._indices[i + 1] : this._indices[0];
                const newIndexValue = (this._indices[i] + nextIndexValue + i) % this._numbers.length;
                this._indices[i] = newIndexValue;
                counter += this._numbers[newIndexValue];
            }
            return parseInt(counter)/this._denominator;
        }

        /**
         * Constructs a new instance of the random number generator
         * @param {any} seed - seed for random number generator
         * @param {any} args - TODO
         */
        constructor(seed, args = {}) {
            this.seed = seed || this._generateRandomSeed();
            this.precision = args.precision || 10;
            this._denominator = Math.pow(10, this.precision);
            this._transformedSeed = Mx.Rng._transformSeed(this.seed);
            this._numbers = '0192837465'.split('');
            this._initRandomGeneratorIndices();
        }
        
        static init(seed, args = {}) {
            return new Mx.Rng(seed, args);
        }

        /**
         * Creates an Rng instance that uses the Math's random() as a value generator
         * @returns {Mx.Rng} a new Rng instance
         */
        static fromMathRandom() {
            const rng = new Mx.Rng();
            rng._random = Math.random;
            return rng;
        }

        /**
         * Generates a random float between 0 (incl.) and 1 (excl.)
         * @returns {number} a float between 0 and 1
         */
        fract() {
            return this._random();
        }

        /**
         * Generates a random float between min (incl.) and max (excl.)
         * @param {number} min - min value
         * @param {number} max - max value
         * @returns a float between min and max
         */
        float(min, max) {
            return this._random() * (max - min) + min;
        }

        /**
         * Generates a random int between min (incl.) and max (excl.)
         * @param {number} min - min value
         * @param {number} max - max value
         * @returns an int between min and max
         */
        int(min, max) {
            return Math.floor(this.float(min, max));
        }

        /**
         * Returns a random entry from a given array
         * @param {Array<K>} options - possible values to choose from
         * @returns {K} - the seleted entry
         */
        choice(options) {
            return options[this.int(0, options.length)];
        }

        /**
         * TODO
         * @param {*} chance 
         * @returns 
         */
        chance(chance) {
            return this._random() < chance;
        }

        /**
         * TODO
         * @returns 
         */
        bool() {
            return this._random() > 0.5;
        }

        /**
         * Returns a random entry from a given array while using the weights array 
         * @param {Array<K>} options - possible values to choose from
         * @param {Array<number>} weights - array of weights for each of the options
         * @returns {K} - the seleted entry
         */
        weightedPick(options, weights = []) {
            if(options.length !== weights.length) {
                throw new Error('Options and weights arrays lengths\' missmatch!')
            }
            const totalWeight = weights.reduce((acc, curr) => acc + curr, 0);
            let pick = this.float(0, totalWeight);
            for(let i = 0; i < weights.length; i++) {
                pick -= weights[i];
                if(pick < 0) {
                    return options[i];
                }
            }
        }

        /**
         * Returns a shuffled copy of an array
         * @param {Array<any>} array - array to be shuffled
         * @returns {Array<any>} shuffled array 
         */
        shuffe(array) {
            const shuffled = new Array(array.length);
            for(let i = 0; i < shuffled.length; i++) {
                shuffled[i] = array[i];
            }
            for(let i = 0; i < shuffled.length; i++) {
                const indexToSwapWith = this.int(0, shuffled.length);
                const temp = shuffled[indexToSwapWith];
                shuffled[indexToSwapWith] = shuffled[i];
                shuffled[i] = temp;
            }
            return shuffled;
        }

        rgb() {
            return Mx.Draw.Color.rgb(
                this.int(0, 255),
                this.int(0, 255),
                this.int(0, 255),
            );
        }

        rgba() {
            return Mx.Draw.Color.rgba(
                this.int(0, 255),
                this.int(0, 255),
                this.int(0, 255),
                this.fract()
            );
        }

        dice(dieSize = 6, diceNumber = 1) {
            if(diceNumber === 1) {
                return this.int(1, dieSize + 1);
            } 
            return Mx.Ds.range(0, diceNumber).map(i => this.int(1, dieSize + 1));
        }

    },

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Math util
     */
    Math: {

        clamp(value, min, max) {
            if(value < min) {
                return min;
            } else if (value > max) {
                return max;
            } else {
                return value;
            }
        },

        between(value, min, max) {
            return value >= min && value <= max;
        },

    },

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Data Structures and Tools
     */
    Ds: {

        /**
         * TODO
         * @param {number} min 
         * @param {number} max 
         * @param {number} step 
         * @returns {Array<number>}
         */
        range(min, max, step = 1) {
            const arr = [];
            for(let i = min; i < max; i += step) {
                arr.push(i);
            }
            return arr;
        },

        /**
         * Ring array iterator
         */
         Ring: class {

            constructor(baseArray = [], initialIndex = 0) {
                this.values = baseArray;
                this.i = initialIndex;
            }
    
            add(item) {
                this.values.push(item);
                return this;
            }
    
            replace(item) {
                this.values[this.i] = item;
                return this;
            }
            
            reset() {
                this.i = 0;
                return this;
            }
    
            get() {
                return this.values[this.i];
            }
    
            next(step = 1) {
                this.i += step;
                this.i = this.i < this.values.length ? this.i : (this.i - this.values.length);
                return this.get();
            }
    
            prev(step = 1) {
                this.i -= step;
                this.i = this.i >= 0 ? this.i : (this.values.length + this.i);
                return this.get();
            }
        
        },

        /**
         * Back and forth array iterator
         */
        BackAndForth: class {

            constructor(baseArray = [], initialIndex = 0, initialForward = true) {
                this.values = baseArray;
                this.i = initialIndex;
                this.directionForward = initialForward;
            }

            add(item) {
                this.values.push(item);
                return this;
            }

            replace(item) {
                this.values[this.i] = item;
                return this;
            }
            
            reset() {
                this.i = 0;
                this.directionForward = true;
                return this;
            }
            
            reverse() {
                this.directionForward = !this.directionForward;
                return this;
            }

            get() {
                return this.values[this.i];
            }

            next(step = 1) {
                if(this.directionForward) {
                    this.i += step;
                    if(this.i >= this.values.length) {
                        this.i = 2 * this.values.length - this.i - 1;
                        this.directionForward = false;
                    }
                } else {
                    this.i -= step;
                    if(this.i < 0) {
                        this.i *= -1;
                        this.directionForward = true;
                    }
                }
                return this.get();
            }

            prev(step = 1) {
                return this.next(-step);
            }

        },

        /**
         * 2D simulating array wrapper
         */
        Array2D: class {

            constructor(xSize, ySize) {
                this.xSize = xSize;
                this.ySize = ySize;
                this.values = new Array(xSize * ySize);
            }

            put(x, y, v) {
                this.values[y * this.xSize + x] = v; 
                return this;
            }

            get(x, y) {
                return this.values[y * this.xSize + x]
            }

            safeGet(x, y, defaultValue = null) {
                if(this.inRange(x, y)) {
                    return this.get(x, y);
                }
                return defaultValue;
            }

            forEach(callback = (v, x, y) => {}) {
                for(let x = 0; x < this.xSize; x++) {
                    for(let y = 0; y < this.ySize; y++) {
                        callback(this.get(x, y), x, y);
                    }
                }
                return this;
            }

            map(mapper = (v, x, y) => v) {
                for(let x = 0; x < this.xSize; x++) {
                    for(let y = 0; y < this.ySize; y++) {
                        this.put(x, y, mapper(this.get(x, y), x, y));
                    }
                }
                return this;
            }

            inRange(x, y) {
                return (
                    x >= 0 && x < this.xSize &&
                    y >= 0 && y < this.ySize 
                );
            }
        }

    },

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Iteration tools
     */
    It: {

        /**
         * TODO
         * @param {number} times 
         * @param {Function} callback 
         */
        times(times, callback) {
            for(let i = 0; i < times; i++) {
                callback(i, times);
            }
        },


        /**
         * Interval wrapper
         */
        Loop: class {

            static start(tps, callback) {
                return new Mx.It.Loop(tps, callback).start();
            }

            constructor(tps, callback) {
                this.tps = tps;
                this.tickCount = 0;
                this._interval; 
                this._callback = callback;
            }

            start() {
                this._interval = setInterval(loop => {
                    loop.tickCount++;
                    loop._callback(loop);
                }, 1000/this.tps, this);
                return this;
            }

            stop() {
                clearInterval(this._interval);
                this._interval = null;
                return this;
            }

        }

    },

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Geometry entities and tools
     */
    Geo: {

        toPolar(x, y) {
            let phi; 
            if(x === 0) {
                phi = y > 0 ? Math.PI/2 : Math.PI/2 * 3
            } else {
                phi = Math.atan(y/x);
                if (x < 0) {
                    phi += Math.PI;
                }
            }
            return {
                r: Mx.Geo.Distance.simple(0, 0, x, y),
                phi: phi
            };
        },

        toCartesian(phi, r) {
            return {
                x: r * Math.cos(phi),
                y: r * Math.sin(phi)
            };
        },

        Distance: {

            simple(x1, y1, x2, y2) {
                return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
            },

            vertexVsVertex(v1, v2) {
                return this.simple(v1.x, v1.y, v2.x, v2.y);
            },

            vertexVsCircle(v, c) {
                return this.simple(v.x, v.y, c.x, c.y) - c.radius;
            },

            circleVsCircle(c1, c2) {
                return this.simple(c1.x, c1.y, c2.x, c2.y) - c1.radius - c2.radius;
            }

        },

        Collision: {

        },

        Vertex: class extends _Entity {

            toCircle(radius, backgroundColor, borderColor, borderThickness) {
                return new Mx.Geo.Circle(this.x, this.y, radius, backgroundColor, borderColor, borderThickness);
            }

            clone() {
                return Mx.Geo.Vertex.create(this.x, this.y);
            }

        },

        Line: class extends _Entity {

            constructor(x1, y1, x2, y2, color, thickness) {
                super(-1, -1);
                this.x1 = x1;
                this.y1 = y1;
                this.x2 = x2;
                this.y2 = y2;
                this.color = color;
                this.thickness = thickness;
            }

            place(x, y) {
                const dx = x - this.x1;
                const dy = y - this.y1;
                this.x1 = x;
                this.y1 = y;
                this.x2 += dx;
                this.y2 += dy;
                return this;       
            }
        
            move(x, y) {
                this.x1 += x;
                this.y1 += y;
                this.x2 += x;
                this.y2 += y;
                return this;
            }

            easeTo(x, y, ratio = 0.1) {
                const c = this.getCenter();
                const dx = x - c.x;
                const dy = y - c.y;
                this.move(dx * ratio, dy * ratio);
                return this;
            }
        
            
            scale(scaleX = 1, scaleY = scaleX, xOrigin = this.x1, yOrigin = this.y1) {
                this.x1 = scaleX * (this.x1 - xOrigin) + xOrigin;
                this.y1 = scaleY * (this.y1 - yOrigin) + yOrigin;
                this.x2 = scaleX * (this.x2 - xOrigin) + xOrigin;
                this.y2 = scaleY * (this.y2 - yOrigin) + yOrigin;
                return this;
            }
        
            rotate(phi, xOrigin, yOrigin) {
                if(xOrigin === undefined || yOrigin === undefined) {
                    const {x, y} = this.getCenter();
                    xOrigin = x;
                    yOrigin = y;
                }
                const r1 = Mx.Geo.Distance.simple(xOrigin, yOrigin, this.x1, this.y1);
                const pCrd1 = Mx.Geo.toPolar(this.x1 - xOrigin, this.y1 - yOrigin);
                const cCrd1 = Mx.Geo.toCartesian(phi + pCrd1.phi, r1);
                this.x1 = cCrd1.x + xOrigin;
                this.y1 = cCrd1.y + yOrigin;
                const r2 = Mx.Geo.Distance.simple(xOrigin, yOrigin, this.x2, this.y2);
                const pCrd2 = Mx.Geo.toPolar(this.x2 - xOrigin, this.y2 - yOrigin);
                const cCrd2 = Mx.Geo.toCartesian(phi + pCrd2.phi, r2);
                this.x2 = cCrd2.x + xOrigin;
                this.y2 = cCrd2.y + yOrigin;
                return this;
            }
        
            _getDrawn(canvasHandler) {
                canvasHandler.drawLine(this.x1, this.y1, this.x2, this.y2, this.color, this.thickness);
            }

            getCenter() {
                return Mx.Geo.Vertex.create(
                    (this.x1 + this.x2)/2,
                    (this.y1 + this.y2)/2
                );
            }

            clone() {
                return Mx.Geo.Line.create(
                    this.x1, this.y1, this.x2, this.y2, 
                    this.color, this.thickness
                );
            }

        },

        Polyline: class extends _Entity {

            constructor(verticesInfo, color, thickness) {
                super(...verticesInfo[0]);
                this.verticesInfo = verticesInfo;
                this.color = color;
                this.thickness = thickness;
            }

            place(x, y) {
                const {x: ix, y: iy} = this.getCenter();
                const dx = x - ix;
                const dy = y - iy;
                this.verticesInfo[0] = [x, y];
                for(let i = 1; i < this.verticesInfo.length; i++) {
                    const [cx, cy] = this.verticesInfo[i];
                    this.verticesInfo[i] = [cx + dx, cy + dy]; 
                }
                return this;
            }

            move(x, y) {
                for(let v of this.verticesInfo) {
                    v[0] += x;
                    v[1] += y;
                }
                return this;
            }

            easeTo(x, y, ratio = 0.1) {
                const {x: cx, y: cy} = this.getCenter();
                const dx = x - cx;
                const dy = y - cy;
                this.move(dx * ratio, dy * ratio);
                return this;
            }

            rotate(phi, xOrigin, yOrigin) {
                if(xOrigin === undefined && yOrigin === undefined) {
                    const c = this.getCenter();
                    xOrigin = c.x;
                    yOrigin = c.y;
                }
                for(let v of this.verticesInfo) {
                    const r = Mx.Geo.Distance.simple(...v, xOrigin, yOrigin);
                    const pCrd = Mx.Geo.toPolar(v[0] - xOrigin, v[1] - yOrigin);
                    const cCrd = Mx.Geo.toCartesian(phi + pCrd.phi, r);
                    v[0] = cCrd.x + xOrigin;
                    v[1] = cCrd.y + yOrigin;
                }
                return this;
            }

            _getDrawn(canvasHandler) {
                canvasHandler.drawPolyline(this.verticesInfo, this.color, this.thickness);
            }

            getCenter() {
                let x = 0;
                let y = 0;
                for(let v of this.verticesInfo) {
                    x += v[0];
                    y += v[1];
                }
                x /= this.verticesInfo.length;
                y /= this.verticesInfo.length;
                return Mx.Geo.Vertex.create(x, y);
            }

            add(x, y) {
                this.verticesInfo.push([x, y]);
                return this;
            }

            pop() {
                const [x, y] = this.verticesInfo.pop();
                return new Mx.Geo.Vertex(x, y);
            }

            toLines(color = this.color, thickness = this.thickness) {
                const lines = [];
                for(let i = 0; i < this.verticesInfo.length - 1; i++) {
                    const [x1, y1] = this.verticesInfo[i];
                    const [x2, y2] = this.verticesInfo[i + 1];
                    const line = new Mx.Geo.Line(x1, y1, x2, y2, color, thickness);
                    lines.push(line);
                }
                return lines;
            }

            toVertices() {
                return this.verticesInfo.map(v => {
                    const [x, y] = v;
                    return new Mx.Geo.Vertex(x, y);
                });
            }

            clone() {
                return Mx.Geo.Polyline.create(
                    [...this.verticesInfo.map(v => [...v])],
                    this.color, this.thickness
                );
            }
        },

        Polygon: class extends _Entity {

            constructor(verticesInfo, backgroundColor, borderColor, borderThickness) {
                super(...verticesInfo[0]);
                this.body = Mx.Geo.Polyline.create(verticesInfo);
                this.backgroundColor = backgroundColor;
                this.borderColor = borderColor;
                this.borderThickness = borderThickness;
            }

            place(x, y) {
                this.body.place(x, y);
                return this;
            }

            move(x, y) {
                this.body.move(x, y);
                return this;
            }

            easeTo(x, y, ratio = 0.1) {
                this.body.easeTo(x, y, ratio);
                return this;
            }

            rotate(phi, xOrigin, yOrigin) {
                this.body.rotate(phi, xOrigin, yOrigin);
                return this;
            }

            _getDrawn(canvasHandler) {
                canvasHandler.drawPolygon(this.body.verticesInfo, this.backgroundColor, this.borderColor, this.thickness);
            }

            getCenter() {
                return this.body.getCenter();
            }

            toPolyline(color = this.borderColor, thickness = this.borderThickness) {
                const verticesInfo = [
                    ...this.body.verticesInfo.map(vi => [...vi]), 
                    [...this.body.verticesInfo[0]]
                ];
                return Mx.Geo.Polyline.create(verticesInfo, color, thickness);
            }

            add(x, y) {
                this.body.add(x, y);
                return this;
            }

            pop() {
                return this.body.pop();
            }

            toLines(color = this.color, thickness = this.thickness) {
                return this.body.toLines(color, thickness);
            }

            toVertices() {
                return this.body.toVertices();
            }

            clone() {
                return Mx.Geo.Polygon.create(
                    [...this.body.verticesInfo.map(v => [...v])],
                    this.backgroundColor, this.borderColor, this.borderThickness
                );
            }

        },

        Rectangle: class extends _Entity {

            constructor(x, y, width, height, backgroundColor, borderColor, borderThickness) {
                super(x, y);
                this.width = width;
                this.height = height;
                this.backgroundColor = backgroundColor;
                this.borderColor = borderColor;
                this.borderThickness = borderThickness;
            }

            scale(scaleX = 1, scaleY = scaleX, xOrigin = this.x, yOrigin = this.y) {
                super.scale(scaleX, scaleY, xOrigin, yOrigin);
                this.width *= scaleX;
                this.height *= scaleY;
                return this;
            }

            _getDrawn(canvasHandler) {
                canvasHandler.drawRect(this.x, this.y, this.width, this.height, this.backgroundColor, this.borderColor, this.borderThickness);
            }

            isPointOver(x, y) {
                return (
                    Mx.Math.between(x, this.x, this.x + this.width) &&
                    Mx.Math.between(y, this.y, this.y + this.height)
                );
            }

            getCenter() {
                return Mx.Geo.Vertex.create(
                    this.x + this.width/2,
                    this.y + this.height/2
                );
            }

            clone() {
                return Mx.Geo.Rectangle.create(
                    this.x, this.y, this.width, this.height, 
                    this.backgroundColor, this.borderColor, this.borderThickness
                );
            }

        },

        Circle: class extends _Entity {

            constructor(x, y, radius, backgroundColor, borderColor, borderThickness) {
                super(x, y);
                this.radius = radius;
                this.backgroundColor = backgroundColor;
                this.borderColor = borderColor;
                this.borderThickness = borderThickness;
            }

            scale(scaleX, scaleY, xOrigin = this.x, yOrigin = this.y) {
                super.scale(scaleX, scaleY, xOrigin, yOrigin);
                this.radius *= scaleX;
                return this;
            }

            _getDrawn(canvasHandler) {
                canvasHandler.drawCircle(this.x, this.y, this.radius, this.backgroundColor, this.borderColor, this.borderThickness);
            }

            isPointOver(x, y) {
                return Mx.Geo.Distance.simple(this.x, this.y, x, y) < this.radius;
            }

            getCenter() {
                return Mx.Geo.Vertex.create(this.x, this.y);
            }

            clone() {
                return Mx.Geo.Circle.create(
                    this.x, this.y, this.radius, 
                    this.backgroundColor, this.borderColor, this.borderThickness
                );
            }

        },

    },

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Drawing and canvas handling classes and tools
     */
    Draw: {

        Color: {

            rgb(r, g, b) {
                return `rgb(${r}, ${g}, ${b})`;
            },

            rgba(r, g, b, a = 1) {
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            },

        },

        CanvasHandler: class {

            static init(parentId) {
                const handler = new Mx.Draw.CanvasHandler(parentId);
                handler.init();
                handler.refit();
                handler.pix = new _PixImageDataManager(handler.context, handler.canvas, true);
                return handler;
            }

            static create() {
                const home = document.createElement('div');
                home.id = 'canvas-home';
                home.style.width = '100vw';
                home.style.height = '100vh';
                document.body.innerHTML = '';
                document.body.appendChild(home);
                document.body.style.margin = 0;
                return Mx.Draw.CanvasHandler.init('canvas-home');
            }

            constructor(parentId) {
                this.canvas = null;
                this.context = null;
                this.parentId = parentId;
                this.parent = null;
                this.vpX = 0;
                this.vpY = 0;
                this.vpScale = 1;
                this._xDragHook = 0;
                this._yDragHook = 0;
                this.isMouseOver = false;
                this.isMouseDown = false;
                this.isMouseDrag = false;
                this.onMouseOver = () => {};
                this.onMouseOut = () => {};
                this.onMouseDown = () => {};
                this.onMouseUp = () => {};
                this.onMouseDrag = () => {};
                this.onResize = () => {};
            }

            on(event, callback = () => {}) {
                switch(event) {
                    case 'over': this.onMouseOver = callback; break;
                    case 'out': this.onMouseOut = callback; break;
                    case 'down': this.onMouseDown = callback; break;
                    case 'up': this.onMouseUp = callback; break;
                    case 'drag': this.onMouseDrag = callback; break;
                    case 'resize': this.onResize = callback; break;
                    default: break;
                }
                return this;
            }

            enableDrag() {
                return this.on('down', (mouse, handler) => {
                    handler._xDragHook = mouse.xInCanvas;
                    handler._yDragHook = mouse.yInCanvas;
                }).on('drag', (mouse, handler) => {
                    // TODO but works for now
                    if(Math.abs(mouse.moveX) > 1 || Math.abs(mouse.moveY) > 1) {
                        handler.moveViewport(mouse.moveX * 2, mouse.moveY * 2);
                    }
                });
            }

            enableZoom() {
                document.onscroll = event => {
                    console.log(event);
                };
                return this;
            }

            isPointOver(x, y) {
                return true; // TODO but works for now
            }
        
            listen() {
                // setup
                const mouse = Mx.Input.mouse();
                const isNowMouseOver = this.isPointOver(mouse.xInCanvas, mouse.yInCanvas);
                const isNowMouseDown = mouse.left;
                // mouse over
                if(isNowMouseOver) {
                    if(!this.isMouseOver) {
                        this.onMouseOver(mouse, this);
                    }
                    this.isMouseOver = true;
                } else {
                    if(this.isMouseOver) {
                        this.onMouseOut(mouse, this);
                        this.isMouseOver = false;
                    }
                } 
                // mouse down 
                if(isNowMouseDown) {
                    if(!this.isMouseDown) {
                        if(isNowMouseOver) {
                            this.onMouseDown(mouse, this);
                            this.isMouseDown = true;
                        }
                    } else {
                        if(mouse.draggedEntity === null) {
                            mouse.draggedEntity = this;
                        }
                        if(mouse.draggedEntity === this) {
                            this.onMouseDrag(mouse, this);
                        }
                    }
                } else {
                    if(this.isMouseDown) {
                        this.onMouseUp(mouse, this);
                        this.isMouseDown = false;
                        mouse.draggedEntity = null;
                    }
                }
                // fin
                return this;
            }

            moveViewport(x, y) {
                this.vpX += x;
                this.vpY += y;
                this.context.translate(x, y);
                return this;
            }

            scaleViewport(scale) {
                this.vpScale *= scale;
                this.context.scale(scale, scale);
                return this;
            }

            _fillStyle(color = 'black') {
                this.context.fillStyle = color;
                return this;
            }

            _strokeStyle(color = 'black', lineWidth = 1) {
                this.context.strokeStyle = color;
                this.context.lineWidth = lineWidth;
                return this;
            }

            init() {
                this.canvas = document.createElement('canvas');
                this.canvas.classList.add(`${this.parentId}-canvas`);
                this.context = this.canvas.getContext('2d');
                this.parent = document.getElementById(this.parentId);
                this.parent.appendChild(this.canvas);
                window.addEventListener('resize', event => this.refit().onResize(this), this);
                return this;
            }

            refit() {
                this.canvas.width = this.parent.clientWidth;
                this.canvas.height = this.parent.clientHeight;
                return this;
            }
    
            fill(color = 'black') {
                this._fillStyle(color);
                this.context.fillRect(
                    -this.vpX, 
                    -this.vpY, 
                    this.canvas.width, 
                    this.canvas.height
                );
                return this;
            }

            grid(xSpacing = 16, ySpacing = xSpacing, color = 'gray', thickness = 0.5) {
                const xStart = -Math.ceil(this.vpX / xSpacing) * xSpacing;
                const xEnd = xStart + this.canvas.width + xSpacing;
                const yStart = -Math.ceil(this.vpY / ySpacing) * ySpacing;
                const yEnd = yStart + this.canvas.height + ySpacing;
                for(let x = xStart; x < xEnd; x += xSpacing) {
                    this.drawLine(x, yStart, x, yEnd, color, thickness);
                }
                for(let y = yStart; y < yEnd; y += ySpacing) {
                    this.drawLine(xStart, y, xEnd, y, color, thickness);
                }
                return this;
            }

            // Mx.Entity
            draw(entity) {
                if(!entity.hidden && entity._canBeDrawn(this)) {
                    entity._getDrawn(this);
                }
                return this
            }

            draws(...entities) {
                for(let e of entities) {
                    this.draw(e);
                }
                return this;
            }

            // Rectangle
            fillRect(x, y, width, height, color = 'black') {
                this._fillStyle(color);
                this.context.fillRect(x, y, width, height);
                return this;
            } 
    
            strokeRect(x, y, width, height, color = 'black', thickness = 1) {
                this._strokeStyle(color, thickness);
                this.context.strokeRect(x, y, width, height);
                return this;
            }
    
            drawRect(x, y, width, height, fillColor, strokeColor, thickness) {
                if(fillColor) {
                    this.fillRect(x, y, width, height, fillColor);
                }
                if(strokeColor) {
                    this.strokeRect(x, y, width, height, strokeColor, thickness);
                }
                return this;
            }

            // Circle
            fillCircle(x, y, radius, color = 'black') {
                this._fillStyle(color);
                this.context.beginPath();
                this.context.arc(x, y, radius, 0, Math.PI * 2);
                this.context.fill();
                return this;
            }

            strokeCircle(x, y, radius, color = 'black', thickness = 1) {
                this._strokeStyle(color, thickness);
                this.context.beginPath();
                this.context.arc(x, y, radius, 0, Math.PI * 2);
                this.context.stroke();
                return this;
            }

            drawCircle(x, y, radius, fillColor = 'black', strokeColor = undefined, thickness = 1) {
                this._fillStyle(fillColor);
                this._strokeStyle(strokeColor, thickness);
                this.context.beginPath();
                this.context.arc(x, y, radius, 0, Math.PI * 2);
                if(fillColor) {
                    this.context.fill();
                }
                if(strokeColor) {
                    this.context.stroke();
                }
                return this;
            }

            // Line
            drawLine(x1, y1, x2, y2, color = 'black', thickness = 1) {
                this._strokeStyle(color, thickness);
                this.context.beginPath();
                this.context.moveTo(x1, y1);
                this.context.lineTo(x2, y2);
                this.context.stroke();
                return this;
            }

            drawPolyline(vertices, color = 'black', thickness = 1) {
                this._strokeStyle(color, thickness);
                this.context.beginPath();
                const startVertex = vertices[0];
                this.context.moveTo(...startVertex);
                for(let vertex of vertices.slice(1)) {
                    this.context.lineTo(...vertex);
                }
                this.context.stroke();
                return this;
            }

            // TODO stroke and fill polygon methods

            drawPolygon(vertices, fillColor = 'black', strokeColor = undefined, thickness = 1) {
                this._fillStyle(fillColor);
                this._strokeStyle(strokeColor, thickness);
                this.context.beginPath();
                const startVertex = vertices[0];
                this.context.moveTo(...startVertex);
                for(let vertex of vertices.slice(1)) {
                    this.context.lineTo(...vertex);
                }
                this.context.closePath();
                if(fillColor) {
                    this.context.fill();
                }
                if(strokeColor) {
                    this.context.stroke();
                }
                return this;
            }

            // Text
            write(x, y, content, color = 'black', size = 12, font = 'Arial monospaced', rotation = 0, alpha = 1) {
                this.context.save();
                this.context.globalAlpha = alpha;
                this.context.translate(x, y); 
                this.context.rotate(rotation);
                this._fillStyle(color);
                this.context.font = `${parseInt(size)}px ${font}`;
                this.context.fillText(content, 0, 0);
                this.context.restore();
                return this;
            }

            // Images
            drawSprite(
                x, y, image, spriteX, spriteY, spriteWidth, spriteHeight, 
                drawnWidth = spriteWidth, drawnHeight = spriteHeight, rotation = 0, alpha = 1
            ) {
                this.context.save();
                this.context.globalAlpha = alpha;
                this.context.translate(x, y);
                this.context.rotate(rotation);
                this.context.drawImage(
                    image, spriteX, spriteY, spriteWidth, spriteHeight,
                    -drawnWidth/2, -drawnHeight/2, drawnWidth, drawnHeight
                );
                this.context.restore();
                return this;
            }
                    
        }
    },

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * User input
     */
    Input: {
        
        _keys: {},

        _mouse: {
           x: 0,
           y: 0,
           moveX: 0,
           moveY: 0,
           xInCanvas: 0,
           yInCanvas: 0,
           left: false,
           middle: false,
           right: false,
           down: false,
           draggedEntity: null,
        },

        init(canvasHandler = null) {
            
            // mouse listeners
            document.onmousemove = e => {
                Mx.Input._mouse.x = e.x;
                Mx.Input._mouse.moveX = e.movementX;
                Mx.Input._mouse.y = e.y;
                Mx.Input._mouse.moveY = e.movementY;
                if(!!canvasHandler) {
                    Mx.Input._mouse.xInCanvas = (e.x - canvasHandler.vpX) / canvasHandler.vpScale - canvasHandler.parent.clientLeft;
                    Mx.Input._mouse.yInCanvas = (e.y - canvasHandler.vpY) / canvasHandler.vpScale - canvasHandler.parent.clientTop;
                }
            };

            document.onmousedown = e => {
                switch(e.button) {
                    case 0: Mx.Input._mouse.left = true; break;
                    case 1: Mx.Input._mouse.middle = true; break;
                    case 2: Mx.Input._mouse.right = true; break;
					default: break;
                }
                Mx.Input._mouse.down = (
                    Mx.Input._mouse.left ||
                    Mx.Input._mouse.middle ||
                    Mx.Input._mouse.right
                );
            };

            document.onmouseup = e => {
                switch(e.button) {
                    case 0: Mx.Input._mouse.left = false; break;
                    case 1: Mx.Input._mouse.middle = false; break;
                    case 2: Mx.Input._mouse.right = false; break;
					default: break;
                }
                Mx.Input._mouse.down = (
                    Mx.Input._mouse.left ||
                    Mx.Input._mouse.middle ||
                    Mx.Input._mouse.right
                );
            };

            // key listeners
            document.onkeydown = (e) => {
                Mx.Input._keys[e.code] = true;
            };
            document.onkeyup = (e) => {
                Mx.Input._keys[e.code] = false;
            };

            // disable context menu on right click
            document.oncontextmenu = () => false;
            return this;
        },

        keys() {
           return this._keys;
        },

        mouse() {
            return this._mouse;
        },

    },

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Audio instance handler
     */
    AudioHandler : class {

        static create(fileUrl) {
            return new Mx.AudioHandler(fileUrl);
        }

        constructor(fileUrl){
            this.src = fileUrl;
            this.audio = new Audio(fileUrl);
        }
    
        play(){
            this.audio.play();
            return this;
        }

        volume(vol) {
            this.audio.volume = Gmt.clamp(vol, 0, 1);
            return this;
        }

        rate(rate) {
            if(rate < 0) {
                return this.pause();
            }
            this.audio.playbackRate = rate;
            return this;
        }
    
        pause(){
            this.audio.pause();
            return this;
        }
    
        time(time){
            this.audio.currentTime = time;
            return this;
        }

        rewind(){
           return this.time(0);
        }

        reset(){
            return this.volume(1).rate(1).rewind().pause();
        }

        source(src) {
            this.src = src;
            this.audio = new Audio(src);
            return this;
        }
    
        isOn(){     
            return !this.audio.paused();
        }

        getDuration() {
            return this.audio.duration;
        }
    },

}

// enabling node.js imports
if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = Mx;
}