const sqlHand = require("./sql_handler.js");
const apiReq = require("./apiRequest.js");
const config = require("../config.json");
const storage = require("node-persist");
const Discord = require("discord.js");
const util = require("./util.js");
const fs = require('fs');

const LOG_DELAY = 300000; //How often we update our data
module.exports.startup = async function(client)
{
    try
    {
        await storage.init(
        {
            stringify: JSON.stringify,
            parse: JSON.parse,
            encoding: "utf8",
            ttl: false
        });

        //Resume our job
        main(client);
    }
    catch(e) { client.emit("error", e); return; }
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
            let teamData = await apiReq.request(client, undefined, {endpoint: "team/", tag: tags[j]});
            let cleanedData = prepareData(teamData);

            let oldDataJson = await storage.getItem(`${guilds[i].id}-${channels[j]}-${tags[j]}`);
            if(typeof oldDataJson === 'undefined')
            {
                await storage.setItem(`${guilds[i].id}-${channels[j]}-${tags[j]}`, JSON.stringify(cleanedData));
                continue;
            }
            let oldData = JSON.parse(oldDataJson);

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

            await storage.setItem(`${guilds[i].id}-${channels[j]}-${tags[j]}`, JSON.stringify(cleanedData));
        }
    }

    setTimeout(function() { main(client); }, LOG_DELAY);
}

async function memberLeave(client, guild, channel, data, team)
{
    let msg = new Discord.RichEmbed()
        .setColor(config.error_color)
        .setAuthor(`${team.name} Logs`, team.badgeUrl)
        .addField(`Member left (${team.members.length}/25)\n`,
            `${util.getLeagueMedal(data.stars)} **\`${data.stars}\`** ${data.name} `)
        .setTimestamp();

    (await client.channels.get(channel)).send({embed:msg}).catch(err => {});
}

async function memberJoined(client, guild, channel, data, team)
{
    let msg = new Discord.RichEmbed()
        .setColor(config.blue_color)
        .setAuthor(`${team.name} Logs`, team.badgeUrl)
        .addField(`New member (${team.members.length}/25)\n`,
            `${util.getLeagueMedal(data.stars)} **\`${data.stars}\`** ${data.name} `)
        .setTimestamp();

    (await client.channels.get(channel)).send({embed:msg}).catch(err => {});
}

async function descChange(client, guild, channel, oldData, data)
{
    let msg = new Discord.RichEmbed()
        .setColor(config.blue_color)
        .setAuthor(`${data.name} Logs`, data.badgeUrl)
        .setDescription("**Team description changed**")
        .addField("Old description", `${oldData.description}`, true)
        .addField("New description", `${data.description}`, true)
        .setTimestamp();

    (await client.channels.get(channel)).send({embed:msg}).catch(err => {});
}

async function scoreChange(client, guild, channel, oldData, data)
{
    let msg = new Discord.RichEmbed()
        .setColor(config.blue_color)
        .setAuthor(`${data.name} Logs`, data.badgeUrl)
        .setDescription("**Team requirements changed**")
        .addField("Old requirements", `<:rw_star_full:621975382907813918> ${oldData.requiredScore.toLocaleString()}`, true)
        .addField("New requirements", `<:rw_star_full:621975382907813918> ${data.requiredScore.toLocaleString()}`, true)
        .setTimestamp();

    (await client.channels.get(channel)).send({embed:msg}).catch(err => {});
}

async function badgeChange(client, guild, channel, data)
{
    let msg = new Discord.RichEmbed()
        .setColor(config.blue_color)
        .setAuthor(`${data.name} Logs`, data.badgeUrl)
        .setTitle("Team badge changed")
        .setImage(data.badgeUrl)
        .setTimestamp();

    (await client.channels.get(channel)).send({embed:msg}).catch(err => {});
}

function prepareData(data)
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
}
