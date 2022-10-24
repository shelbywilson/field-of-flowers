import { config } from './config.js';

/**
 * Returns value to scale all flowers
 * 
 * @return {number} 
 */
export function flowerScale() {
    const scale = d3.scaleLinear()
        .domain([5,100])
        .range([1.25, 0.6])

    return scale(flowersPerRow()) * (isSmallScreen() ? 0.5 : 1)
}

/**
 * Returns number of rows, i.e. number of flowers per row
 * 
 * @return {number} 
 */
export function flowersPerCol() {
    return Math.ceil(config.num_flowers / zoomValue());
}

/**
 * Returns number of flowers per row
 * 
 * @return {number} 
 */
export function flowersPerRow() {
    return zoomValue();
}

/**
 * Returns y value of aspect ratio
 * 
 * @return {number} 
 */
export function fieldHeight() {
    return Math.max(window.innerHeight - 120, flowersPerCol() * 200 * flowerScale() * (isHilbert() ? 1.4/Math.log(flowersPerCol()) : 1));
}

/**
 * Returns x value of aspect ratio
 * 
 * @return {number} 
 */
export function fieldWidth() {
    return Math.min(window.innerWidth, 1600);
}

/**
 * Returns true value of layout radio input is 'is-hilbert'
 * 
 * @return {boolean} 
 */
export function isHilbert() {
    return document.getElementById('is-hilbert').checked;
}

/**
 * Returns value of zoom range input
 * 
 * @return {number} 
 */
export function zoomValue() {
    return document.getElementById('zoom').value;
}

/**
 * Returns value of toggle-sort-path checkbox
 * 
 * @return {boolean} 
 */
export function isSmallScreen() {
    return window.innerWidth < 700;
}

/**
 * Returns value of toggle-sort-path checkbox
 * 
 * @return {boolean} 
 */
export function isSortPathVisible() {
    return document.getElementById('toggle-sort-path').checked;
}

/**
 * Returns values of sort select elements
 * 
 * @return {array} 
 */
export function sortSelections() {
    const selects = document.getElementsByTagName('select');
    const values = [];

    for (let i = 0; i < selects.length; i += 1) {
        if (selects[i].value) {
            values.push(selects[i].value)
        }
    }

    return values;
}