const sqlHand = require("./sql_handler.js");
const apiReq = require("./apiRequest.js");
const config = require("../config.json");
const Discord = require("discord.js");
const util = require("./util.js");
const fs = require('fs');

const LOG_DELAY = 300000; //How often we update our data
module.exports.startup = async function(client)
{
    //Resume our job
    main(client);
}

async function main(client)
{
    let guilds = client.guilds.array();
    for(let i = 0; i < guilds.length; i++)
    {
        let logData = await sqlHand.getData(client, `./SQL/teamLogsDB.db3`, "data", "id", guilds[i].id);
        if(!logData) continue; //This guild doesn't have logging features setup

        let channels = logData.channels.split(',');
        let tags = logData.tags.split(',');

        for(let j = 0; j < tags.length; j++)
        {
            if(tags[j] == '' || channels[j] == '') continue;

            let teamData = await apiReq.request(client, undefined, {endpoint: "team/", tag: tags[j]}).catch(err => { console.log(err); setTimeout(function() { main(client); }, LOG_DELAY); });
            if(!teamData) continue;
            let cleanedData = prepareData(teamData);
            let strungCleanedData = JSON.stringify(cleanedData);
            if(!cleanedData) continue;

            let oldDataJson = await sqlHand.getData(client, `./SQL/teamLogsDB.db3`, "logData", "logID", `${guilds[i].id}-${channels[j]}-${tags[j]}`);
            //console.log(strungCleanedData);
            if(typeof oldDataJson === 'undefined')
            {
                await sqlHand.setData(client, './SQL/teamLogsDB.db3', config.sql_teamLogDataDBSetterQuery, "logData", {logID: `${guilds[i].id}-${channels[j]}-${tags[j]}`, data: strungCleanedData});
                continue;
            }
            let oldData = JSON.parse(oldDataJson.data);
            await sqlHand.setData(client, './SQL/teamLogsDB.db3', config.sql_teamLogDataDBSetterQuery, "logData", {logID: `${guilds[i].id}-${channels[j]}-${tags[j]}`, data: strungCleanedData});

            //Checks-------
            if(oldData.badgeId != cleanedData.badgeId) badgeChange(client, guilds[i], channels[j], cleanedData);
            if(oldData.requiredScore != cleanedData.requiredScore) scoreChange(client, guilds[i], channels[j], oldData, cleanedData);
            if(oldData.description != cleanedData.description) descChange(client, guilds[i], channels[j], oldData, cleanedData);

            let cleanedArr = cleanedData.members.slice(0);
            let oldArr = oldData.members.slice(0);
            for(let k = cleanedArr.length - 1; k >= 0; k--) //Members
            {
                for(let l = oldArr.length - 1; l >= 0; l--)
                {
                    if(cleanedArr[k].tag == oldArr[l].tag)
                    {
                        cleanedArr.splice(k, 1);
                        oldArr.splice(l, 1);
                        break;
                    }
                }
            }

            for(let k = 0; k < cleanedArr.length; k++)
                memberJoined(client, guilds[i], channels[j], cleanedArr[k], cleanedData);
            for(let k = 0; k < oldArr.length; k++)
                memberLeave(client, guilds[i], channels[j], oldArr[k], cleanedData);
        }
    }
    setTimeout(function() { main(client); }, LOG_DELAY);
}

async function removeLogChannel(client, guild, channel)
{
    console.log(`> Channel has been removed from logging: ${guild.name} | ${guild.id}`);
    let guildLogsData = await sqlHand.getData(client, `./SQL/teamLogsDB.db3`, "data", "id", guild.id);

    let guildTags = guildLogsData.tags.split(',');
    let guildChannels = guildLogsData.channels.split(',');

    for(let i = guildChannels.length - 1; i >= 0; i--)
    {
        if(guildChannels[i] == channel)
        {
            let sData = await sqlHand.getData(client, `./SQL/teamLogsDB.db3`, "logData", "logID", `${guild.id}-${channel}-${guildTags[i]}`);
            if(sData != undefined)
                await sqlHand.deleteRow(client, './SQL/teamLogsDB.db3', "logData", "logID", `${guild.id}-${channel}-${guildTags[i]}`);

            guildChannels.splice(i, 1);
            guildTags.splice(i, 1);
        }
    }

    guildLogsData.tags = guildTags.join(',');
    guildLogsData.channels = guildChannels.join(',');
    await sqlHand.setData(client, './SQL/teamLogsDB.db3', config.sql_teamLogsDBSetterQuery, "data", guildLogsData);

    //Remove files that are dedicated towards that log
}

