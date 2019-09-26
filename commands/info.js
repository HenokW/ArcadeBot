const sqlHand = require("../util/sql_handler.js");
const config = require("../config.json");
const util = require("../util/util.js");
const Discord = require("discord.js");

module.exports.run = function(client, message, args)
{
    message.channel.startTyping();

    let userCount = 0;
    for(let i = 0; i < client.guilds.array().length; i++)
        userCount += client.guilds.array()[i].members.array().length;

    const starIcon = new Discord.Attachment('./resources/game_assets/ui_sprite_480.png', 'star_icon.png');
    let msg = new Discord.RichEmbed()
        .setColor(config.success_color)
        .setThumbnail(client.user.displayAvatarURL)
        .setTitle(`${client.user.username} Statistics`)
        .addField("Developer", "StupidEdits#4461", true)
        .addField("Servers", client.guilds.array().length, true)
        .addField("Users", userCount.toLocaleString(), true)
        .addField("Latency", `${Math.floor(client.ping)}ms`, true)
        .addField("Uptime", util.formatMs(client.uptime), true)
        .addField("Version", config.version, true)

        .attachFile(starIcon)
        .setFooter("Powered by Zihad & 4JR's RushWars API", "attachment://star_icon.png");

    message.channel.stopTyping();
    message.channel.send({embed:msg}).catch(err => {});
}
