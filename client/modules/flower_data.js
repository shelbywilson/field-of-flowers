import('./typedefs.js').PetalRxy;
import('./typedefs.js').Flower;
import { config } from './config.js';

export let flowers = [];
export let maxPetalR = 0;

/**
 * Set flowers and maxPetalR
 * 
 */
export function init() {
    const arr = getFlowerData();

    maxPetalR = d3.max(arr, d => d.petal_r);
    flowers = arr;
}

/**
 * Generate randomized array of flowers
 * 
 * @return {Array.<Flower>} 
 */
function getFlowerData() {
    let arr = [];

    while (arr.length < config.num_flowers) {
        const petal_r = 4 + (Math.ceil(Math.random() * 5));
        let petal_num = 3 + Math.floor(Math.random() * 8);
        let color = Math.floor(6 * Math.random());

        if (petal_num === 9) {
            petal_num = 21;
        }

        // apply color / petal rules
        if (color === 5 && (petal_num === 6 || petal_num === 8 || petal_num === 10 || petal_num === 21)
            || (color === 1 && petal_num === 5)
            || (color === 3 && petal_num === 8)
            || (color === 0 && petal_num === 10)) {
            color = 6;
        }
        arr.push({
            petal_r,
            color,
            petal_num,
            leaf_num: Math.ceil(Math.random() * 5),
            stem_size: 80 + (Math.floor(Math.random() * 8) * 7),
        })
    }
    return arr;
}

/**
 * Returns elliptical petal dimensions
 * 
 * @return {PetalRxy} 
 */
export function getPetalRxy(d, i) {
    let r = {
        rx: 0,
        ry: 0,
    }
    switch(d.petal_num) {
        case 10:
            r.ry = d.petal_r * 3/4;
            r.rx = d.petal_r * 2.35;
            break;
        case 6:
            r.ry = d.petal_r * 4/3;
            r.rx = d.petal_r * 4/3 * 4/3;
            break;
        case 4:
        case 5:
            r.ry = d.petal_r * 1.2;
            r.rx = d.petal_r * 4/3;
            break;
        case 3:
            r.ry = d.petal_r * 1.3;
            r.rx = d.petal_r * 2.1;
            break;
        case 21:
            r.ry = d.petal_r * (i >= 12 ? 0.75 : 1);
            r.rx = d.petal_r * 2;
            break;
        default:
            r.ry = d.petal_r;
            r.rx = d.petal_r * 2;
            break;
    }

    return r;
}

/**
 * Returns greater petal dimension
 * 
 * @return {number} 
 */
export function getMaxR(d) {
    const r = getPetalRxy(d, 0);
            
    return Math.max(r.rx, r.ry)
}

export function getFlowerDiskDiameter(d) {
    switch(d.petal_num) {
        case 3:
        case 6:
            return d.petal_r;
        case 10:
            return d.petal_r * 2.25;
        default:
            return d.petal_r * 4/3;
    }
}

export function getFlowerDiskDiameterMultiplier(d) {
    switch(d.petal_num) {
        case 6:
            return 1;
        case 4:
        case 5:
            return 4/3;
        case 10:
            return 1.5;
        default:
            return 2
    }
}
