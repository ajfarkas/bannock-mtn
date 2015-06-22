/* shamp latlong: 44.732092, -70.035782
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
//config
var s = {
  width: 200,
  height: 140,
  m: {
    top: 20,
    right: 10,
    bottom: 30,
    left: 20
  }
}
s.plot = { w: s.width - s.m.left - s.m.right, h: s.height - s.m.top - s.m.bottom }
//x-axis is always time, y is linear scale
var line = {
  x: d3.time.scale().range([0, s.plot.w]),
  y: d3.scale.linear().range([s.plot.h, 0])
}
line.xAxis = d3.svg.axis().scale(line.x).orient('bottom').tickSize(2, 0)
line.yAxis = d3.svg.axis().scale(line.y).orient('left').tickSize(2, 0)

// var formatDate = d3.time.format('%b-%d %H:%M')
//call weather data
d3.json('bannock_weather.json', function(err, data) {
  if (err) console.error(err)
console.log(data[0])  
  //account for local timezone offset in min, compared to GMT-4
  var offset = ( (new Date()).getTimezoneOffset() - 240) * -60000

  data.forEach(function(d, i) {
    //use pretty date to account for DST
    var newPretty = d.date.pretty.replace(/(.*)\son\s(.*)/, '$2 $1')
    var date = new Date(newPretty)
    date = new Date(date - offset)
    //add data to global var
    weather[i] = {
      pretty: d.date.pretty,
      dateISO: date,
      temp: (d.tempi == '-9999') ? null : +d.tempi,
      gust: +d.wgusti || 0,
      rain: +d.precip_ratei || 0,
      humidity: relHumidity(d.tempi, d.dewpti, true)
    }
  })
  //sort weather data by date
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
  weather.range = []
  weather.forEach(function(d) {
    var date = formatDate(d.dateISO)
    //if date is not in array, initialize date
    if (days.indexOf(date) == -1) {
      days.push(date)
      tempHigh[date] = d.temp
      tempLow[date] = d.temp
    }
    //add to tempHigh if new high, add to tempLow if new low
    else {
      if (d.temp > tempHigh[date])
        tempHigh[date] = d.temp
      else if (d.temp < tempLow[date])
        tempLow[date] = d.temp
    }
  })
  //add range info to array
  days.forEach(function(date) {
    weather.range.push({
      dateISO: new Date(date),
      high: tempHigh[date],
      low: tempLow[date],
      humidity: d3.mean(weather, function(d) { 
       if(formatDate(d.dateISO) == date)
        return d.humidity
      })
    })
  })
  //create svg definitions once for access by all SVG's
  svgDefs()
  //make temperature range graph (2 area graphs)
  makeLineGraph(weather.range, '.jacket-graph', 'temp', 'low', 'clipping')
  makeLineGraph(weather.range, '.jacket-graph', 'temp', 'high', 'low')
  //make humidity graph (area)
  makeLineGraph(weather.range, '.rain-graph', 'rel-humidity', 'humidity', true)

  var question = d3.select('select[name=mission]').node()
  findAnswer(question.value)
})

d3.select('select[name=mission]').on('change', function() {
  findAnswer(this.value)
})

//create SVG definitions
function svgDefs() {
  var svg = d3.select('body').append('svg')
  
  var defs = svg.append('defs')
  //linear gradient for use in temperature range graph
  var hotCold = defs.append('linearGradient')
    .attr('id', 'hotCold')
    .attr('gradientTransform', 'rotate(90)')
  hotCold.append('stop').attr('offset', '0%').attr('stop-color', '#ffac91')
  hotCold.append('stop').attr('offset', '60%').attr('stop-color', '#d2d2d2')
  hotCold.append('stop').attr('offset', '100%').attr('stop-color', '#52a0e1')
  //pattern for use in humidity graph
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

//make a new, all-purpose SVG
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

//make axis for a given SVG
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

//build line graph (option to make are graph)
/* data: data to make graph from
** hook: element to insert SVG into
** newClass: name of class to add to SVG <g>
** accessor: how to access specific data from data var
** area: whether to make as area graph (defaults to line graph)
*/
function makeLineGraph(data, hook, newClass, accessor, area) {
  line.x.domain(d3.extent(data, function(d) { return d.dateISO }) )
  if (newClass == 'temp') {
    var tempMin = d3.min(weather, function(d) { return d.temp })
    line.y.domain([(tempMin < 32) ? tempMin : 32, d3.max(weather, function(d) { return d.temp }) ])
  }
  else
    line.y.domain([0, 100])
  //select SVG
  var tempSVG = d3.select(hook).select('svg').node() ? d3.select(hook).select('svg') : createSVG(hook, newClass)
  
  //select <g> in SVG or clipping path
  var tempG = (area == 'clipping')
    ? tempSVG.select('.'+newClass).append('clipPath')
        .attr('id', accessor)
    : tempSVG.select('.'+newClass)
  
  //make line
  tempG.append('path')
    .datum(data)
    .attr('class', accessor)
    //add clipping, if appropriate
    .attr('clip-path', (typeof(area) == 'string' && area != 'clipping')
      ? 'url(#'+area+')'
      : ''
    )
    //make area or line graph
    .attr('d', area
      ? d3.svg.area()
        .x(function(d) { return line.x(d.dateISO) })
        .y0( (area == 'clipping')
          ? line.y(line.y.domain()[1])
          : line.y(line.y.domain()[0])
        )
        .y1(function(d) { 
          return line.y(d[accessor])//(area == 'clipping')
            // ? d3.scale.linear().range([0, s.plot.h])(d[accessor])
            // : line.y(d[accessor]) 
        })
        .interpolate('step-after')
      : d3.svg.line()
        .x(function(d) { return line.x(d.dateISO) })
        .y(function(d) { return line.y(d[accessor]) })
        .interpolate('step-after')
    )
  //make axes
  createAxes(tempG)
}

