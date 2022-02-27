
const main = require('../main')

const fs = require('fs')

let cmdMap = new Map()

fs.readdir('./src/cmds', function(err, files) {
  if (err) throw err
  files.forEach(function(filename) {
    let cmdOnFile = filename.split('.')[0]
    let cmd = require('./' + cmdOnFile + '.js')
    cmdMap.set(cmd.callsign, cmd)
  })
})

module.exports = {
  
  callsign: "help",
  syntax: "/help [command]",
  description: "Lists all commands. If argument is given, provides information on command.",
  permission: 0, // Anyone can run
  cooldown: 0,
  trusted_cooldown: 0,

  run: function (sender, args) {

    // If the command has an argument, get the info for it
    if (args.length >= 2) {
      let command = args[1]
      if (cmdMap.has(command)) {

        // Get the info then log and respond
        let cmd = cmdMap.get(command)
        let timestamp = main.updateTimestamp()
        console.log(timestamp + '/help used to list commands for ' + sender)
        main.respond(sender, `[ℹ]: ${cmd.syntax} | Info: ${cmd.description}`)
      
      // That isn't a command, silly!
      } else {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + "Invalid /help command from " + sender)
        main.respond(sender, "[❌]: That's not a command!")
      }

    // If the command has no argument, just list all commands
    } else {
      let commandList = Array.from(cmdMap.keys())
      commands = commandList.join(", ")
      let timestamp = main.updateTimestamp()
      console.log(timestamp + '/help used to list commands for ' + sender)
      main.respond(sender, `[ℹ]: Use /help [command] for more. | All commands: ${commands}`)
    }
  }
}