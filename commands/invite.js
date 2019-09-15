const config = require("../config.json");
const Discord = require("discord.js");

module.exports.run = async function(client, message, args)
{
    let msg = new Discord.RichEmbed()
        .setColor(config.success_color)
        .setTitle("Let me join!")
        .setDescription(config.invite_link);

    message.channel.send({embed:msg}).catch(err => {});
}
