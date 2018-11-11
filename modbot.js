'use strict'
require('@iarna/cli')(main)
// These are yargs config for what goes on the commandline.
  .usage('$0 <conffile>')
  .demand(1)
  .help()

const DiscoBot = require('@iarna/discobot')
const fs = require('fs')
const TOML = require('@iarna/toml')

// @iarna/cli above will run this when the process starts
async function main (opts, conffile) {
  const bot = await DiscoBot.create(Object.assign({emoji: {report: 'report'}}, TOML.parse(fs.readFileSync(conffile))))
  bot.addCommand('report', {
    usage: 'report <reason...>',
    description: 'report inappropriate activity',
    filter: $ => $.server,
    action: async function ($, {reason}) {
      const chname = ($.msg.channel && $.msg.channel.type !== 'dm') ? $.msg.channel : 'DM'
      console.log(`**REPORT** from ${this.name($.msg.author)} in ${this.name(chname)}: ${reason.join(' ')}`)
      if ($.server.deleteReports && $.msg.channel.name) $.msg.delete().catch(() => {})
      await $.server.moderation.send(`@here **REPORT** from ${$.msg.author} in ${chname}: ${reason.join(' ')}`, {split: true})
      if ($.server.deleteReports && $.msg.channel.name) {
        return this.sendDM($.msg.author, `Report in ${chname} has been sent to moderators: ${reason.join(' ')}`, {split: true})
      } else {
        return $.msg.react($.server.emoji.report)
      }
    }
  })
  bot.addCommand('admin', {
    description: 'message the admins',
    usage: 'admin <message...>',
    filter: $ => $.server,
    action: async function ($, {message}) {
      const chname = ($.msg.channel && $.msg.channel.type !== 'dm') ? $.msg.channel : 'DM'
      console.log(`Message to admins from ${this.name($.msg.author)} in ${this.name(chname)}: ${message.join(' ')}`)
      if ($.server.deleteReports && $.msg.channel.name) $.msg.delete().catch(() => {})
      await $.server.moderation.send(`Message to admins from ${$.msg.author} in ${chname}: ${message.join(' ')}`, {split: true})
      if ($.server.deleteReports && $.msg.channel.name) {
        return this.sendDM($.msg.author, `Mesage to admins in ${chname} has been sent: ${message.join(' ')}`, {split: true})
      } else {
        return $.msg.react('✅')
      }
    }
  })
  await bot.login()
}
