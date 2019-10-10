const Discord = require("discord.js");

module.exports.run = async function(client, message, args)
{
    try {
        message.channel.send('Pinging...').then(sent => {
            sent.edit(`Pong! Took ${sent.createdTimestamp - message.createdTimestamp}ms`);
        });
    } catch(e) { }
}