//calc relative humidity
function relHumidity(temp, dewpt, farenheit) {
  if (farenheit) {
    temp = (temp - 32) / 1.8
    dewpt = (dewpt - 32) / 1.8
  }
  return 100 * ( Math.exp((17.625*dewpt)/(243.04+dewpt)) / Math.exp((17.625*temp)/(243.04+temp)) )
}

//answer dropdown input question
function findAnswer(value) {
  hideOthers(value)
  var node = d3.select('.'+value+'-text')
  //if there is a reponse
  if (node.node() && node.html().length === 0) {
    //check which question is asked
    if (value == 'jacket') {
      var wkAvgHigh = d3.mean(weather.range, function(d, i){ if(i < 7)return d.high }),
          wkAvgLow = d3.mean(weather.range, function(d, i){ if(i < 7)return d.low })

      var prime = wkAvgLow >= 65 
        ? 'No'
        : wkAvgLow > 50 
          ? 'Maybe a Sweatshirt'
          : 'Yes'
      var second = wkAvgLow >= 60 
        ? false 
        : wkAvgLow > 45 
          ? 'and consider bringing at least one dog'
          : 'and consider bringing at least two dogs for warmth'
    }
    else if (value == 'rain') {
      var wkAvgHumid = d3.mean(weather.range, function(d, i) { if(i < 7)return d.humidity })

      var prime = wkAvgHumid > 70
        ? 'Yes'
        : 'Not Likely'
      var second = wkAvgHumid > 70
        ? 'better safe than sorry'
        : false
    }
    else if (value == 'towel') {
      var wkAvgHigh = d3.mean(weather.range, function(d, i){ if(i < 7)return d.high }),
          wkAvgHumid = d3.mean(weather.range, function(d, i) { if(i < 7)return d.humidity })

      var prime = 'All hoopy froods bring their towels'
      var second = wkAvgHigh > 70
        ? wkAvgHumid < 70
          ? "and there's a good chance of swimmin' weather"
          : "you might need it for these dog days of summer"
        : wkAvgHumid < 70
          ? "the ground is pretty dirty, after all"
          : "you could catch a cold if you don't keep dry"
    }
    return fillAnswer(node, prime, second)
  }
  //show selected response, hide others
  function hideOthers(selected) {
    d3.selectAll('.response').each(function() {
      var res = d3.select(this)
      res.classed('hidden', function() {
        return !res.classed(selected)
      })

    })
  }
}
//write answer to document
function fillAnswer(container, response, secondary) {
  //answer primary question
  container.append('p')
    .attr('class', 'response-text')
    .text(response+'.')
  //add additional info
  if (secondary) {
    container.append('p')
      .attr('class', 'response-more')
      .text(secondary+'.')
  }
}

function formatDate(date) {
  var month = ('0'+((date.getMonth() + 1)) ).substr(-2, 2)
  var day = ('0'+date.getDate() ).substr(-2, 2)
  return date.getFullYear()+'-'+month+'-'+day
}


//raindrop: <path class="drop" d="M20,40 L15,50 C15,54 18,55 20,55 C22,55 25,54 25,50 L20,40z"></path>
