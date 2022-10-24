
import('./flower_data.js').Flower;
import * as flower_data from './flower_data.js';

/**
 * Hierarchical sorting function. 
 * Returns first non-zero difference in two flowers attributes in order of selection. If non exists, returns 0.
 * 
 * @param {Flower} a
 * @param {Flower} b
 * @return {number}
 */
export function sortFlowers(a, b) {
    const multipliers = sortDirections();

    const sortValues = sortSelections().map((key, i) => {
        if (key === 'petal_r') {
            const aR = flower_data.getMaxR(a);
            const bR = flower_data.getMaxR(b);
            
            return (bR - aR) * multipliers[i];
        }
        return (b[key] - a[key]) * multipliers[i]
    })

    if (sortValues.length === 0) {
        return 0;
    }

    let i = 0;
    while (sortValues[i] === 0) {
        i += 1
    }
    return sortValues[i] || 0;
}

/**
 * Returns values of sort select elements.
 * 
 * @return {Array.<string>} 
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

/**
 * Returns values of sort directions only for sort elements with selections. 
 * 
 * @return {Array.<boolean>} 
 */
export function sortDirections() {
    const checkboxes = document.querySelectorAll('.toggle-sort-direction-checkbox');
    const selects = document.getElementsByTagName('select');
    const values = [];

    for (let i = 0; i < checkboxes.length; i += 1) {
        if (selects[i].value) {
            values.push(checkboxes[i].checked ? -1 : 1)
        }
    }

    return values;
}