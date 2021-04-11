"use strict";
/** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== =====
 * Collection of tools that can be used to create games  with JS and HTML5 canvas
 * @author Lukasz Kaszubowski (matszach)
 * @see https://github.com/matszach
 * @version 0.2.2
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
        // TODO
        return this;
    }
    
    scale(scale, xOrigin = this.x, yOrigin = this.y) {
        const dx = this.x - xOrigin;
        const dy = this.y - yOrigin;
        this.x += dx * scale;
        this.y += dy * scale;
        return this;
    }

    rotate(phi, xOrigin = this.x, yOrigin = this.y) {
        // TODO
        return this;
    }

    _getDrawn(canvasHandler) {
        // abstract
    }

    isMouseOver(xMouse, yMouse) {
        // abstract
        return false;
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
    
        movePolar(phi, r) {
            super.movePolar(phi, r);
            this.forChild(c => c.movePolar(phi, r));
            return this;
        }
        
        scale(scale, xOrigin = this.x, yOrigin = this.y) {
            super.scale(scale, xOrigin, yOrigin);
            this.forChild(c => c.scale(scale, xOrigin, yOrigin));
            return this;
        }
    
        rotate(phi, xOrigin = this.x, yOrigin = this.y) {
            // TODO
            return this;
        }
    
        _getDrawn(canvasHandler) {
            this.forChild(c => this._getDrawn(canvasHandler))
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

            toCircle(radius) {
                return Mx.Geo.Circle(x, y, radius);
            }

        },

        Polyline: class extends _Entity {

        },

        Rectangle: class extends _Entity {

            constructor(x, y, width, height, backgroundColor, borderColor, borderWidth) {
                super(x, y);
                this.width = width;
                this.height = height;
                this.backgroundColor = backgroundColor;
                this.borderColor = borderColor;
                this.borderWidth = borderWidth;
            }

            scale(scale, xOrigin = this.x, yOrigin = this.y) {
                super.scale(scale, xOrigin, yOrigin);
                this.radius *- scale;
                return this;
            }

            _getDrawn(canvasHandler) {
                canvasHandler.drawRect(this.x, this.y, this.width, this.height, this.backgroundColor, this.borderColor, this.borderWidth);
            }

            isMouseOver(xMouse, yMouse) {
                return (
                    Mx.Math.between(xMouse, this.x, this.x + this.width) &&
                    Mx.Math.between(yMouse, this.y, this.y + this.height)
                );
            }
        },

        Circle: class extends _Entity {

            constructor(x, y, radius, backgroundColor, borderColor, borderWidth) {
                super(x, y);
                this.radius = radius;
                this.backgroundColor = backgroundColor;
                this.borderColor = borderColor;
                this.borderWidth = borderWidth;
            }

            scale(scale, xOrigin = this.x, yOrigin = this.y) {
                super.scale(scale, xOrigin, yOrigin);
                this.radius *- scale;
                return this;
            }

            _getDrawn(canvasHandler) {
                canvasHandler.drawCircle(this.x, this.y, this.radius, this.backgroundColor, this.borderColor, this.borderWidth);
            }

            isMouseOver(xMouse, yMouse) {
                return Mx.Geo.Distance.simple(this.x, this.y, xMouse, yMouse) < this.radius;
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
                document.body.innerHTML = '';
                const home = document.createElement('div');
                home.id = 'canvas-home';
                home.style.width = '100vw';
                home.style.height = '100vh';
                console.log(home, document, document.body, document.querySelector('body'));
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
        }
    },

}

// enabling node.js imports
if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = Mx;
}