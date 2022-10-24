
import('./flower_data.js').Flower;
import * as flower_data from './flower_data.js';
import * as layout from './layout.js';

/**
 * Hierarchical sorting function. 
 * Returns first non-zero difference in two flowers attributes in order of selection. If non exists, returns 0.
 * 
 * @param {Flower} a
 * @param {Flower} b
 * @return {number}
 */
export function sortFlowers(a, b) {
    const sortValues = layout.sortSelections().map(key => {
        if (key === 'petal_r') {
            const aR = flower_data.getMaxR(a);
            const bR = flower_data.getMaxR(b);
            
            return bR - aR;
        }
        return b[key] - a[key]
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