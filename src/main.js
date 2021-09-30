
const mineflayer = require('mineflayer')
const fs = require('fs')
const {timeStamp} = require('console')
const cmd = require('./cmd')
const { report } = require('process')

const restrictedCommands = [
  'quickrep',
  '+rep',
  '-rep'
]

const whitelist = ['Yudodiss'] //comment out to disable whitelist and enable blacklist
const blacklist = ['GhostDuckyy']


let dic = {}
let queue = []
let dropHook = false
let queueRunning = false
let timestamp = null

//Fetches sensitive info and inits bot
let rawLogin = fs.readFileSync('src/login/login.json')
let loginJSON = JSON.parse(rawLogin)
let loginName = loginJSON['username']
let loginPass = loginJSON['password']
const bot = mineflayer.createBot({
  host: 'mcdiamondfire.com',
  username: loginName,
  password: loginPass,
  port: '25565',
  version: '1.16.5',
  auth: 'microsoft',
})

bot.on('login', () => {
  updateTimestamp()
  console.log(timestamp + 'Connected!')
})

bot.on('spawn', () => {
  cornerWalk()
})

//Moves dfrep to a corner because funny
async function cornerWalk() {
  bot.setControlState('forward', true)
  await sleep(700)
  bot.setControlState('left', true)
  await sleep(3000)
  bot.setControlState('forward', false)
  bot.setControlState('left', false)
  bot.look(75, 0, false)
  bot.setQuickBarSlot(2)
}

//----------------------- Monitoring -----------------------//

bot.on('error', error => {
  updateTimestamp()
  console.log(timestamp + error)
})

bot.on('kicked', kickreason => {
  updateTimestamp()
  console.log(timestamp + kickreason)
})

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
    // Filter
    if (typeof whitelist !== 'undefined') {
      if (!whitelist.includes(sender)) {
        updateTimestamp()
        console.log(timestamp + sender + ' attempted command. Is exclusiveUser on?')
        return
      }
    } else {
      if (blacklist.includes(sender)) {
        updateTimestamp()
        console.log(timestamp + sender + ' was blacklisted from using the bot.')
        return
      }
    }
    if (!fs.existsSync('playerdata/' + sender + '_data.json')) {
      if (restrictedCommands.includes(args[0])) {
        updateTimestamp()
        console.log(timestamp + sender + ' attempted registered user only command.')
        respond(sender, 'You must be registered to use that command.')
        return
      }
    }
    switch(args[0]) {
      case 'quickrep':
        cmd.quickrep(sender, args)
      break
      case 'register':
        cmd.register(sender)
      break
      case '+rep':
        cmd.plusRep(sender, args)
      break
      case '-rep':
        cmd.minusRep(sender, args)
      default:
        updateTimestamp()
        console.log(timestamp + 'Invalid command recieved from ' + sender)
        respond(sender, 'Invalid command. Try /msg dfrep help for help!')
      break
    }
  }
})

//------------------------ Functions ------------------------//

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
        console.log(timestamp + 'Message sent to ' +  queuedTrgt)
      } else console.log(timestamp + 'Dropped message for ' + queuedTrgt + '. Retrying in ~2.8 seconds.') //Idk why this doesn't send lol
      await sleep(2800) // For the future: Owen said message delay is related to message length?
    }
  }
  queueRunning = false
}

const updateTimestamp = function updateTimestamp() {
  let today = new Date();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  timestamp = '[' + time + ']: '
  return timestamp
}

exports.sleep = sleep;
exports.userData = userData;
exports.respond = respond;
exports.updateTimestamp = updateTimestamp;