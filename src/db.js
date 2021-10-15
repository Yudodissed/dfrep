const mineflayer = require('mineflayer')
const fs = require('fs')
const {timeStamp} = require('console')
const mysql = require('mysql')

const main = require('./main')
const cmd = require('./cmd')
const { connected } = require('process')

let db_login = {}

if (fs.existsSync('src/login/login.json')) {
  let rawLogin = fs.readFileSync('src/login/login.json')
  let loginJSON = JSON.parse(rawLogin)
  db_login = {
    host: loginJSON['sql']['host'],
    user: loginJSON['sql']['user'],
    password: loginJSON['sql']['pass'],
    database: 'heroku_44c48d0ecdeed08'
  }
} else {
  db_login = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: 'heroku_44c48d0ecdeed08'
  }
}

var con = mysql.createConnection(db_login)

con.on('error', function(err) {
  if(err.code === 'PROTOCOL_CONNECTION_LOST') {
    con = mysql.createConnection(db_login)
    let timestamp = main.updateTimestamp()
    console.log(timestamp + 'SQL refreshed.')
  }
})

//------------------------- Read User Data ------------------------//

const readData = function readData(player) {
  let state = false
  let sql = "SELECT user FROM maindb"
  con.query(sql, (error, results) => {
    if (error) {
      return console.error(error.message)
    }
    //Gets a list of all registered players
    results=JSON.parse(JSON.stringify(results))
    results.forEach((element, i) => { let user = results[i]['user']; results[i] = user })
    if (results.includes(player)) {
      console.log('User found!')
      state = true
    } else {
      console.log('Invalid User!')
      state = false
    }
    if (state === true) {
      console.log("State was true lol")
      sql = "SELECT data FROM maindb WHERE user='"+player+"'"
      con.query(sql, (error, results) => {
        if (error) {
          return console.error(error.message)
        }
        console.log(results)
      })
    }
  })
}

//------------------------ Write User Data ------------------------//

const writeData = function writeData(user, data) {
  con.connect(function(err) {
    if (err) throw err;
    let timestamp = main.updateTimestamp()
    console.log(timestamp + 'Connected to SQL database for writeData call')
  })
  con.end()
}

exports.readData = readData;
exports.writeData = writeData;