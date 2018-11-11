# @iarna/modbot

Moderation actions for my Discord servers

## USAGE


```console
$ npx @iarna/modbot conf.toml
```

This adds /report and /admin commands to your server.

## CONFIG

### token = "<discordtoken>"

The auth token for your discord bot. Note that

### [emoji]

* waiting = "name of emoji to react with while bot is thinking"
* report = "name of emoji used to flag abuse reports with"

### \[\[servers."my full server name".channels]]

Can have the following options:

* moderation = "moderation channel name"
* welcome = "welcome channel name"
