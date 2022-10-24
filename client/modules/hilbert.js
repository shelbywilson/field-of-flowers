import('./svg.js').Coord;
import { config } from './config.js';
import * as layout from './layout.js';

/**
 * Returns svg path data
 * 
 * @return {string} 
 */
export function getPathCommands() {
    let path = `M${config.margin.x}, 0`;

    const coords = new Array(512).fill(null).map((flower, i) => getPathCoord(i));

    const x = d3.scaleLinear()
        .domain([0, d3.max(coords, d => d.x)])
        .range([config.margin.x, layout.fieldWidth() - (config.margin.x * 2)])

    const y = d3.scaleLinear()
        .domain([0, d3.max(coords, d => d.y)])
        .range([0, layout.fieldHeight() - (config.margin.y * 2 * layout.flowerScale()) - 30])

    coords.forEach(coord => {
        path += `L${x(coord.x)}, ${y(coord.y)}`
    })

    return path;
}

/**
 * Converts 1D index to 2D coordinates along Hilbert curve
 * 
 * @return {Array.<Coord>} 
 */
function getPathCoord(index) {
    const order = config.hilbert_order;
    const n = 2 ** order;
    const point = { x: 0, y: 0 };
    let rx, ry;
    for (let s = 1, t = index; s < n; s *= 2) {
        rx = 1 & (t / 2);
        ry = 1 & (t ^ rx);
        rotate(point, rx, ry, s);
        point.x += s * rx;
        point.y += s * ry;
        t /= 4;
    }
    return point;
}

/**
 * Flip quadrant as needed
 * 
 */
function rotate(point, rx, ry, n) {
    if (ry !== 0) {
      return;
    }
    if (rx === 1) {
      point.x = n - 1 - point.x;
      point.y = n - 1 - point.y;
    }
    [point.x, point.y] = [point.y, point.x];
}