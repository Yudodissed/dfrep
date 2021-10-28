const mineflayer = require('mineflayer')
const fs = require('fs')
const {timeStamp} = require('console')
const { report, connected } = require('process')
const mysql = require('mysql')
const cmd = require('./cmd')
const db = require('./db')

const restrictedCommands = ['quickrep', '+rep', '-rep'] //cmds that require registration
const admin = ['Yudodiss']
const whitelist = ['Yudodiss', 'Mr_Dumpling','Proxxa'] //comment out to disable whitelist and enable blacklist
const blacklist = []

let mcUser
let mcPass

if (fs.existsSync('src/login/login.json')) {
  let rawLogin = fs.readFileSync('src/login/login.json')
  let loginJSON = JSON.parse(rawLogin)
  mcUser = loginJSON['mc']['username'] 
  mcPass = loginJSON['mc']['password']
} else {
  mcUser = process.env.MC_USER
  mcPass = process.env.MC_PASS
}

const bot = mineflayer.createBot({
  host: 'mcdiamondfire.com',
  username: mcUser,
  password: mcPass,
  port: '25565',
  version: '1.16.5',
  auth: 'microsoft',
})

//----------------------- Monitoring -----------------------//

bot.on('login', () => {updateTimestamp(); console.log(timestamp + 'Connected!')})
bot.on('spawn', () => {cornerWalk()})
bot.on('error', error => {updateTimestamp(); console.log(timestamp + error)})
bot.on('kicked', kickreason => {updateTimestamp(); console.log(timestamp + kickreason)})

//Detects dropped messages for the response queue
bot.on('messagestr', (commonChat) => {
  if (true === commonChat.includes('Please wait before sending your next command.')) {
    if (false === commonChat.includes('You')) {
      dropHook = true
    } else dropHook = false
  } else dropHook = false
})

//------------------------ Commands ------------------------//

//Detects, formats, filters, then directs requests
bot.on('chat', (username, message, translate, jsonMsg) => {
  if (username === bot.username) return
  if (username === 'You') {
    let sender = jsonMsg['extra'][1]['text']
    let args = message.split(' ')
    if (typeof whitelist !== 'undefined') {
      if (!whitelist.includes(sender)) {
        updateTimestamp()
        console.log(timestamp + 'Blocked command from ' + sender + ' ["/' + message +'"]')
        return
      }
    } else {
      if (blacklist.includes(sender)) {
        updateTimestamp()
        console.log(timestamp + 'Blocked command from ' + sender + ' ["/' + message +'"]')
        return
      }
    }
    db.readData(sender).then(data => {
      if (!(restrictedCommands.includes(args[0]))) {
        data = true
      }
      if (data !== false) {
        updateTimestamp()
        switch(args[0]) {
          case 'quickrep':
            console.log(timestamp + '/quickrep from ' + sender + ' ["/' + message +'"]')
            cmd.quickrep(sender, args[1])
          break
          case 'register':
            console.log(timestamp + '/register from ' + sender + ' ["/' + message +'"]')
            cmd.register(sender)
          break
          case '+rep':
            console.log(timestamp + '+rep from ' + sender + ' ["/' + message +'"]')
            cmd.plusRep(sender, args)
          break
          case '-rep':
            console.log(timestamp + '-rep from ' + sender + ' ["/' + message +'"]')
            cmd.minusRep(sender, args)
          break
          case 'unrep':
            console.log(timestamp + 'unrep from ' + sender + ' ["/' + message +'"]')
            cmd.unrep(sender, args[1])
          break
          /* For future debug use
          case 'writesql':
            db.writeData(args[1], args[2], args[3], args[4])
          break
          */
          default:
            console.log(timestamp + 'Invalid command from ' + sender + ' ["/' + message +'"]')
            respond(sender, 'Invalid command. Try /msg dfrep help for help!')
          break
        }
      } else {
        updateTimestamp()
        console.log(timestamp + sender + ' attempted registered user only command.')
        respond(sender, 'You must be registered to use that command.')
        return
      }
    })
  }
})

//------------------------ Functions ------------------------//

let dic = {}
let queue = []
let dropHook = false
let queueRunning = false
let timestamp

const sleep = function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const userData = function userData(user) {
  let data = fs.readFileSync('playerdata/' + user + '_data.json');
  let parsedJSON = JSON.parse(data)
  return parsedJSON
}

//Queues up responses, and operates every ~3 seconds.
const respond = async function respond(target, message) {
  updateTimestamp()
  console.log(timestamp + 'Message queued for ' + target)
  dic[target] = message
  queue.push(target)
  if (queueRunning === false) {
    queueRunning = true
    while (queue.length > 0) {
      let queuedTrgt = queue[0]
      let queuedMsg = dic[queuedTrgt]
      if (queuedMsg !== undefined) {
        bot.chat('/msg ' + queuedTrgt + ' ' + queuedMsg)
      } else {
        updateTimestamp()
        console.log(timestamp + 'Undefined response for ' + queuedTrgt)
      }
      await sleep(200)
      if (dropHook === false) {
        removedTrgt = queue.shift()
        delete dic[removedTrgt]
        updateTimestamp()
        console.log(timestamp + 'Message sent to ' +  queuedTrgt + ': "' + queuedMsg + '"')
        console.log('---')
      } else console.log(timestamp + 'Dropped message for ' + queuedTrgt + '. Retrying in ~2.8 seconds.') //Idk why this doesn't send lol
      await sleep(2800) // For the future: Owen said message delay is related to message length?
    }
  }
  queueRunning = false
}

const updateTimestamp = function () {
  let today = new Date();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  timestamp = '[' + time + ']: '
  return timestamp
}

//Moves dfrep to a corner because funny
async function cornerWalk() {
  bot.setControlState('forward', true)
  await sleep(600)
  bot.setControlState('left', true)
  await sleep(3000)
  bot.setControlState('forward', false)
  bot.setControlState('left', false)
  bot.look(75, 0, false)
  bot.setQuickBarSlot(2)
}

exports.sleep = sleep;
exports.userData = userData;
exports.respond = respond;
exports.updateTimestamp = updateTimestamp;