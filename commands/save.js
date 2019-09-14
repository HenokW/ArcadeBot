const sqlHand = require("../util/sql_handler.js");
const apiReq = require("../util/apiRequest.js");
const config = require("../config.json");
const Discord = require("discord.js");

module.exports.run = async function(client, message, args)
{
    message.channel.startTyping();

    let tag = tagCheck(args.shift());
    if(!tag) return saveError(client, message, tag);

    let requestData = await apiReq.request(client, message, {endpoint: "player/", tag: tag});
    if(requestData) //Allow multiple accounts in the future, but for now overwrite the data
    {
        data = {
            id: message.author.id,
            tag: tag
        }

        await sqlHand.setData(client, './SQL/playersDB.db3', config.sql_playerDBSetterQuery, "data", data);
        return saveSuccess(client, message, requestData);
    }

    return saveError(client, message, tag);
}

//0289PYLQGRJCUV
function tagCheck(tag)
{
    const validChars = ['0', '2', '8', '9', 'P', 'Y', 'L', 'Q', 'G', 'R', 'J', 'C', 'U', 'V'];

    if(tag[0] == "#") tag = tag.substring(1, tag.length);
    tag = tag.toUpperCase();

    for(let i = 0; i < tag.length; i++)
        if(!validChars.includes(tag[i])) return false;

    return tag;
}

function saveSuccess(client, message, data)
{
    const errImg = new Discord.Attachment('./resources/game_assets/ui_sprite_193.png', 'check.png');
    let msg = new Discord.RichEmbed()
        .setColor(config.success_color)
        .attachFile(errImg)
        .setThumbnail('attachment://check.png')
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
        .setTitle(`Successfully saved | ${data.name} #${data.tag}`);

    message.reply({embed:msg});
    message.channel.stopTyping();
}

function saveError(client, message, tag)
{
    const errImg = new Discord.Attachment('./resources/invalid_tag_img.png', 'errorImg.png');
    let msg = new Discord.RichEmbed()
        .setColor(config.error_color)
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
        .addField("Invalid tag provided", "Please make sure you're entering your valid player tag.\n\n" +
            "**Valid Numbers:** `0, 2, 8, 9`\n" +
            "**Valid Letters:** `C, G, J, L, P, Q, R, U, V, Y`")
        .attachFile(errImg)
        .setImage('attachment://errorImg.png');

    message.reply({embed:msg}).catch(error => { client.emit("error", error) });
    message.channel.stopTyping();
}
