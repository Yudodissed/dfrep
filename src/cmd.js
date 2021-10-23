
const mineflayer = require('mineflayer')
const fs = require('fs')
const { timeStamp } = require('console')

const main = require('./main')
const db = require('./db')

//------------------------ /quickrep ------------------------//
//Quickly gives an overview of a players data.

const quickrep = function (sender, victim) {
    db.readData(victim).then(data => {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + '/quickrep for ' + victim + ' recieved from ' + sender)
        if (data !== false) {
            let awardList = data.reputation.awards
            let awardCount = awardList.length
            let reportList1 = data.reputation.reports.greifReports
            let reportList2 = data.reputation.reports.scamReports
            let reportCount = reportList1.length + reportList2.length
            main.respond(sender, `${victim}: | ${data.reputation.ratings.karma} Karma | ${awardCount} Awards | ${reportCount} Reports`)
        } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'Invalid argument recieved from ' + sender)
            main.respond(sender, 'Invalid user. Is that player registered? Do /msg dfrep help for more.')
        }
    })
}

exports.quickrep = quickrep;

//------------------------ /register ------------------------//
// Creates a players data file. Most code is spaghetti'd
// into db.js.

const register = function (sender) {
    db.readData(sender).then(data => {
        let timestamp = main.updateTimestamp()
        console.log(timestamp + '/register recieved from ' + sender)
        if (data === false) {
            db.register(sender).then(output => {
                if (output === true) {
                    let timestamp = main.updateTimestamp()
                    console.log(timestamp+`${sender} has registered!`)
                    main.respond(sender, "You've been registered! Welcome to dfrep! Try out /msg dfrep help for more.")  
                }
            })
        } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + 'Invalid argument recieved from ' + sender)
            main.respond(sender, 'You already seem to be registered.')
        }
    })
}

exports.register = register;

//------------------------ /+rep ------------------------//
// Arguments must be inputed using an array of the args to
// auto-detect the rep type.

const plusRep = function (sender, args) {
    let repType
    let victim = args[1]
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
    console.log(timestamp + '/+rep for ' + victim + ' recieved from ' + sender)
    db.readData(victim).then(data => {
        let validReq = false
        let increment = 1
        if (!(sender in data.statistics.ratedBy)) {
            validReq = true
        } else {
            if (!(data.statistics.ratedBy[sender] === "+1")) {
                increment = 2
                validReq = true
            }
        }
        if (validReq) {
            if (data !== false) {
                db.writeData(victim, `reputation.ratings.${repType}`, data['reputation']['ratings'][repType] + increment, true)
                db.readData(victim).then(data => {
                    data.statistics.ratedBy[sender] = "+1"
                    db.writeData(victim, `statistics.ratedBy`, data.statistics.ratedBy, false)
                })
                main.respond(sender, 'Recieved. Do /msg dfrep karma ' + victim + ' to check!')
            } else {
                let timestamp = main.updateTimestamp()
                console.log(timestamp + 'Invalid argument recieved from ' + sender)
                main.respond(sender, 'Invalid user. Is that player registered? Do /msg dfrep help for more.')
            }
        } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + sender + ' failed +rep for ' + victim)
            main.respond(sender, "You've already given this player a +rep!")
        }
    })
}

exports.plusRep = plusRep;

//------------------------ /-rep ------------------------//
// Arguments must be inputed using an array of the args to
// auto-detect the rep type.

const minusRep = function (sender, args) {
    let repType
    let victim = args[1]
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
    console.log(timestamp + '/-rep for ' + victim + ' recieved from ' + sender)
    db.readData(victim).then(data => {
        let validReq = false
        let decrement = 1
        if (!(sender in data.statistics.ratedBy)) {
            validReq = true
        } else {
            if (!(data.statistics.ratedBy[sender] === "-1")) {
                decrement = 2
                validReq = true
            }
        }
        if (validReq) {
            if (data !== false) {
                db.writeData(victim, `reputation.ratings.${repType}`, data['reputation']['ratings'][repType] - decrement, true)
                db.readData(victim).then(data => {
                    data.statistics.ratedBy[sender] = "-1"
                    db.writeData(victim, `statistics.ratedBy`, data.statistics.ratedBy, false)
                })
                main.respond(sender, 'Recieved. Do /msg dfrep karma ' + victim + ' to check!')
            } else {
                let timestamp = main.updateTimestamp()
                console.log(timestamp + 'Invalid argument recieved from ' + sender)
                main.respond(sender, 'Invalid user. Is that player registered? Do /msg dfrep help for more.')
            }
        } else {
            let timestamp = main.updateTimestamp()
            console.log(timestamp + sender + 'failed -rep for' + victim)
            main.respond(sender, "You've already given this player a -rep!")
        }
    })
}

exports.minusRep = minusRep;