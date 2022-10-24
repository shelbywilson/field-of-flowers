window.onload = init;

const config = {
    margin: {
        x: 30, 
        y: 100,
    },
    hilbert_order: 6,
    transition: 600,
    num_flowers: 500,
}
const state = {
    flowers: [],
    max_petal_r: 0,
}

function init() {
    initFlowers();
    initInstancing();
    initField();

    const selects = document.getElementsByTagName('select');

    for (let i = 0; i < selects.length; i += 1) {
        selects[i].addEventListener('change', (e) => {
            event.target.parentNode.classList.add('active');
            update()
        })
        selects[i].addEventListener('focus', (e) => {
            event.target.parentNode.classList.add('focus');
        })
        selects[i].addEventListener('blur', (e) => {
            event.target.parentNode.classList.remove('focus');
        })
    }

    const radios = document.querySelectorAll('input[type="radio"]');
    for (let i = 0; i < radios.length; i += 1) {
        radios[i].addEventListener('change', () => update())
    }

    window.addEventListener('resize', () => {
        if (!isSmallScreen()) {
            update(0)
        }
    });

    document.getElementById('toggle-view-sort').addEventListener('click', (e) => toggleViewSort(e))

    document.getElementById('toggle-sort-path').addEventListener('change', () => update());

    document.getElementById('zoom').addEventListener('change', () => update());
}

function toggleViewSort(e) {
    const sorting = document.querySelector('#sorting');
    sorting.classList.toggle('collapse');

    if (sorting.classList.contains('collapse')) {
        e.target.innerHTML = '&#x273F;';
    } else {
        e.target.innerHTML = '&#x25CF;';
    }
}

function bloomScale(d) {
    return d.petal_r/state.max_petal_r;
}

function isSmallScreen() {
    return window.innerWidth < 700;
}

function isSortPathVisible() {
    return document.getElementById('toggle-sort-path').checked;
}

function flowerScale() {
    const scale = d3.scaleLinear()
        .domain([5,100])
        .range([1.25, 0.6])

    return scale(perRow()) * (isSmallScreen() ? 0.5 : 1)
}

function isHilbert() {
    return document.getElementById('is-hilbert').checked;
}

function zoom() {
    return document.getElementById('zoom').value;
}

function perCol() {
    return Math.ceil(state.flowers.length / zoom());
}

function perRow() {
    return zoom();
}

function fieldHeight() {
    return Math.max(window.innerHeight - 120, perCol() * 200 * flowerScale() * (isHilbert() ? 1.4/Math.log(perCol()) : 1));
}

function fieldWidth() {
    return Math.min(window.innerWidth, 1600);
}

function initInstancing() {
    let keys = {};
    state.flowers.forEach(function(d) {
        const key = getBloomInstanceId(d);
        if (!keys[key]) {
            keys[key] = 0;

            addBloomInstance(d);
        }
        keys[key] += 1;
    })
}

function getBloomInstanceId(d) {
    return `f-${d.petal_num}-${d.color}`
}

function addBloomInstance(d) {
    d.petal_r = state.max_petal_r;

    const bloom = d3.select('#instances')
        .append('g')
        .attr('id', getBloomInstanceId(d))
        .attr('class', 'bloom')

    const petals = bloom.append('g')
        .attr('transform', `translate(${-flowerDiskDiameter(d) * flowerDiskDiameterMultiplier(d)}, 0)`)

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
            .attr('r', flowerDiskDiameter(d)/2 * 1.1)
    }
}

function getSortSelections() {
    const selects = document.getElementsByTagName('select');
    const values = [];

    for (let i = 0; i < selects.length; i += 1) {
        if (selects[i].value) {
            values.push(selects[i].value)
        }
    }

    return values;
}

function initFlowers() {
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

    state.max_petal_r = d3.max(arr, d => d.petal_r);
    state.flowers = arr;
}

function maxR(d) {
    const r = petalRxy(d, 0);
            
    return Math.max(r.rx, r.ry)
}

