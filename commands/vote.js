const config = require("../config.json");
const Discord = require("discord.js");

module.exports.run = async function(client, message, args)
{
    let msg = new Discord.RichEmbed()
        .setColor(config.success_color)
        .setTitle("Vote, vote, vote!")
        .setDescription('https://discordbots.org/bot/621824033855504395/vote');

    message.channel.send({embed:msg}).catch(err => {});
}
