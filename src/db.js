const mineflayer = require('mineflayer')
const fs = require('fs')
const mysql = require('mysql')
const objectPath = require('object-path')

const main = require('./main')

let db_login = {}

if (fs.existsSync('src/login/login.json')) {
  let rawLogin = fs.readFileSync('src/login/login.json')
  let loginJSON = JSON.parse(rawLogin)
  db_login = {
    host: loginJSON['sql']['host'],
    user: loginJSON['sql']['user'],
    password: loginJSON['sql']['pass'],
    database: loginJSON['sql']['database']
  }
} else {
  db_login = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DATABASE
  }
}

function handleDisconnect() {
  con = mysql.createConnection(db_login)
  con.connect(function(err) {
    if(err) {
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

exports.readData = readData

//------------------------ Write User Data ------------------------//
// Modifying a rating also modifies karma. Input data should be
// an object, where the key is the path and the value is the
// data to be written.

const writeData = function(user, inputData) {
  readData(user).then(data => {
    let sumBool
    Object.keys(inputData).forEach(function(key){ // key is path
      objectPath.set(data, key, inputData[key])
      if (key.includes('reputation.ratings.')) {
        sumBool = true
      }
    })
    if (sumBool) {
      data.reputation.ratings.karma = data.reputation.ratings.buildRating + 
                                        data.reputation.ratings.devRating + 
                                        data.reputation.ratings.friendlyRating
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

exports.writeData = writeData

//------------------------- Register User -------------------------//
// Refer to cmd.js /register

const register = function (user) {
  let starterData = fs.readFileSync('template_data.json')
  let sql = `INSERT INTO maindb(user,data,inbox) VALUES ('${user}','${starterData}','{"msgID":0}')`
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

exports.register = register

//------------------------- Write Letter -------------------------//
// Puts a message in a users inbox column object. Uses
// unique IDs from their object.

const writeLetter = function (sender, victim, message) {
  let sql = "SELECT inbox FROM maindb WHERE user='" + victim + "'"
  return new Promise ((resolve, reject) => {
    con.query(sql, (error, results) => {
      if (error) {
        return error
      }
      let data = JSON.parse(results[0]['inbox'])
      if (Object.keys(data).length < 100) {
        let msgID = ++data["msgID"]
        data[msgID] = {"sender": sender, "message": message,}
        let stringyData = JSON.stringify(data)
        let sql = `UPDATE maindb SET inbox = '${stringyData}' WHERE user = "${victim}"`
        con.query(sql, (error, results) => {
          if (error) {
            return console.error(error.message)
          }
          resolve(true)
        })
      } else {
        resolve(false)
      }
    })
  })
}

exports.writeLetter = writeLetter

//------------------------- Burn Letter -------------------------//
// Almost identical to writeLetter. In fact, I copy-pasted it.
// Just like I copy-pasted writeData to make writeLetter.

const burnLetter = function (sender, index) {
  let sql = "SELECT inbox FROM maindb WHERE user='" + sender + "'"
  return new Promise ((resolve, reject) => {
    con.query(sql, (error, results) => {
      if (error) {
        return error
      }
      readInbox(sender).then(data => {
        console.log("index:")
        console.log(index)
        let indexID = Object.keys(data)[--index]
        if (indexID === "msgID") {
          resolve(false)
        } else {
          delete data[indexID]
          let stringyData = JSON.stringify(data)
          let sql = `UPDATE maindb SET inbox = '${stringyData}' WHERE user = "${sender}"`
          con.query(sql, (error, results) => {
            if (error) {
              return console.error(error.message)
            }
            resolve(true)
          })
        }
      })
    })
  })
}

exports.burnLetter = burnLetter

//-------------------------- Read Inbox --------------------------//

const readInbox = function (player) {
  return new Promise ((resolve, reject) => {
    sql = "SELECT inbox FROM maindb WHERE user='" + player + "'"
    con.query(sql, (error, results) => {
      if (error) {
        reject(error)
      }
      let data = JSON.parse(results[0]['inbox'])
      resolve(data)
    })
  })
}

exports.readInbox = readInbox

/*----Handle Haiku----//
    handleDisconnect
 important yet forgotten
   this haiku for you
//------By midge------*/

handleDisconnect()