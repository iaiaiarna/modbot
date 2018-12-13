#!/usr/bin/env node
'use strict'
require('@iarna/cli')(main)
// These are yargs config for what goes on the commandline.
  .usage('$0 <conffile>')
  .demand(1)
  .help()

const DiscoBot = require('@iarna/discobot')
const Discord = require('discord.js')
const fs = require('fs')
const TOML = require('@iarna/toml')

// @iarna/cli above will run this when the process starts
async function main (opts, conffile) {
  const bot = await DiscoBot.create(TOML.parse(fs.readFileSync(conffile)))
  bot.addCommand('report', {
    usage: 'report <reason...>',
    description: 'report inappropriate activity',
    filter: $ => $.server,
    action: async function ($, { reason }) {
      const chname = ($.msg.channel && $.msg.channel.type !== 'dm') ? $.msg.channel : 'DM'
      console.log(`**REPORT** from ${this.name($.msg.author)} in ${this.name(chname)}: ${reason.join(' ')}`)
      if ($.server.deleteReports && $.msg.channel.name) $.msg.delete().catch(() => {})
      await $.server.moderation.send(`@here **REPORT** from ${$.msg.author} in ${chname}: ${reason.join(' ')}`, { split: true })
      if ($.server.deleteReports && $.msg.channel.name) {
        return this.sendDM($.msg.author, `Report in ${chname} has been sent to moderators: ${reason.join(' ')}`, { split: true })
      } else {
        return $.msg.react($.server.emoji.report)
      }
    }
  })
  bot.addCommand('admin', {
    description: 'message the admins',
    usage: 'admin <message...>',
    filter: $ => $.server,
    action: async function ($, { message }) {
      const chname = ($.msg.channel && $.msg.channel.type !== 'dm') ? $.msg.channel : 'DM'
      console.log(`Message to admins from ${this.name($.msg.author)} in ${this.name(chname)}: ${message.join(' ')}`)
      if ($.server.deleteReports && $.msg.channel.name) $.msg.delete().catch(() => {})
      await $.server.moderation.send(`Message to admins from ${$.msg.author} in ${chname}: ${message.join(' ')}`, { split: true })
      if ($.server.deleteReports && $.msg.channel.name) {
        return this.sendDM($.msg.author, `Mesage to admins in ${chname} has been sent: ${message.join(' ')}`, { split: true })
      } else {
        return $.msg.react('✅')
      }
    }
  })
  if (bot.conf.welcome) {
    bot.addCommand(DiscoBot.Welcome, {
      action: async function ($) {
        return $.server.welcome.send(bot.conf.welcome.replace(/[{]user[}]/, $.msg.user), { split: true })
      }
    })
  }
  bot.addReaction('report', async function ($) {
    const report = `Reporting ${$.msg.author} saying:\n${$.msg}`
    console.log(`**EMOJI REPORT** from ${this.name($.user)} in ${this.name($.msg.channel)}: ${report}`)
    await $.mr.remove($.user)
    let embed
    const files = $.msg.attachments.map(_ => new Discord.Attachment(_.url, _.filename))
    if (files.length) {
      embed = new Discord.RichEmbed({ author: $.msg.author })
      if ($.msg.attachments) embed.attachFiles(files)
    }
    await $.server.moderation.send(`@here **EMOJI REPORT** from ${$.user} in ${$.msg.channel}: ${report}`, { split: true, embed })
    return Promise.all([
      $.msg.react($.mr.emoji),
      this.sendDM($.user, `Report in ${$.msg.channel} has been sent to moderators: ${report}`, { split: true, embed })
    ])
  })
  await bot.login()
}
