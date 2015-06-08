"use strict"
var levelup = require('level')
var http = require('http')
var fs = require('fs')
var config = require('./config')

var fetch = {}

fetch.getDate = function(ms) {
  var date = new Date(ms)
  return date.getFullYear() + ('0' + (date.getMonth()+1) ).substr(-2) + ('0' + date.getDate()).substr(-2)
}

fetch.station = 'KMESTARK2'

fetch.msDay = 86400000 //1 day in ms
fetch.now = Date.now() //date in ms
fetch.today = fetch.getDate(fetch.now) //YYYYMMDD
fetch.ghCounter = 0

fetch.getHistory = function(db, date, concat) {
  var weather

  //call to Wunderground API
  http.get('http://api.wunderground.com/api/'+config.token+'/history_'+date+'/q/pws:'+this.station+'.json', function(res) {
    console.log('CONNECTED')
    res.setEncoding('utf8')
    res.on('error', function(err) {
      console.error('STOP! '+err.message)
    })
    res.on('data', function(data) {
      weather += data
    })
    res.on('end', function() {
      console.log('cleaning up ' + date)
      //only pull weather observations
      weather = JSON.parse(weather.replace(/undefined\n/, '') ).history.observations
      //write JSON as string
      var wd = weather[0].date

      db.put(date, weather, {valueEncoding: 'json'}, function(err) {
        if (err) return console.error(err)
        console.log(date + ' written to DB.')
        //reduce counter
        fetch.ghCounter--
        //get and combine data
        if (concat) { 
          //make sure all data has been entered in DB
          var checkforPuts = setInterval(function() {
            if (fetch.ghCounter <= 0) {
              clearInterval(checkforPuts)
              console.log('concat')
              fetch.concatAll(db, concat[0], concat[1])
            }
          })
        }
      }) //end db.put

    }) //end res.on

  }) //end http.get
}

fetch.concatAll = function(db, options, range) {
  if (!options || !range) return console.error('Not enough args passed to fetch.concatAll()')
  //keys to include
  options = (options && options.length > 0) ? options : ['date', 'tempi', 'dewpti', 'wspdi', 'wgusti', 'pressurei', 'precip_ratei', 'preciptotali', 'UV']
  var result = [],
      rangeLen = range.length
  //read each db entry, push to result array, save to new file
  range.forEach(function(date) {
    db.get(date, {valueEncoding: 'json'}, function(err, value) {
      if (err) throw err
      //each JSON object for this date
      value.forEach(function(datum) {
        var d = {}

        options.forEach(function(key) {
          //add file data to result array
          d[key] = datum[key]
        })
        //TODO: regular JSON?
        result.push(d)
      })
      //reduce counter by 1
      rangeLen--
      if (rangeLen <= 0) {
        return fetch.data = result
      }
    })
  })

}

module.exports = fetch