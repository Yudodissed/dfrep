
const fs = require('fs')
const mysql = require('mysql')

const main = require('../main')

// See main.js... If there is a login.json, then use the details from there, otherwise get details from hosting service
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

module.exports = {

  connectionHandler: function() {
    con = mysql.createConnection(db_login)
    con.connect(function(err) {
      if(err) {
        setTimeout(module.exports.connectionHandler, 2000)
      }
    });
    con.on('error', function(err) {
      if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        module.exports.connectionHandler()
      } else {
        throw err
      }
    });
  }

  /*----Handle Haiku----//
      handleDisconnect
  important yet forgotten
    this haiku for you
  //------By midge------*/
}

module.exports.connectionHandler()