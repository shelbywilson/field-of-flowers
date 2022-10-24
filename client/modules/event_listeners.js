import * as layout from './layout.js';
import * as svg from './svg.js';

/**
 * Add page event listeners
 * 
 */
export function init() {
    window.addEventListener('resize', () => {
        if (!layout.isSmallScreen()) {
            svg.update(0)
        }
    });

    const inputs = document.querySelectorAll('select, input:not(.toggle-sort-direction-checkbox)');
    for (let i = 0; i < inputs.length; i += 1) {
        inputs[i].addEventListener('change', (e) => {
            event.target.closest(".input-container").classList.add('active');
            svg.update()
        })
        inputs[i].addEventListener('focus', (e) => {
            event.target.closest(".input-container").classList.add('focus');
        })
        inputs[i].addEventListener('blur', (e) => {
            event.target.closest(".input-container").classList.remove('focus');
        })
    }

    const toggleSortDirections = document.querySelectorAll('.toggle-sort-direction-checkbox');
    for (let i = 0; i < toggleSortDirections.length; i += 1) {
        toggleSortDirections[i].addEventListener('change', () => svg.update());
    }

    document.getElementById('open-sort-dialog').addEventListener('click', () => openSortDialog());

    document.getElementById('close-sort-dialog').addEventListener('click', () => closeSortDialog());

    document.getElementById('toggle-sort-path').addEventListener('change', () => svg.update());

    document.getElementById('zoom').addEventListener('change', () => svg.update());

    document.addEventListener('keydown', handleKeyDown)
}

/**
 * Hide sort dialog
 * 
 */
function closeSortDialog() {
    const dialog = document.querySelector('#sort-dialog');
    dialog.open = false;

    document.getElementById('open-sort-dialog').style.display = '';
}

/**
 * Show sort dialog
 * 
 */
function openSortDialog() {
    const dialog = document.querySelector('#sort-dialog');
    dialog.open = true;

    document.getElementById('open-sort-dialog').style.display = 'none';
}

/**
 * Close sort dialog on escape
 * 
 */
function handleKeyDown(e) {
    if (e.key === 'Escape' || e.which == 27) {
        closeSortDialog();
    }
}