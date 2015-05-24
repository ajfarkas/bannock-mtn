var http = require('http'),
    fs = require('fs'),
    command = process.argv[2],
    span = process.argv[3],
    startDate = process.argv[4]

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
var msDay = 86400000, //1 day in ms
    now = Date.now() //date in ms
    today = getDate(now) //YYYYMMDD

function getDate(ms) {
  var date = new Date(ms)
  return date.getFullYear() + ('0' + (date.getMonth()+1) ).substr(-2) + ('0' + date.getDate()).substr(-2)
}

function getHistory() {
  //chek if last in series
  span--
  if (span <= 0) clearInterval(runHistory)

  var weather
  //change date in ms to yesterday
  now -= msDay
  //convert now to YYYYMMDD format
  yesterday = getDate(now)
  //call to Wunderground API
  http.get('http://api.wunderground.com/api/9f206693050a1722/history_'+yesterday+'/q/pws:'+stations.pws[0]+'.json', function(res) {
    console.log('CONNECTED')
    res.setEncoding('utf8')
    res.on('error', function(err) {
      console.error('STOP! '+err.message)
    })
    res.on('data', function(data) {
      weather += data
    })
    res.on('end', function() {
      //only pull weather observations
      weather = JSON.parse(weather.replace(/undefined\n/, '') ).history.observations
      //write JSON as string
      fs.writeFile('json/'+yesterday+'_weather.json', JSON.stringify(weather), function(err) {
        if (err) throw err
        console.log('SAVED: '+yesterday+'_weather')
        if (span <= 0) console.log('all done ------------')
      })
    })
  })
}

function concatAll(select) {
  var result = []
  //keys to remove
  select = (select && select.length > 0) ? select : ['date', 'tempi', 'dewpti', 'wspdi', 'wgusti', 'pressurei', 'precip_ratei', 'preciptotali', 'UV']
  //get all filenames
  fs.readdir('json', function(err, files) {
    if (err) throw err
    //remove .DS_Store from array
    if (files.indexOf('.DS_Store') > -1) 
      files.splice(files.indexOf('.DS_Store'), 1)
    var filesLen = files.length
    //read each file, push to result array, save to new file
    files.forEach(function(file) {
      fs.readFile('json/'+file, 'utf8', function(err, data) {
        if (err) throw err
        //if range selected
        if (command == 'range') {
          data = JSON.parse(data)
          var datum = {
            date: data[0].date.year+'-'+data[0].date.mon+'-'+data[0].date.mday,
            min: data.reduce(function(a, b) { 
              if (a[process.argv[3]] < b[process.argv[3]]) return a
              else return b
            })[process.argv[3]],
            max: data.reduce(function(a, b) { 
              if (a[process.argv[3]] > b[process.argv[3]]) return a
              else return b
            })[process.argv[3]]
          }
          result.push(JSON.stringify(datum))
        }
        //else concat
        else {
          JSON.parse(data).forEach(function(datum) {
            var d = {}
    
            select.forEach(function(key) {
              //add file data to result array
              d[key] = datum[key]
            })
            
            result.push(JSON.stringify(d))
          })
        }
        // if (file == files[0]) console.log(JSON.parse(data))
        //reduce counter by 1
        filesLen--
        if (filesLen <= 0) {
          //write results to file named by range
          var fileName = files[0].slice(0, -5)+'-'+files[files.length - 1].slice(0, -5)+'.json'
          fs.writeFile('groups/'+fileName, '['+result+']', function(err) {
            if (err) throw err
            console.log('SUCCESS! Saved: '+fileName)
          })
        }
      })
    })
  })
}

//decide which function to run by node arguments
if (command == 'history' && span) {
  if (startDate) now -= msDay * startDate

  getHistory()
  var runHistory = setInterval(getHistory, 12000)
}
else if (command == 'concat') {
  var select = [],
      pLen = process.argv.length
  for (var i = 3; i < pLen; i++) {
    select.push(process.argv[i])
  }
  concatAll(select)
}
else if (command == 'range') {
  concatAll()
}




