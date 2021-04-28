const Mx = require("../mx");

const randA = Mx.Rng.init();
const randB = Mx.Rng.fromMathRandom();

const aStart = new Date().getTime();
for(let i = 0; i < 1000000; i++) {
    randA.fract();
}
const aEnd = new Date().getTime();
console.log(aEnd - aStart);

const bStart = new Date().getTime();
for(let i = 0; i < 1000000; i++) {
    randB.fract();
}
const bEnd = new Date().getTime();
console.log(bEnd - bStart);
