import * as svg from './modules/svg.js';
import * as flower_data from './modules/flower_data.js';
import * as event_listeners from './modules/event_listeners.js';

window.onload = init;

/**
 * Generate flower data, paint page, and add event listeners
 * 
 */
function init() {
    flower_data.init();
    svg.init();
    event_listeners.init();
}
