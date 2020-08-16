const margin = { top: 40, right: 20, bottom: 50, left: 100 }
const svgWidth = 560, svgHeight = 400
const graphWidth = svgWidth - margin.left - margin.right, graphHeight = svgHeight - margin.top - margin.bottom

const svg = d3.select('.canvas')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight)

const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`)


// scales
const x = d3.scaleTime().range([0, graphWidth])
const y = d3.scaleLinear().range([graphHeight, 0])

// axes groups
const xAxisGroup = graph.append('g')
  .attr('class', 'x-axis')
  .attr('transform', `translate(0, ${graphHeight})`)

const yAxisGroup = graph.append('g')
  .attr('class', 'y-axis')

// d3 line path generator
const line = d3.line()
  .x(function (d) { return x(new Date(d.date)) })
  .y(function (d) { return y(d.distance) })

// line path element
const path = graph.append('path')

// dotted line group
const dottedLineGroup = graph.append('g').style('opacity', 0)

const xDottedLine = dottedLineGroup.append('line')
  .attr('stroke-dasharray', 4)
  .attr('stroke', '#aaa')
  .attr('stroke-width', 1)

const yDottedLine = dottedLineGroup.append('line')
  .attr('stroke-dasharray', 4)
  .attr('stroke', '#aaa')
  .attr('stroke-width', 1)

// set the domains of the scales inside the update function because the domains are dependent on the data
const update = data => {

  data = data.filter(item => item.activity == activity)

  // sort data based on date object for connecting lines
  data.sort((a, b) => new Date(a.date) - new Date(b.date))

  // set scale domains
  x.domain(d3.extent(data, d => new Date(d.date)))
  y.domain([0, d3.max(data, d => d.distance)])

  // update path data
  path.data([data])
    .attr('fill', 'none')
    .attr('stroke', '#00bfa5')
    .attr('stroke-width', 2)
    .attr('d', line)


  // create circles for objects
  const circles = graph.selectAll('circle')
    .data(data)

  // update current points
  circles
    .attr('cx', d => x(new Date(d.date)))
    .attr('cy', d => y(d.distance))

  // remove unwanted points
  circles.exit().remove()

  // add new points
  circles.enter()
    .append('circle')
    .attr('r', 4)
    .attr('fill', '#ccc')
    .attr('cx', d => x(new Date(d.date)))
    .attr('cy', d => y(d.distance))

  // data point hover effect
  graph.selectAll('circle')
    .on('mouseover', (d, i, n) => {
      d3.select(n[i])
        .transition().duration(100)
        .attr('r', 8)
        .attr('fill', '#fff')

      xDottedLine
        .attr('x1', 0)
        .attr('y1', y(d.distance))
        .attr('x2', x(new Date(d.date)))
        .attr('y2', y(d.distance))

      yDottedLine
        .attr('x1', x(new Date(d.date)))
        .attr('y1', y(d.distance))
        .attr('x2', x(new Date(d.date)))
        .attr('y2', graphHeight)

      dottedLineGroup
        .transition().duration(100)
        .style('opacity', 1)

    })
    .on('mouseleave', (d, i, n) => {
      d3.select(n[i])
        .transition().duration(100)
        .attr('r', 4)
        .attr('fill', '#ccc')

      dottedLineGroup
        .transition().duration(100)
        .style('opacity', 0)
    })


  // create axes
  const xAxis = d3.axisBottom(x)
    .ticks(4)
    .tickFormat(d3.timeFormat('%b %d'))

  const yAxis = d3.axisLeft(y)
    .ticks(4)
    .tickFormat(d => d + 'm')

  // call axes
  xAxisGroup.call(xAxis)
  yAxisGroup.call(yAxis)

  // rotate axis text
  xAxisGroup.selectAll('text')
    .attr('transform', 'rotate(-40)')
    .attr('text-anchor', 'end')
}

// data and firestore
let data = []

db.collection('activities').onSnapshot(res => {
  res.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id }

    switch (change.type) {
      case 'added':
        data.push(doc)
        break;
      case 'modified':
        const index = data.findIndex(item => item.id == doc.id)
        data[index] = doc
        break;
      case 'removed':
        data = data.filter(item => item.id !== doc.id)
        break;
      default:
        break;
    }

  })

  update(data)

})
