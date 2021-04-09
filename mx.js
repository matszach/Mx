"use strict";
/** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== =====
 * Collection of tools that can be used to create games  with JS and HTML5 canvas
 * @author Lukasz Kaszubowski (matszach)
 * @see https://github.com/matszach
 * @version 0.1.0
 */
 const Mx = {

    /** ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== 
     * Random number generator
     */
    Rng: class {
        
        static _MIN_CHAR_CODE = 33;
        static _MAX_CHAR_CODE = 127;

        /**
         * TODO
         * @param {any} seed 
         * @returns 
         */
        static _transformSeed(seed) {
            const stringified = JSON.stringify(seed);
            const split = stringified.split('');
            const reduced = split.reduce((acc, curr, index) => acc + (curr.charCodeAt(0) - Mx.Rng._MIN_CHAR_CODE) * (index + 1), 0);
            const absolute = Math.abs(reduced);
            return absolute;
        }

        /**
         * Generates a random 20 character seed
         * @returns {string} a generated seed
         */
        _generateRandomSeed() {
            let seed = '';
            for(let i = 0; i < 20; i++) {
                const charCode = Math.floor(Math.random() * (Mx.Rng._MAX_CHAR_CODE - Mx.Rng._MIN_CHAR_CODE) + Mx.Rng._MIN_CHAR_CODE);
                seed += String.fromCharCode(charCode)
            }
            return seed;
        }

        /**
         * TODO
         */
        _initRandomGeneratorIndices() {
            this._indices = [];
            for(let i = 0; i < this.precision; i++) {
                this._indices.push((this._transformedSeed * i) % this._numbers.length);
            }
        }

        /**
         * TODO
         * @returns 
         */
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
         * @param {*} min - min value
         * @param {*} max - max value
         * @returns a float between min and max
         */
        float(min, max) {
            return this._random() * (max - min) + min;
        }

        /**
         * Generates a random int between min (incl.) and max (excl.)
         * @param {*} min - min value
         * @param {*} max - max value
         * @returns an int between min and max
         */
        int(min, max) {
            return Math.floor(this.float(min, max));
        }

        /**
         * Returns a random entry from a given array
         * @param {Array<K>} array - possible values to choose from
         * @returns {K} - the seleted entry
         */
        choice(array) {
            return array[this.int(0, array.length)];
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

    }

}

if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = Mx;
}