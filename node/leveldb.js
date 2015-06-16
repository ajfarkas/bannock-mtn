var config = require('./config')
var levelup = require('level-browserify')
var fetch = require('./fetchInfo')

var db = levelup(config.db)
var dbExport = {}

var dataOptions = ['date', 'tempi', 'dewpti', 'wspdi', 'precip_ratei']

dbExport.delete = function(range) {
  range.forEach(function(date) {
    db.del(date, function(err) { 
      if (err) console.error(err) 
      console.log(date + ' has been deleted.')
    })
  })
}

//ensure last 30 days are in DB
dbExport.checkForUpdate = function() {
  var updated = false,
      date = new Date(),
      yesterday = fetch.getDate(date - fetch.msDay),
      dMinus30 = fetch.getDate(date - fetch.msDay*30),
      daysOnRecord = []
      daysRequested = []
  //make array of last 30 dates
  for (var i = date - fetch.msDay; i >= date - fetch.msDay*30; i -= fetch.msDay) {
    daysRequested.push(fetch.getDate(i) )
  }
  console.log(yesterday)
  //find entries from last month
  db.createKeyStream({gte: dMinus30, lte: yesterday+'\xff'})
    .on('error', function(err) { console.error(err) })
    .on('data', function(data) {
      //make array of recent days in DB
      daysOnRecord.push(data)
    })
    .on('end', function() {
      var timeout = 0
      if (daysRequested.length > 0) {
        var missingDays = []

        //make array of missing data
        daysRequested.forEach(function(day) {
          if (daysOnRecord.indexOf(day) == -1)
            missingDays.push(day)
        })

        var mdLen = missingDays.length
        if (mdLen > 0) {
          fetch.ghCounter = mdLen
          console.log(missingDays)
          //call missing data from API
          missingDays.forEach(function(day, i) {
            var concat = (i == mdLen -1) ? [dataOptions, daysRequested] : false
            
            //call API with delay if > 9 items
            setTimeout(function() {
              fetch.getHistory(db, day, concat)
            }, timeout)
            timeout += (mdLen > 9) ? 8000 : 10
          })
        } 
        else fetch.concatAll(db, dataOptions, daysRequested)
      }      
    })

}

module.exports = dbExport