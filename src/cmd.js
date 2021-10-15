
const mineflayer = require('mineflayer')
const fs = require('fs')
const { timeStamp } = require('console')

const main = require('./main')
const db = require('./db')

//------------------------ /quickrep ------------------------//
//Quickly gives an overview of a players data.

const quickrep = function quickrep(sender, args) {
    let arg1 = args[1]
    if (fs.existsSync('playerdata/' + arg1 + '_data.json')) {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + '/quickrep recieved from ' + sender)
        let data = fs.readFileSync('playerdata/' + arg1 + '_data.json');
        let fullData = JSON.parse(data)
        let karma = fullData['reputation']['ratings']['karma']
        let awards = fullData['reputation']['awards']
        let awardCount = awards.length
        let reportCount = fullData['reputation']['reports']['scamReports']  +  fullData['reputation']['reports']['greifReports']
        main.respond(sender, args[1] + ': | ' + karma + ' Karma | ' + awardCount + ' Awards | ' + reportCount + ' Reports')
    } else {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + 'Invalid argument recieved from ' + sender)
        main.respond(sender, 'Invalid user. Is that player registered? Do /msg dfrep help for more.')
    }
}

exports.quickrep = quickrep;

//------------------------ /register ------------------------//
// Creates a players data file.

const register = function register(sender) {
    if (!fs.existsSync('playerdata/' + sender + '_data.json')) {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + '/register recieved from ' + sender)
        let rawTemplate = fs.readFileSync('playerdata/template/template_data.json')
        let data = JSON.parse(rawTemplate)
        let today = new Date();
        data.statistics.dateJoined = today.getMonth() + "/" + today.getDate() + "/" + today.getFullYear();
        let finalData = JSON.stringify(data, null, 4)
        fs.writeFile('playerdata/' + sender + '_data.json', finalData, function (err) {
            if (err) throw err
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'File created for ' + sender)
            main.respond(sender, "You've been registered! Do /msg dfrep help to see what you can do next!")
        })
    } else {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + 'Invalid argument recieved from ' + sender)
        main.respond(sender, 'You already seem to be registered.')

    }
}

exports.register = register;

//------------------------ /+rep ------------------------//
// Adds a rep.

//Heres something to work on: make it so player up or down reps are tracked on reciever data
const plusRep = function plusrep(sender, args) {
    let repType
    let reciever = args[1]
    if (args.length >= 3) {
        if ((args[2] === 'build') || (args[2] === 'dev')) {
            type = args[2]
            repType = type + 'Rating'
        } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'Invalid argument recieved from ' + sender)
            main.respond(sender, 'Invalid type. Do /msg dfrep help for more.')
            return
        }
    } else repType = 'friendlyRating'
    let timestamp = main.updateTimestamp()
    console.log(timestamp + '/+rep for ' + reciever + ' recieved from ' + sender)
    if (fs.existsSync('playerdata/' + reciever + '_data.json')) {
        let rawTemplate = fs.readFileSync('playerdata/' + reciever + '_data.json')
        let data = JSON.parse(rawTemplate)
        let i = data.reputation.ratings[repType]
        data.reputation.ratings[repType] = i + 1
        data.reputation.ratings.karma = data.reputation.ratings.buildRating + data.reputation.ratings.devRating + data.reputation.ratings.friendlyRating //i'm sorry
        let finalData = JSON.stringify(data, null, 4)
        fs.writeFile('playerdata/' + reciever + '_data.json', finalData, function (err) {
            if (err) throw err
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'File updated for ' + reciever)
            main.respond(reciever, "+Rep given!")
        })
    } else {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + 'Invalid argument recieved from ' + sender)
        main.respond(sender, 'Invalid user. Is that player registered? Do /msg dfrep help for more.')
    }
}

exports.plusRep = plusRep;

//------------------------ /-rep ------------------------//
// Subtracts a rep.

const minusRep = function minusrep(sender, args) {

}

exports.minusRep = minusRep;