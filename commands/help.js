const sqlHand = require("../util/sql_handler.js");
const config = require("../config.json");
const Discord = require("discord.js");

module.exports.run = async function(client, message, args)
{
    message.channel.startTyping();
    let userData = await sqlHand.getData(client, `./SQL/guildsDB.db3`, "data", "id", message.guild.id);
    let prefix = userData.prefix;

    let helpMsg = new Discord.RichEmbed()
        .setColor(config.success_color)
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
        .addField("General Commands",
        ` **\`${prefix}profile\`** - Shows your in-game profile stats.\n` +
        ` **\`${prefix}save\`** - Links your in-game profile to your account.\n` +
        ` **\`${prefix}boxes\`** - Shows your upcoming box cycles.\n\n** **`)

        .addField("Server Commands",
        ` **\`${prefix}setprefix\`** - Changes your server's prefix.\n`)

        .addBlankField()
        .addField("Dev", `<:twitter:528807292305408030> [Henok](https://twitter.com/stupidsedits)`, true)
        .addField("Invite me", `<:discord:528808847671033867> [Invite](https://discordapp.com/oauth2/authorize?client_id=621824033855504395&scope=bot&permissions=322624)`, true)
        .addField("Feel like donating", "<:pplogo384:539150609593532417> [Donate](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=EQD8GU6SS6324&currency_code=USD&source=url)", true)
        .setTimestamp()
        .setFooter(`${client.user.username}#${client.user.discriminator}`, client.user.displayAvatarURL);

    message.channel.stopTyping();
    message.reply({embed:helpMsg});
}
