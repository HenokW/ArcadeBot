const sqlHand = require("../util/sql_handler.js");
const config = require("../config.json");
const util = require("../util/util.js");
const Discord = require("discord.js");

module.exports.run = async function(client, message, args)
{
    message.channel.startTyping();

    let userCount = 0;
    for(let i = 0; i < client.guilds.array().length; i++)
        userCount += client.guilds.array()[i].members.array().length;

    let shardGuilds = await client.shard.fetchClientValues('guilds.size');
    let shardMembers = (await client.shard.broadcastEval('this.guilds.reduce((prev, guild) => prev + guild.memberCount, 0)')).reduce((a,b) => a + b);

    const starIcon = new Discord.Attachment('./resources/game_assets/ui_sprite_480.png', 'star_icon.png');
    let msg = new Discord.RichEmbed()
        .setColor(config.success_color)
        .setThumbnail(client.user.displayAvatarURL)
        .setAuthor(`${client.user.username} Statistics`, client.user.displayAvatarURL)
        .addField("Developer", "StupidEdits#4461", true)
        .addField("Servers", shardGuilds.reduce((a, b) => a + b), true)
        .addField("Shards", ((await client.shard.fetchClientValues('guilds.size')).length || 0), true)
        .addField("Users", shardMembers.toLocaleString(), true)
        .addField("Ping", `${Math.floor(client.ping || 'N/A')}ms`, true)
        .addField("Latency", `${new Date() - message.createdAt}ms`, true)
        .addField("Uptime", util.formatMs(client.uptime), true)
        .addField("Version", config.version, true)

        .attachFile(starIcon)
        .setFooter("Powered by Zihad & 4JR's RushWars API", "attachment://star_icon.png");

    message.channel.stopTyping();
    message.channel.send({embed:msg}).catch(err => {});
}
