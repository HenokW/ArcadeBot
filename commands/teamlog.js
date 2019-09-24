const sqlHand = require("../util/sql_handler.js");
const apiReq = require("../util/apiRequest.js");
const config = require("../config.json");
const util = require("../util/util.js");
const Discord = require("discord.js");

const allowedRoles = ["Leader", "Co-Leader"];

module.exports.run = async function(client, message, args)
{
    message.channel.startTyping();
    //Check to make sure we have a channel provided, and they're staff within their team
    if(!message.mentions.channels.first()) return logError(client, message); //No channel provided, send a 'help' message
    if(message.mentions.channels.first() != args[0]) return logError(client, message);

    let channel = message.mentions.channels.first();
    let deleteParam = args[1];

    if(deleteParam == "disable")
        return disableLogChannel(client, message, channel);

    //Let's grab their tag; send a 'NOTEAM' error if they're not within a team, or not a staff member
    let userData = await sqlHand.getData(client, `./SQL/playersDB.db3`, "data", "id", message.author.id);
    if(!userData || !userData.tag)
    {
        message.channel.stopTyping();
        return util.missingTagError(client, message, false);
    }
    let requestData = await apiReq.request(client, message, {endpoint: "player/", tag: userData.tag});

    if(!requestData.team) return logError(client, message, "NOTEAM");
    if(!allowedRoles.includes(requestData.team.role)) return logError(client, message, "NOTEAM");

    //Check if their team's tag is already logged
    let guildLogsData = await sqlHand.getData(client, `./SQL/teamLogsDB.db3`, "data", "id", message.guild.id);

    //We made it here! We're safe!
    if(!guildLogsData)
    {
        sqlData = {
            id: message.guild.id,
            tags: requestData.team.tag,
            channels: message.mentions.channels.first().id,
            verified: true
        }

        await sqlHand.setData(client, './SQL/teamLogsDB.db3', config.sql_teamLogsDBSetterQuery, "data", sqlData);
        sendLogChannelMessage(client, message, message.mentions.channels.first(), requestData.team);
    }
    else
    {
        let guildTags = guildLogsData.tags.split(',');
        let guildChannels = guildLogsData.channels.split(',');

        if(guildTags.includes(requestData.team.tag)) //Find the channel, and let them know where
        {
            for(let i = 0; i < guildTags.length; i++)
                if(guildTags[i] == requestData.team.tag)
                    return logError(client, message, "USED", guildChannels[i]);//346430947421323267
        }
        else {
            guildTags.push(requestData.team.tag);
            guildChannels.push(message.mentions.channels.first().id);

            guildLogsData.tags = guildTags.join(',');
            guildLogsData.channels = guildChannels.join(',');

            await sqlHand.setData(client, './SQL/teamLogsDB.db3', config.sql_teamLogsDBSetterQuery, "data", guildLogsData);
            sendLogChannelMessage(client, message, message.mentions.channels.first(), requestData.team);
        }
    }
    message.channel.stopTyping();
}

async function disableLogChannel(client, message, channel)
{
    //Checks if that specified channel is being logged
    let guildLogsData = await sqlHand.getData(client, `./SQL/teamLogsDB.db3`, "data", "id", message.guild.id);
    if(!guildLogsData) return util.sendErrorMessage(message, "You don't seem to have a logging channel setup.", "REPLY");

    let guildTags = guildLogsData.tags.split(',');
    let guildChannels = guildLogsData.channels.split(',');
    if(!guildChannels.includes(channel.id)) return util.sendErrorMessage(message, `${channel} doesn't seem to be logging anything.`, "REPLY");

    for(let i = guildChannels.length - 1; i >= 0; i--)
    {
        if(guildChannels[i] == channel.id)
        {
            guildChannels.splice(i, 1);
            guildTags.splice(i, 1);
        }
    }

    guildLogsData.tags = guildTags.join(',');
    guildLogsData.channels = guildChannels.join(',');
    await sqlHand.setData(client, './SQL/teamLogsDB.db3', config.sql_teamLogsDBSetterQuery, "data", guildLogsData);

    sendDisabledMessage(client, message, channel);
}

function sendDisabledMessage(client, message, channel)
{
    let msg = new Discord.RichEmbed()
        .setColor(config.success_color)
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
        .setDescription(`${channel} has successfully been disabled, and is no longer a logging channel.`)
        .setTimestamp();

    message.channel.stopTyping();
    channel.send({embed:msg}).catch(err => { });
}

function sendLogChannelMessage(client, message, channel, data)
{
    let msg = new Discord.RichEmbed()
        .setColor(config.success_color)
        .setAuthor(data.name, data.badgeUrl)
        .setDescription(`${channel} has successfully been set as the logging channel for **${data.name}**!\n\n` +
                    `If you would like to disable this log channel, please use the **\`teamlog #${channel.name} disable\`** command`)
        .setThumbnail(data.badgeUrl)
        .setTimestamp();

    channel.send({embed:msg}).catch(err => { });
}

async function logError(client, message, err, channel)
{
    let guildInfo = await sqlHand.getData(client, './SQL/guildsDB.db3', 'data', 'id', message.guild.id);
    let msg = new Discord.RichEmbed()
        .setColor(config.error_color)
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL);

    switch(err)
    {
        case "NOTEAM":
            msg.setTitle("Team not found")
                .setDescription("To use this command, you must be within a team, and must be a Leader, or Co-Leader.");
            break;
        case "NOTSTAFF":
            msg.setTitle("Not staff")
                .setDescription("To use this command, you must be within a team, and must be a Leader, or Co-Leader.");
            break;
        case "USED":
            msg.setTitle("Team already logging")
                .setDescription(`The team you're in is already logging in <#${channel}>`);
            break;
        default:
            msg.setTitle("Team logging help")
                .setDescription("This feature logs various changes that take place with your team! To enable this feature for the team you're in, use the following command format, **`teamlog #channel`**. To disable this feature for a specific channel, use the following format **`teamlog #channel disable`**.\n\n" +
                                "**List of logs:**\n" +
                                "• Team badge change\n" +
                                "• Team requirements change\n" +
                                "• Team description change\n" +
                                "• Joined / Left members")

                .addField("Examples", `**\`${guildInfo.prefix}` + "teamlog #log-channel`** - Enables logging for your team within a channel.\n" +
                                      `**\`${guildInfo.prefix}` + "teamlog #log-channel disable`** - Disables **all** team logs within a channel.");
    }

    message.channel.stopTyping();
    return message.reply({embed:msg}).catch(err => {});
}