async function memberLeave(client, guild, channel, data, team)
{
    let msg = new Discord.MessageEmbed()
        .setColor(config.error_color)
        .setAuthor(`${team.name} Logs`, team.badgeUrl)
        .addField(`Member left (${team.members.length}/25)\n`,
            `${util.getLeagueMedal(data.stars)} **\`${data.stars}\`** ${util.level_to_emote[data.expLevel]}${data.name} `)
        .setTimestamp();

    try {
        (await client.channels.get(channel)).send({embed:msg});
    } catch(err) {
        console.log(err);
        if(err.message.includes("Cannot read property 'send' of undefined"))
            removeLogChannel(client, guild, channel);
    }
}

async function memberJoined(client, guild, channel, data, team)
{
    let msg = new Discord.MessageEmbed()
        .setColor(config.blue_color)
        .setAuthor(`${team.name} Logs`, team.badgeUrl)
        .addField(`New member (${team.members.length}/25)\n`,
            `${util.getLeagueMedal(data.stars)} **\`${data.stars}\`** ${util.level_to_emote[data.expLevel]}${data.name} `)
        .setTimestamp();

    try {
        (await client.channels.get(channel)).send({embed:msg});
    } catch(err) {
        console.log(err);
        if(err.message.includes("Cannot read property 'send' of undefined"))
            removeLogChannel(client, guild, channel);
    }
}

async function descChange(client, guild, channel, oldData, data)
{
    let msg = new Discord.MessageEmbed()
        .setColor(config.blue_color)
        .setAuthor(`${data.name} Logs`, data.badgeUrl)
        .setDescription("**Team description changed**")
        .addField("Old description", `${oldData.description}`, true)
        .addField("New description", `${data.description}`, true)
        .setTimestamp();

    try {
        (await client.channels.get(channel)).send({embed:msg});
    } catch(err) {
        console.log(err);
        if(err.message.includes("Cannot read property 'send' of undefined"))
            removeLogChannel(client, guild, channel);
    }
}

async function scoreChange(client, guild, channel, oldData, data)
{
    let msg = new Discord.MessageEmbed()
        .setColor(config.blue_color)
        .setAuthor(`${data.name} Logs`, data.badgeUrl)
        .setDescription("**Team requirements changed**")
        .addField("Old requirements", `<:rw_star_full:621975382907813918> ${oldData.requiredScore.toLocaleString()}`, true)
        .addField("New requirements", `<:rw_star_full:621975382907813918> ${data.requiredScore.toLocaleString()}`, true)
        .setTimestamp();


    try {
        (await client.channels.get(channel)).send({embed:msg});
    } catch(err) {
        console.log(err);
        if(err.message.includes("Cannot read property 'send' of undefined"))
            removeLogChannel(client, guild, channel);
    }
}

async function badgeChange(client, guild, channel, data)
{
    let msg = new Discord.MessageEmbed()
        .setColor(config.blue_color)
        .setAuthor(`${data.name} Logs`, data.badgeUrl)
        .setTitle("Team badge changed")
        .setImage(data.badgeUrl)
        .setTimestamp();

    try {
        (await client.channels.get(channel)).send({embed:msg});
    } catch(err) {
        console.log(err);
        if(err.message.includes("Cannot read property 'send' of undefined"))
            removeLogChannel(client, guild, channel);
    }
}

function prepareData(data)
{
    try
    {
        let nData = {
            name: data.name,
            badgeId: data.badgeId,
            badgeUrl: data.badgeUrl,
            membersCount: data.membersCount,
            requiredScore: data.requiredScore,
            description: data.description,
            members: data.members
        }
        return nData;
    } catch(e) {
        client.emit("log", `Error found while prepping log data:\n${e}`);
        return undefined;
    }
}
