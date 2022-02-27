const fs = require('fs')
const mysql = require('mysql')
const objectPath = require('object-path')

const main = require('../main')
require("./connectionHandler")

//------------------------- Write Letter -------------------------//

const writeLetter = function (sender, victim, message, level) {

  // Get the raw data from the database
  let sql = "SELECT inbox FROM maindb WHERE user='" + victim + "'"
  return new Promise ((resolve, reject) => {
    con.query(sql, (error, results) => {
      if (error) {
        return error
      }

      // Format the data to get the total amount of letters and check if theres room
      let data = JSON.parse(results[0]['inbox'])
      combinedData = data["important"].concat(data["unread"].concat(data["read"]))
      if (Object.keys(combinedData).length < 100) {

        // Set the new data
        data[level].push({"sender": sender, "message": message,})

        // Format and push the new data
        let stringyData = JSON.stringify(data)
        con.query("UPDATE maindb SET inbox = ? WHERE user = ?", [stringyData, victim], (error, results) => {
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

const burnLetter = function (sender, index) {

  return new Promise ((resolve, reject) => {
    readInbox(sender).then(data => {

      // Find what array and where in that array to remove
      let algoIndex = index
      let algoResult
      if (algoIndex > data["important"].length) {
        algoIndex = algoIndex - data["important"].length
        if (algoIndex > data["unread"].length) {
          algoIndex = algoIndex - data["unread"].length
          if (algoIndex > data["read"].length) {
            algoIndex = algoIndex - data["read"].length
          } else {algoResult = "read"}
        } else {algoResult = "unread"}
      } else {algoResult = "important"}

      // Apply the results then push to database
      data[algoResult].splice(--algoIndex, 1)
      let stringyData = JSON.stringify(data)
      con.query("UPDATE maindb SET inbox = ? WHERE user = ?", [stringyData, sender], (error, results) => {
        if (error) {
          return console.error(error.message)
        }
        resolve(true)
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