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
**
** wunderground CA station: KCAOAKLA44
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
    bottom: 25,
    left: 30
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

d3.json('node/groups/20150420-20150524_weather.json', function(err, data) {
  if (err) console.error(err)
  //account for local timezone offset in min, compared to GMT-4
  var offset = ( (new Date()).getTimezoneOffset() - 240) * -60000

  data.forEach(function(d, i) {
    //use pretty date to account for DST
    var date = new Date(d.date.pretty.replace('on ', ''))
    date = new Date(date - offset)

    weather[i] = {
      pretty: d.date.pretty,
      dateISO: date,
      temp: (d.tempi == '-9999') ? null : +d.tempi,
      gust: +d.wgusti || 0,
      rain: +d.precip_ratei || 0,
      humidity: relHumidity(d.tempi, d.dewpti, true)
    }
  })

  weather = weather.sort(function(a, b) {
    var ad = a.dateISO, bd = b.dateISO
    if (ad < bd) return 1
    else if (ad > bd) return -1
    else return 0
  })

  //find temperature high and low for each day
  var days = [],
      tempHigh = {},
      tempLow = {}
  var range = []
  weather.forEach(function(d) {
    var date = d.dateISO.getFullYear()+'-'+(d.dateISO.getMonth() + 1)+'-'+d.dateISO.getDate()
    //if date is not in array, initialize date
    if (days.indexOf(date) == -1) {
      days.push(date)
      tempHigh[date] = d.temp
      tempLow[date] = d.temp
    }
    else {
      if (d.temp > tempHigh[date])
        tempHigh[date] = d.temp
      else if (d.temp < tempLow[date])
        tempLow[date] = d.temp
    }
  })
  days.forEach(function(date) {
    range.push({
      dateISO: new Date(date),
      high: tempHigh[date],
      low: tempLow[date],
      humidity: d3.mean(weather, function(d) { 
       if(d.dateISO.getFullYear()+'-'+(d.dateISO.getMonth() + 1)+'-'+d.dateISO.getDate() == date)
        return d.humidity
      })
    })
  })
  
  svgDefs()
  makeLineGraph(range, '#temp', 'temp', 'high', true)
  makeLineGraph(range, '#temp', 'temp', 'low', true)
  // makeTempGraph(weather, '#temp', 'temp')
  makeLineGraph(range, '#humidity', 'rel-humidity', 'humidity', true)
})

function svgDefs() {
  var svg = d3.select('body').append('svg')
  
  var defs = svg.append('defs')

  var hotCold = defs.append('linearGradient')
    .attr('id', 'hotCold')
    .attr('gradientTransform', 'rotate(90)')
  hotCold.append('stop').attr('offset', '0%').attr('stop-color', '#ffac91')
  hotCold.append('stop').attr('offset', '60%').attr('stop-color', '#d2d2d2')
  hotCold.append('stop').attr('offset', '100%').attr('stop-color', '#52a0e1')
  
  var rain = defs.append('pattern')
    .attr('id', 'rain')
    .attr('x', 0).attr('y', 0)
    .attr('width', 4.0).attr('height', 6.8)
    .attr('patternUnits', 'userSpaceOnUse')
    // .attr('patternContentUnits', 'objectBoundingBox')
  rain.append('circle')
    .attr('cx', 2.0).attr('cy', 0).attr('r', 1.8)
  rain.append('circle')
    .attr('cx', 0).attr('cy', 3.4).attr('r', 1.8)
  rain.append('circle')
    .attr('cx', 4.0).attr('cy', 3.4).attr('r', 1.8)
  rain.append('circle')
    .attr('cx', 2.0).attr('cy', 6.8).attr('r', 1.8)

}

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
  svg.selectAll('.axis').remove()
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
function makeLineGraph(data, hook, newClass, accessor, area) {
  line.x.domain(d3.extent(data, function(d) { return d.dateISO }) )
  if (newClass == 'temp') {
    var tempMin = d3.min(weather, function(d) { return d.temp })
    line.y.domain([(tempMin < 32) ? tempMin : 32, d3.max(weather, function(d) { return d.temp }) ])
  }
  else
    line.y.domain([0, 100])

  var tempSVG = d3.select(hook).select('svg').node() ? d3.select(hook).select('svg') : createSVG(hook, newClass)
  //add gradient for hot/cold colors
  // if (!tempSVG.select('defs').node()) {
  //   var gradient = tempSVG.append('defs')
  //     .append('linearGradient')
  //       .attr('id', 'hotCold')
  //       .attr('gradientTransform', 'rotate(90)')
  //   gradient.append('stop').attr('offset', '0%').attr('stop-color', '#ffac91')
  //   gradient.append('stop').attr('offset', '60%').attr('stop-color', '#d2d2d2')
  //   gradient.append('stop').attr('offset', '100%').attr('stop-color', '#52a0e1')
  // }

  var tempG = tempSVG.select('.'+newClass)
  //make line
  tempG.append('path')
    .datum(data)
    .attr('class', accessor)
    .attr('d', area
      ? d3.svg.area()
        .x(function(d) { return line.x(d.dateISO) })
        .y0(line.y(line.y.domain()[0]) )
        .y1(function(d) { return line.y(d[accessor]) })
        .interpolate('step-after')
      : d3.svg.line()
        .x(function(d) { return line.x(d.dateISO) })
        .y(function(d) { return line.y(d[accessor]) })
        .interpolate('step-after')
    )
  //make axes
  createAxes(tempG)
}

function relHumidity(temp, dewpt, farenheit) {
  if (farenheit) {
    temp = (temp - 32) / 1.8
    dewpt = (dewpt - 32) / 1.8
  }
  return 100 * ( Math.exp((17.625*dewpt)/(243.04+dewpt)) / Math.exp((17.625*temp)/(243.04+temp)) )
}

//raindrop: <path class="drop" d="M20,40 L15,50 C15,54 18,55 20,55 C22,55 25,54 25,50 L20,40z"></path>