function sortFlowers(a, b) {
    const sortValues = getSortSelections().map(key => {
        if (key === 'petal_r') {
            const aR = maxR(a);
            const bR = maxR(b);
            
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
    return sortValues[i];
}

function hilbertPathCoord(index) {
    const order = config.hilbert_order;
    const n = 2 ** order;
    const point = { x: 0, y: 0 };
    let rx, ry;
    for (let s = 1, t = index; s < n; s *= 2) {
        rx = 1 & (t / 2);
        ry = 1 & (t ^ rx);
        rotateHilbert(point, rx, ry, s);
        point.x += s * rx;
        point.y += s * ry;
        t /= 4;
    }
    return point;
}

function rotateHilbert(point, rx, ry, n) {
    if (ry !== 0) {
      return;
    }
    if (rx === 1) {
      point.x = n - 1 - point.x;
      point.y = n - 1 - point.y;
    }
    [point.x, point.y] = [point.y, point.x];
  }

function getLinearFlowerCoord(i) {
    const x = d3.scaleLinear()
        .domain([0, perRow() - 1])
        .range([config.margin.x * flowerScale() * (isSmallScreen() ? 2 : 1), fieldWidth() - (config.margin.x * flowerScale() * 2 * (isSmallScreen() ? 2 : 1))])

    const y = d3.scaleLinear()
        .domain([0, perCol()])
        .range([0, fieldHeight() - config.margin.y])

    return {
        x: x(i%perRow()),
        y: y(Math.floor(i / perRow()))
    }
}

function getHilbertFlowerCoord(i) {
    const node = d3.select('.sort-path').node()
    
    return node.getPointAtLength(i * node.getTotalLength()/state.flowers.length);
}

function getFlowerCoordTransform(d, i) {
    const coord = isHilbert() ?
        getHilbertFlowerCoord(i)
        :
        getLinearFlowerCoord(i)

    return `translate(${coord.x}px,${coord.y - d.stem_size}px) scale(${flowerScale()}) `
}

function scaleSvg(transition = config.transition) {
    d3.select('svg')
        .attr('viewBox', `0 0 ${fieldWidth()} ${fieldHeight()}`)

    d3.select('#flowers')
        .transition()
            .duration(transition)
            .style('transform', `translate(${config.margin.x/2}px, ${(config.margin.y * 2 + 20) * flowerScale()}px)`)
}


function update(transition = config.transition) {
    if (isSmallScreen()) {
        transition = 0;
    }

    scaleSvg(transition);

    d3.select('.sort-path')
        .style('display', 'none')
        .attr('d', sortPath)

    d3.select('.sort-path-display')
        .style('display', isSortPathVisible() ? '' : 'none')
        .transition()
            .duration(transition)
            .attr('d', sortPath)

    d3.selectAll('.flower')
        .sort(sortFlowers)
        .transition()
            .duration(transition)
            .style('transform', getFlowerCoordTransform)
}

function sortPath() {
    let path = `M${config.margin.x}, 0`

    if (isHilbert()) {
        const coords = new Array(512).fill(null).map((flower, i) => hilbertPathCoord(i));

        const x = d3.scaleLinear()
            .domain([0, d3.max(coords, d => d.x)])
            .range([config.margin.x, fieldWidth() - (config.margin.x * 2)])

        const y = d3.scaleLinear()
            .domain([0, d3.max(coords, d => d.y)])
            .range([0, fieldHeight() - (config.margin.y * 2 * flowerScale()) - 30])

        coords.forEach(coord => {
            path += `L${x(coord.x)}, ${y(coord.y)}`
        })
    } else {
        [...state.flowers].forEach((flower, i) => {
            const coord = getLinearFlowerCoord(i)
    
            path += `L${coord.x}, ${coord.y}`
        })
    }

    return path;
}

function petalRxy(d, i) {
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
            r.ry = d.petal_r * (i > 13 ? 0.75 : 1);
            r.rx = d.petal_r * 2;
            break;
        default:
            r.ry = d.petal_r;
            r.rx = d.petal_r * 2;
            break;
    }

    return r;
}

function flowerDiskDiameter(d) {
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

function flowerDiskDiameterMultiplier(d) {
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

function appendPetal(d, i) {
    const r = petalRxy(d, i);

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
        .style('transform-origin', `${flowerDiskDiameter(d) * flowerDiskDiameterMultiplier(d)}px 0px`)
        .style('opacity', d.petal_num === 6 || d.petal_num === 21 ? 0.75 : 0.9)

    switch(d.petal_num) {
        case 6:
            petal.style('transform', `translate(${-r.ry/4}px, 0) rotateZ(${90 + (i%3 * -30)}deg)`)
            return;
        case 4:
        case 5:
            petal.style('transform', `rotateZ(${45 + ((i + 0.5)/d.petal_num) * 360}deg)`)
            return;
        case 3:
            petal.style('transform', `rotateZ(${((i + 0.5)/d.petal_num) * 360}deg)`)
            return;
        default:
            petal.style('transform', `rotateZ(${(i/d.petal_num) * 360 * (d.petal_num%2 === 0 ? 1 : 2)}deg)`)
            return;
    }
}  

function initField() {
    let svg = d3.select('#field svg')
        .append('g')
        .attr('id', 'flowers')
        .style('max-height', '100vh');

    scaleSvg(0);

    svg.append('path')
        .attr('class', 'sort-path')
        .attr('d', sortPath)
        .style('display', 'none')

    svg.selectAll('.flower')
        .data(state.flowers)
        .join(
            function(enter) {
                const flower = enter.append('g')
                    .attr('class', 'flower')
                    .style('transform-origin', d => `0% ${d.stem_size}px`)
                    .style('transform', (d, i) => { 
                        const coord = getLinearFlowerCoord(i);
                        return `translate(${coord.x - ((Math.random() * 50) - 25)}px,${coord.y - ((Math.random() * 80) - 40) - d.stem_size}px) scale(${flowerScale()})`
                    })

                const g = flower.append('g')
                
                g.append('line')
                    .style('stroke', 'yellowgreen')
                    .attr('x1', 0)
                    .attr('x2', 0)
                    .attr('y1', 0)
                    .attr('y2', d => `${d.stem_size}px`)
                
                g.append('g')
                    .selectAll('leaf')
                    .append('path')
                    .data(d => new Array(d.leaf_num).fill(null).map(_ => ({petal_r: d.petal_r, petal_num: d.petal_num})))
                        .join(
                            function(enter) {
                                enter.each(function(d,i) {
                                    d3.select(this)
                                        .append('use')
                                        .attr('xlink:href', i%2 ? '#leaf' : '#leaf-flip')
                                        .attr('x', (i%2 ? 0 : -16) + (i%2 ? 0.5 : -0.5))
                                        .attr('y', (1/bloomScale(d) * flowerDiskDiameterMultiplier(d)) * (petalRxy(d, i).rx) + i * 7)
                                        .attr('transform', d => `scale(${bloomScale(d)})`)
                                })
                            }
                        )
                
                g.append('g')
                    .append('use')
                    .attr('xlink:href', d => `#${getBloomInstanceId(d)}`)
                    .attr('transform', d => `scale(${bloomScale(d)})`)
            },
        )

    svg.append('path')
        .attr('class', 'sort-path-display')
        .attr('d', sortPath)
        .style('display', 'none')
}