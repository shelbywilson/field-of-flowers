import('./typedefs.js').Flower;
import('./typedefs.js').Coord;

import { config } from './config.js';
import { sortFlowers } from './sort.js';
import * as layout from './layout.js';
import * as flower_data from './flower_data.js';
import * as hilbert from './hilbert.js';


/**
 * Initialize SVG
 * 
 */
export function init() {
    initInstancing();
    initField();
}

/**
 * Add elements to SVG
 * 
 */
function initField() {
    let svg = d3.select('#field svg')
        .append('g')
        .attr('id', 'flowers')
        .style('max-height', '100vh')

    scaleSvg();

    svg.append('path')
        .attr('class', 'sort-path')
        .attr('d', getSortPathCommands)
        .style('display', 'none')

    svg.selectAll('.flower')
        .data(flower_data.flowers)
        .join(
            function(enter) {
                const flower = enter.append('g')
                    .attr('class', 'flower')
                    .style('transform-origin', d => `0% ${d.stem_size}px`)
                    .style('transform', (d, i) => { 
                        const coord = getLinearFlowerCoord(i);
                        return `translate(${coord.x - ((Math.random() * 50) - 25)}px,${coord.y - ((Math.random() * 80) - 40) - d.stem_size}px) scale(${layout.flowerScale()})`
                    })
                
                const g = flower.append('g');

                g.append('line')
                    .style('stroke', 'yellowgreen')
                    .attr('x1', 0)
                    .attr('x2', 0)
                    .attr('y1', 0)
                    .attr('y2', d => `${d.stem_size}px`)
                
                g.selectAll('leaf')
                    .append('path')
                    .data(d => new Array(d.leaf_num).fill(null).map(_ => ({petal_r: d.petal_r, petal_num: d.petal_num})))
                        .join(
                            function(enter) {
                                enter.each(function(d,i) {
                                    d3.select(this)
                                        .append('use')
                                        .attr('xlink:href', i%2 ? '#leaf' : '#leaf-flip')
                                        .attr('x', (i%2 ? 0 : -16) + (i%2 ? 0.5 : -0.5))
                                        .attr('y', (1/getBloomScale(d) * flower_data.getFlowerDiskDiameterMultiplier(d)) * (flower_data.getMaxR(d)) + i * 7)
                                        .attr('transform', d => `scale(${getBloomScale(d)})`)
                                })
                            }
                        )
                
                flower.append('use')
                    .attr('xlink:href', d => `#${getBloomInstanceId(d)}`)
                    .attr('transform', d => `scale(${getBloomScale(d)})`)
            },
        )

    svg.append('path')
        .attr('class', 'sort-path-display')
        .attr('d', getSortPathCommands)
        .style('display', 'none')
}

/**
 * Update SVG
 * 
 */
export function update(transition = config.transition) {
    if (layout.isSmallScreen()) {
        transition = 0;
    }

    scaleSvg();

    d3.select('.sort-path')
        .style('display', 'none')
        .attr('d', getSortPathCommands)

    d3.select('.sort-path-display')
        .style('display', layout.isSortPathVisible() ? '' : 'none')
        .transition()
            .duration(transition)
            .attr('d', getSortPathCommands)

    d3.selectAll('.flower')
        .sort(sortFlowers)
        .transition()
            .duration(transition)
            .style('transform', getFlowerCoordTransform)
}

/**
 * Get sort path data
 * 
 * @return {string} 
 */
function getSortPathCommands() {
    let path = '';

    if (layout.isHilbert()) {
        path = hilbert.getPathCommands();
    } else {
        path = `M${config.margin.x}, 0`;

        flower_data.flowers.forEach((flower, i) => {
            const coord = getLinearFlowerCoord(i)

            path += `L${coord.x}, ${coord.y}`
        })
    }

    return path;
}

/**
 * Rescale flowers and svg
 * 
 */
function scaleSvg() {
    d3.select('svg')
        .attr('viewBox', `0 0 ${layout.fieldWidth()} ${layout.fieldHeight()}`)

    d3.select('#flowers')
        .style('transform', `translate(${config.margin.x/2}px, ${(config.margin.y * 2 + 20) * layout.flowerScale()}px)`)
}

/**
 * Generate randomized array of flowers
 * 
 * @param {Flower} d
 * @return {number} 
 */
function getBloomScale(d) {
    return d.petal_r/flower_data.maxPetalR;
}

/**
 * Append ellipse (petal) to flower bloom
 * 
 * @param {Flower} d
 * @param {number} i
 */
