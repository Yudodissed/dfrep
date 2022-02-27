
const userdata = require('./userdata')
require("./connectionHandler")

//------------------------- Read Settings -------------------------//

const read = function (player) {
  return new Promise ((resolve, reject) => {
    userdata.read(player).then(data => {
      if (data) {
        sql = "SELECT settings FROM maindb WHERE user='" + player + "'"
        con.query(sql, (error, results) => {
          if (error) {
            reject(error)
          }
          let data = JSON.parse(results[0]['settings'])
          resolve(data)
        })
      }
    })
  })
}

exports.read = read

//------------------------ Toggle Settings ------------------------//

// inputData should be a list of the settings to toggle.
const toggle = function(user, inputData) {
  return new Promise ((resolve, reject) => {
    
    // Get the data and toggle each
    read(user).then(data => {
      inputData.forEach((key) => {
        data[key] = !data[key]
      })

      // Format and push to database
      let stringyData = JSON.stringify(data)
      con.query("UPDATE maindb SET settings = ? WHERE user = ?", [stringyData, user], (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(data)
      })
    })
  })
}

exports.toggle = toggle