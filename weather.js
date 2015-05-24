/* noaa token: BBRfPuqFZBJbdrhrhqENfLPeUnVgqGtv
** wunderground key: 9f206693050a1722
** shamp latlong: 44.732092, -70.035782
**
** NOAA Stations
** "COOP:172765; FARMINGTON, ME US"
** "COOP:174927; MADISON, ME US"
** "COOP:175736; NEW SHARON, ME US"
** "GHCND:US1MEFR0004; NEW SHARON 2.0 NW, ME US"
** "GHCND:US1MESM0001; MADISON 1.1 SSE, ME US"
** "GHCND:USC00172765; FARMINGTON, ME US"
** "GHCND:USC00174927; MADISON, ME US"
** "GHCND:USC00175736; NEW SHARON, ME US"
*/

var weather = []
var stations = {
  main: 'ME/Industry',
  pws: [
    'KMESTARK2',
    'MMERM1',
    'MNESM1',
    'KMEFARMI3',
    'KMENORRI4'
  ]
}
var s = {
  width: 200,
  height: 100,
  m: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 40
  }
}
s.plot = { w: s.width - s.m.left - s.m.right, h: s.height - s.m.top - s.m.bottom }
var line = {
  x: d3.time.scale().range([0, s.plot.w]),
  y: d3.scale.linear().range([s.plot.h, 0])
}
line.xAxis = d3.svg.axis().scale(line.x).orient('bottom').tickSize(2, 0)
line.yAxis = d3.svg.axis().scale(line.y).orient('left').tickSize(2, 0)
var formatDate = d3.time.format('%b-%d %H:%M')

var tempLine = d3.svg.line()
    .x(function(d) { return line.x(d.dateISO) })
    .y(function(d) { return line.y(d.temp) })

d3.json('node/groups/20150420-20150523_weather.json', function(err, data) {
  if (err) console.error(err)
  //account for local timezone offset in min, compared to GMT-4
  var offset = ( (new Date()).getTimezoneOffset() - 240) * -60000
    // console.log(offset, date)
  data.forEach(function(d, i) {
    //use pretty date to account for DST
    var date = new Date(d.date.pretty.replace('on ', ''))
    date = new Date(date - offset)

    weather[i] = {
      pretty: d.date.pretty,
      dateISO: date,
      temp: (d.tempi == '-9999') ? null : +d.tempi,
      gust: +d.wgusti,
      rain: +d.precip_ratei
    }
  })

  weather = weather.sort(function(a, b) {
    var ad = a.dateISO, bd = b.dateISO
    if (ad < bd) return 1
    else if (ad > bd) return -1
    else return 0
  })
  
  makeTempGraph(weather, '#temp')
})

function createSVG(hook, newClass) {
  var svg = d3.select(hook).append('svg')
    .attr('viewBox', '0 0 '+s.width+' '+s.height)
    .attr('width', '100%')
    .attr('height', '100%')
  svg.append('g')
    .attr('class', newClass || '')
    .attr('width', s.plot.w)
    .attr('height', s.plot.h)
    .attr('transform', 'translate('+s.m.left+','+s.m.top+')')
  return svg
}

function createAxes(svg) {
  // y-axis 
  var thisAxisY = svg.append('g')
    .attr('class', 'y axis')
    .call(line.yAxis)
  thisAxisY.selectAll('text')
    .attr('dx', 2)
  // x-axis
  var thisAxisX = svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,'+s.plot.h+')')
    .call(line.xAxis)
  thisAxisX.selectAll('text')
    .attr('transform', 'rotate(-90)')
    .attr('style', 'text-anchor: end')
    .attr('dy', '-.75em')
    .attr('dx', '-.75em')
}

//build temperature line graph
function makeTempGraph(weather, hook) {
    var tempMin = d3.min(weather, function(d) { return d.temp })
    line.x.domain(d3.extent(weather, function(d) { return d.dateISO }) )
    line.y.domain([(tempMin < 32) ? tempMin : 32, d3.max(weather, function(d) { return d.temp }) ])

    var tempSVG = createSVG(hook, 'temp')
    //add gradient for hot/cold colors
    var gradient = tempSVG.append('defs')
      .append('linearGradient')
        .attr('id', 'hotCold')
        .attr('gradientTransform', 'rotate(90)')
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#ff0000')
    gradient.append('stop').attr('offset', '50%').attr('stop-color', '#d2d2d2')
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#0000ff')
    var tempG = tempSVG.select('.temp')
    createAxes(tempG)
    //make line
    tempG.append('path')
      .datum(weather)
      .attr('class', 'line')
      .attr('d', tempLine)
  }

