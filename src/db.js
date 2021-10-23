const mineflayer = require('mineflayer')
const fs = require('fs')
const {timeStamp} = require('console')
const mysql = require('mysql')
const objectPath = require('object-path')

const main = require('./main')
const cmd = require('./cmd')
const { connected } = require('process')

let db_login = {}
var connection

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

function handleDisconnect() {
  con = mysql.createConnection(db_login)
  con.connect(function(err) {
    if(err) {
      console.log('error when connecting to db:', err)
      setTimeout(handleDisconnect, 2000)
    }
  });
  con.on('error', function(err) {
    let timestamp = main.updateTimestamp()
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect()
    } else {
      throw err
    }
  });
}

//------------------------- Read User Data ------------------------//
// Sample usage:
// db.readData(args[1]).then(data => {
//   ...code here...
// })

const readData = function (player) {
  let state = false
  let sql = "SELECT user FROM maindb"
  return new Promise ((resolve, reject) => { //Thank you porx <3
    con.query(sql, (error, results) => {
      if (error) {
        reject(error)
      }
      //Gets a list of all registered players
      results=JSON.parse(JSON.stringify(results))
      results.forEach((element, i) => { let user = results[i]['user']; results[i] = user })
      if (results.includes(player)) {
        state = true
      } else {
        state = false
      }
      if (state === true) {
        sql = "SELECT data FROM maindb WHERE user='"+player+"'"
        con.query(sql, (error, results) => {
          if (error) {
            reject(error)
          }
          let data = JSON.parse(results[0]['data'])
          resolve(data)
        })
      } else {
        resolve(false)
      }
    })
  })
}

//------------------------ Write User Data ------------------------//
// parseBool should be true if newData is a number, and false if
// it's text. Note that modifying a rating also modifies karma.

const writeData = function (user, path, newData, parseBool) {
  if (parseBool === true) {
    newData = Number(newData)
  }
  readData(user).then(data => {
    objectPath.set(data, path, newData)
    if (path.includes('reputation.ratings.')) {
      data.reputation.ratings.karma = data.reputation.ratings.buildRating + data.reputation.ratings.devRating + data.reputation.ratings.friendlyRating
    }
    let stringyData = JSON.stringify(data)
    let sql = `UPDATE maindb SET data = '${stringyData}' WHERE user = "${user}"`
    con.query(sql, (error, results) => {
        if (error) {
          return console.error(error.message)
        }
    })
  })
}

//------------------------- Register User -------------------------//
// Refer to cmd.js /register

const register = function (user) {
  let starterData = fs.readFileSync('template_data.json')
  let sql = `INSERT INTO maindb(user,data) VALUES ('${user}','${starterData}')`
  return new Promise ((resolve, reject) => {
    con.query(sql, (error, results) => {
      if (error) {
        reject(error)
      }
      let output = true
      resolve(output)
    })
  })
}

exports.readData = readData;
exports.writeData = writeData;
exports.register = register;

handleDisconnect();