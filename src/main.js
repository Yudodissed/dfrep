
const mineflayer = require('mineflayer')
const fs = require('fs')
const mysql = require('mysql')
const db = require('./db')
const { mainModule } = require('process')

//const restrictedCommands = ['quickrep', '+rep', '-rep'] //cmds that require registration   // disabled due to rework
const admin = ['Yudodiss']
//const whitelist = ['Yudodiss', 'Mr_Dumpling','Proxxa', 'The_Slimy_Knight'] //comment out to disable whitelist and enable blacklist
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

//------------------------ Executor ------------------------//
//Detects, formats, filters, then directs requests

const permissionLevels = ['unregistered', 'registered', 'trusted', 'admin']

let cmdMap = new Map()
let cooldowns = {}

fs.readdir('./src/cmds', function(err, files) {
  if (err) throw err
  files.forEach(function(filename) {
    let cmdOnFile = filename.split('.')[0]
    let cmd = require('./cmds/' + cmdOnFile + '.js')
    cmdMap.set(cmd.callsign, cmd)
  })
})

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
    let command = args[0]
    if (cmdMap.has(command)) {
      let playerPermission
      db.readData(sender).then(data => {
        if (typeof data === "object") playerPermission = 1
        if (!(playerPermission)) playerPermission = 0
        let cmd = cmdMap.get(command)
        if (cmd.permission <= playerPermission) {
          if (!(sender in cooldowns)) cooldowns[sender] = {}
          let cooldownAgeGoal
          if (command in cooldowns[sender]) {cooldownAgeGoal = BigInt(cooldowns[sender][command])} else cooldownAgeGoal = BigInt(0)
          if (bot.time.bigAge >= cooldownAgeGoal) {
            updateTimestamp()
            console.log(timestamp + `/${command} from ${sender} ["/${message}"]`)
            cmd.run(sender, args)
          } else {
            updateTimestamp()
            console.log(timestamp + 'Command failed due to cooldown by ' + sender + ' ["/' + message +'"]')
            respond(sender, '[❌]: This command is on cooldown!')
          }
        } else {
          updateTimestamp()
          console.log(timestamp + 'Invalid command from ' + sender + ' ["/' + message +'"]')
          respond(sender, `[❌]: You must be ${permissionLevels[cmd.permission]} to use that command!`)
        }
      })
    } else {
      updateTimestamp()
      console.log(timestamp + 'Invalid command from ' + sender + ' ["/' + message +'"]')
      respond(sender, '[❌]: Invalid command. Try /msg dfrep help for commands! (If this is your first time, try /msg dfrep info)')
    }
  }
})

function cmdCooldown(sender, command) {
  db.readData(sender).then(data => {
    if (typeof data === "object") playerPermission = 1
    if (!(playerPermission)) playerPermission = 0
    let cmd = cmdMap.get(command)
    let cooldownTicks = cmd.cooldown
    if (playerPermission >= 2) cooldownTicks = cmd.trusted_cooldown
    cooldowns[sender][command] = bot.time.bigAge + BigInt(cooldownTicks)
  })
}

//----------------------- Message Queue -----------------------//

let dic = {}
let queue = []
let queueRunning = false
let goalAge = bot.time.bigAge
let queueID = 0

const respond = async function (target, message) {
  updateTimestamp()
  console.log(timestamp + 'Message queued for ' + target)
  ++queueID
  dic[queueID] = [target, message]
  queue.push(queueID)
  if (queueRunning === false) {
    queueRunning = true
    while (queue.length > 0) {
      let id = queue[0]
      let queuedTrgt = dic[id][0]
      let queuedMsg = dic[id][1]
      await sleep(100)
      if (bot.time.bigAge >= goalAge) {
        removedTrgt = queue.shift()
        delete dic[id]
        bot.chat('/msg ' + queuedTrgt + ' ' + queuedMsg)
        updateTimestamp()
        console.log(timestamp + 'Message sent to ' +  queuedTrgt + ': "' + queuedMsg + '"')
        console.log('---')
        let totalLength = queuedTrgt.length + queuedMsg.length + 6  // 6 compensates for spaces and the /msg
        let score = (totalLength + 2) * 1.4                        // DF sets score by adding score + length + 20 but we remove score here
        let cooldownTime = Math.round(score / 25)                 // DF reduces score by 25 a second, so we calculate the amount of seconds
        let cooldownTicks = cooldownTime * 20                    // Convert the time in seconds to time in ticks
        goalAge = bot.time.bigAge + BigInt(cooldownTicks)       // Set the goal x ticks ahead in the future
      }                                                        // thank you df very cool
    }
  }
  queueRunning = false
}

exports.respond = respond;

//------------------------ Utility ------------------------//

let timestamp

const sleep = function (ms) {return new Promise(resolve => setTimeout(resolve, ms))}

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
exports.updateTimestamp = updateTimestamp;
exports.cmdCooldown = cmdCooldown;