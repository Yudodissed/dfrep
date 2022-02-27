const fs = require('fs')
const mysql = require('mysql')
const objectPath = require('object-path')

const main = require('../main')
require("./connectionHandler")

//------------------------- Read User Data ------------------------//

const read = function (player) {
  let sql = "SELECT user FROM maindb"
  return new Promise ((resolve, reject) => {
    con.query(sql, (error, results) => {
      if (error) {
        reject(error)
      }

      // Gets a list of all registered players
      results.forEach((element, i) => { let user = results[i]['user']; results[i] = user })

      // If the player is registered, read they got dang data
      if (results.includes(player)) {
        sql = "SELECT data FROM maindb WHERE user='"+player+"'"
        con.query(sql, (error, results) => {
          if (error) {
            reject(error)
          }

          // Format and resolve the data
          let data = JSON.parse(results[0]['data'])
          resolve(data)
        })
      } else {
        resolve(false)
      }
    })
  })
}

exports.read = read

//------------------------ Write User Data ------------------------//

// Modifying a rating also modifies karma. Input data should be
// an object, where the key is the path and the value is the
// data to be written.

const write = function(user, inputData) {
  read(user).then(data => {
    let sumBool

    // For each path, set the value there.
    Object.keys(inputData).forEach(function(key){
      objectPath.set(data, key, inputData[key])
      if (key.includes('reputation.ratings.')) {
        sumBool = true
      }
    })

    // Update the karma score
    if (sumBool) {
      data.reputation.ratings.karma = data.reputation.ratings.buildRating + 
                                      data.reputation.ratings.devRating + 
              /* hello there */       data.reputation.ratings.friendlyRating
    }

    // Format and push to database
    let stringyData = JSON.stringify(data)
    con.query("UPDATE maindb SET data = ? WHERE user = ?", [stringyData, user], (error, results) => {
      if (error) {
        return console.error(error.message)
      }
    })
  })
}

exports.write = write

//------------------------- Register User -------------------------//
// Refer to cmd.js /register

const register = function (user) {

  // Fetch data
  let starterData = fs.readFileSync('./base_data/template_data.json')
  let inboxData = fs.readFileSync('./base_data/template_inbox.json')
  let settingsData = fs.readFileSync('./base_data/template_settings.json')

  // Push to database
  let sql = `INSERT INTO maindb(user,data,inbox,settings) VALUES ('${user}','${starterData}','${inboxData}','${settingsData}')`
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

//-------------------------- Fetch Users --------------------------//

const fetchUsers = function () {
  return new Promise ((resolve, reject) => {

    // Fetch data
    sql = "SELECT user FROM maindb"
    con.query(sql, (error, results) => {
      if (error) {
        reject(error)
      }

      // Make a list of all users
      let output = []
      let i = 0
      for (let [key, value] of Object.entries(results)) {
        output[i] = value["user"]
        ++i
      }
      resolve(output)
    })
  })
}

exports.fetchUsers = fetchUsers