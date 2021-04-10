"use strict";
/** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== =====
 * Collection of tools that can be used to create games  with JS and HTML5 canvas
 * @author Lukasz Kaszubowski (matszach)
 * @see https://github.com/matszach
 * @version 0.2.0
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
    
    scale(xScale, yStale, xOrigin = this.x, yOrigin = this.y) {
        // abstract
        return this;
    }

    rotate(phi, xOrigin = this.x, yOrigin = this.y) {
        // abstract
        return this;
    }

    _getDrawn(canvasHandler) {
        // abstract
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
        
        scale(xScale, yStale, xOrigin = this.x, yOrigin = this.y) {
            super.scale(xScale, yStale, xOrigin, yOrigin);
            this.forChild(c => c.scale(xScale, yStale, xOrigin, yOrigin));
            return this;
        }
    
        rotate(phi, xOrigin = this.x, yOrigin = this.y) {
            // abstracta
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
                this._interval = setInterval(() => {
                    this.tickCount++;
                    this.callback(this);
                });
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

        Vertex: class extends _Entity {

            toCircle(radius) {
                // TODO
            }

            _getDrawn(canvasHandler) {
                // TODO
            }

        }

    },

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Drawing and canvas handling classes and tools
     */
    Draw: {

        CanvasHandler: class {

            static init(homeId) {

            }

        }
    },

}

if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = Mx;
}