function appendPetal(d, i) {
    const r = flower_data.getPetalRxy(d, i);

    if (d.petal_num === 6 && i < 3) {
        r.rx *= 0.8;
        r.ry *= 0.8;
    }

    const petal = d3.select(this)
        .append('ellipse')
        .attr('class', 'petal')
        .style('fill', d => `url(#gradient-def-${d.color})`)
        .attr('ry', r.ry)
        .attr('rx', r.rx)
        .style('transform-origin', `${flower_data.getFlowerDiskDiameter(d) * flower_data.getFlowerDiskDiameterMultiplier(d)}px 0px`)
        .style('opacity', d.petal_num === 6 || d.petal_num === 21 ? 0.75 : 0.9)

    switch(d.petal_num) {
        case 6:
            petal.style('transform', `translate(${-r.ry/4}px, 0) rotateZ(${90 + (i%3 * -30)}deg)`)
            break;
        case 4:
        case 5:
            petal.style('transform', `rotateZ(${45 + ((i + 0.5)/d.petal_num) * 360}deg)`)
            break;
        case 3:
            petal.style('transform', `rotateZ(${((i + 0.5)/d.petal_num) * 360}deg)`)
            break;
        default:
            petal.style('transform', `rotateZ(${(i/d.petal_num) * 360 * (d.petal_num%2 === 0 ? 1 : 2)}deg)`)
            break;
    }
}  

/**
 * Append bloom instances
 * 
 */
function initInstancing() {
    let keys = {};
    flower_data.flowers.forEach(function(d) {
        const key = getBloomInstanceId(d);
        if (!keys[key]) {
            keys[key] = 0;

            appendBloomInstance(d);
        }
        keys[key] += 1;
    })
}

/**
 * Returns id of bloom instance
 * 
 * @param {Flower} d
 * @return {string} 
 */
function getBloomInstanceId(d) {
    return `f-${d.petal_num}-${d.color}`
}

/**
 * Append flower bloom
 * 
 * @param {Flower} d
 */
function appendBloomInstance(d) {
    d.petal_r = flower_data.maxPetalR;

    const bloom = d3.select('#instances')
        .append('g')
        .attr('id', getBloomInstanceId(d))
        .attr('class', 'bloom')

    const petals = bloom.append('g')
        .attr('transform', `translate(${-flower_data.getFlowerDiskDiameter(d) * flower_data.getFlowerDiskDiameterMultiplier(d)}, 0)`)

    petals.selectAll('.petal')
        .data(new Array(d.petal_num).fill(null).map(_ => ({...d})))
        .join(
            function(enter) {
                enter.each(appendPetal)
            }
        )

    petals.selectAll('.petal')
        .filter((d,i) => d.petal_num === 6 ? i === 4 : (i+1)%3 === 2)
        .raise()

    if (d.petal_num !== 6) {
        bloom.append('circle')
            .style('fill', d.color === 3 ? 'darkred' : d.color === 1 ? 'darkorange' : 'gold')
            .attr('r', flower_data.getFlowerDiskDiameter(d)/2 * 1.1)
    }
}

/**
 * Returns x, y coordinates of linear layout
 * 
 * @param {number} i
 * @return {Coord} 
 */
function getLinearFlowerCoord(i) {
    const x = d3.scaleLinear()
        .domain([0, layout.flowersPerRow() - 1])
        .range([config.margin.x * layout.flowerScale() * (layout.isSmallScreen() ? 2 : 1), layout.fieldWidth() - (config.margin.x * layout.flowerScale() * 2 * (layout.isSmallScreen() ? 2 : 1))])

    const y = d3.scaleLinear()
        .domain([0, layout.flowersPerCol()])
        .range([0, layout.fieldHeight() - config.margin.y])

    return {
        x: x(i%layout.flowersPerRow()),
        y: y(Math.floor(i / layout.flowersPerRow()))
    }
}

/**
 * Returns x, y coordinates of Hilbert curve layout
 * 
 * @param {number} i
 * @return {Coord} 
 */
function getHilbertFlowerCoord(i) {
    const node = d3.select('.sort-path').node()
    
    return node.getPointAtLength(i * node.getTotalLength() / config.num_flowers);
}

/**
 * Returns transform style of flower
 * 
 * @param {Flower} d
 * @param {number} i
 * @return {string} - translate and scale transform
 */
function getFlowerCoordTransform(d, i) {
    const coord = layout.isHilbert() ?
        getHilbertFlowerCoord(i)
        :
        getLinearFlowerCoord(i)

    return `translate(${coord.x}px,${coord.y - d.stem_size}px) scale(${layout.flowerScale()}) `
}
