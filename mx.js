"use strict";
/** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== =====
 * Collection of tools that can be used to create games  with JS and HTML5 canvas
 * @author Lukasz Kaszubowski (matszach)
 * @see https://github.com/matszach
 * @version 0.4.4
 */

/** ===== ===== ===== ===== ===== ===== ===== ===== ===== =====
 * Base classes extended within the library
 */

/** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
 * Base entity class, extended by geometry classes and by image draw classes
 */
class _Entity {

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.isMouseOver = false;
        this.isMouseDown = false;
        this.isMouseDrag = false;
        this.onMouseOver = () => {};
        this.onMouseOut = () => {};
        this.onMouseDown = () => {};
        this.onMouseUp = () => {};
        this.onMouseDrag = () => {};
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
        // TODO
        return this;
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
        const isNowMouseOver = this.isPointOver(mouse.x, mouse.y);
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
                this.onMouseDrag(mouse, this);
            }
        } else {
            if(this.isMouseDown) {
                this.onMouseUp(mouse, this);
                this.isMouseDown = false;
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
        return this.on('drag', (mouse, e) => e.place(mouse.x, mouse.y));
    }

}

/** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
 * Library body proper
 */
const Mx = {

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Assigned here for public access
     */
    Entity: _Entity,

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Entity that can contain other entities
     */
    Container: class extends _Entity {

        constructor(x, y) {
            super(x, y);
            this.children = [];
        }

        add(entity) {
            this.children.push(entity);
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
            // TODO
            return this;
        }
    
        _getDrawn(canvasHandler) {
            this.forChild(c => this._getDrawn(canvasHandler))
        }

        listen() {
            this.forChild(c => c.listen());
            return this;
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
        }

    },

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Iteration tools
     */
    It: {

        /**
         * Ring array
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

        Vertex: class extends _Entity {

            toCircle(radius, backgroundColor, borderColor, borderThickness) {
                return new Mx.Geo.Circle(this.x, this.y, radius, backgroundColor, borderColor, borderThickness);
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
            
            scale(scaleX = 1, scaleY = scaleX, xOrigin = this.x1, yOrigin = this.y1) {
                this.x1 = scaleX * (this.x1 - xOrigin) + xOrigin;
                this.y1 = scaleY * (this.y1 - yOrigin) + yOrigin;
                this.x2 = scaleX * (this.x2 - xOrigin) + xOrigin;
                this.y2 = scaleY * (this.y2 - yOrigin) + yOrigin;
                return this;
            }
        
            rotate(phi, xOrigin = this.x, yOrigin = this.y) {
                // TODO
                return this;
            }
        
            _getDrawn(canvasHandler) {
                canvasHandler.drawLine(this.x1, this.y1, this.x2, this.y2, this.color, this.thickness);
            }

            getCenter() {
                return new Mx.Geo.Vertex(
                    (this.x1 + this.x2)/2
                    (this.y1 + this.y2)/2
                );
            }

        },

        Polyline: class extends _Entity {

            constructor(verticesInfo, color, thickness) {
                super(-1, -1);
                this.verticesInfo = verticesInfo;
                this.color = color;
                this.thickness = thickness;
            }

            place(x, y) {
                const [ix, iy] = this.verticesInfo[0];
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
                return Mx.Geo.Vertex(x, y);
            }

            add(x, y) {
                this.verticesInfo.push([x, y]);
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
                return new Mx.Geo.Vertex(
                    this.x + this.width/2,
                    this.y + this.height/2
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
                return new Mx.Geo.Vertex(this.x, this.y);
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
                this._onResize = () => {};
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
                window.addEventListener('resize', event => this.refit()._onResize(), this);
                return this;
            }

            refit() {
                this.canvas.width = this.parent.clientWidth;
                this.canvas.height = this.parent.clientHeight;
                return this;
            }

            onResize(callback) {
                this._onResize = callback;
                callback();
                return this;
            }

            clear() {
                this.context.clearRect(0, 0 , this.canvas.width, this.canvas.height);
                return this;
            }
    
            fill(color) {
                this.context.fillStyle = color;
                this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
                return this;
            }

            grid(xSpacing, ySpacing, color = 'gray', thickness = 0.5) {
                for(let x = 0; x < this.canvas.width; x += xSpacing) {
                    this.drawLine(x, 0, x, this.canvas.height, color, thickness);
                }
                for(let y = 0; y < this.canvas.height; y += ySpacing) {
                    this.drawLine(0, y, this.canvas.width, y, color, thickness);
                }
                return this;
            }

            // Mx.Entity
            draw(entity) {
                entity._getDrawn(this);
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

            drawCircle(x, y, radius, fillColor, strokeColor, thickness = 1) {
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
           left: false,
           middle: false,
           right: false,
        },

        init() {
            
            // mouse listeners
            document.onmousemove = e => {
                Mx.Input._mouse.x = e.x;
                Mx.Input._mouse.moveX = e.movementX;
                Mx.Input._mouse.y = e.y;
                Mx.Input._mouse.moveY = e.movementY;
            };

            document.onmousedown = e => {
                switch(e.button) {
                    case 0: Mx.Input._mouse.left = true; break;
                    case 1: Mx.Input._mouse.middle = true; break;
                    case 2: Mx.Input._mouse.right = true; break;
					default: break;
                }
            };

            document.onmouseup = e => {
                switch(e.button) {
                    case 0: Mx.Input._mouse.left = false; break;
                    case 1: Mx.Input._mouse.middle = false; break;
                    case 2: Mx.Input._mouse.right = false; break;
					default: break;
                }
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

}

// enabling node.js imports
if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = Mx;
}