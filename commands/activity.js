const sqlHand = require("../util/sql_handler.js");
const apiReq = require("../util/apiRequest.js");
const config = require("../config.json");
const util = require("../util/util.js");
const Discord = require("discord.js");

const teamLimit = 25;
const allowed_roles = ["Leader", "Co-Leader"];
const allowed_users = ['148278118170361857'];

module.exports.run = async function(client, message, args)
{
    if(!allowed_users.includes(message.author.id)) return;

    message.channel.startTyping();

    let userData = await sqlHand.getData(client, `./SQL/playersDB.db3`, "data", "id", message.author.id);
    if(!userData || !userData.tag)
    {
        message.channel.stopTyping();
        return util.missingTagError(client, message);
    }

    let userRequestData = await apiReq.request(client, message, {endpoint: "player/", tag: userData.tag});
    if(!userRequestData.team) return util.sendErrorMessage(message, "You don't seem to be apart of a team! Please join a team to use this command.", "REPLY");
    let teamData = await apiReq.request(client, message, {endpoint: "team/", tag: userRequestData.team.tag});

    //Staff check
    for(let i = 0; i < teamData.members.length; i++)
        if(teamData.members[i].tag == userData.tag)
            if(!allowed_roles.includes(teamData.members[i].role)) return util.sendErrorMessage(message, "You're not able to use this command! Only Leaders, and Co-Leaders are allowed to check recent player activity.", "REPLY");

    message.channel.stopTyping();
    sendTeamMessage(client, message, teamData);
}

async function sendTeamMessage(client, message, data)
{
    const showRecentActives = 3;

    let leaders = undefined;
    for(let i = 0; i < data.members.length; i++)
        if(data.members[i].role == "Leader")
        {
            leader = data.members[i];
            break;
        }

    let members = data.members;
    await members.sort((a,b) => b.lastLogin - a.lastLogin);

    let allActives = "";

    let allActivesObject = {
        lastIndex: 0,
        activeFields: []
    };

    for(let i = 0; i < members.length; i++)
    {
        if(allActives.length >= 850)
        {
            allActivesObject.lastIndex = i;
            allActivesObject.activeFields[allActivesObject.activeFields.length] = allActives;
            allActives = "";
        }

        allActives += `**\`${i + 1}.\`** ${util.getLeagueMedal(data.members[i].stars)} **${data.members[i].name}** \`#${data.members[i].tag}\` **\`${data.members[i].timeSinceLastLogin}\`**\n`;
    }
    allActivesObject.activeFields[allActivesObject.activeFields.length] = allActives;

    let msg = new Discord.RichEmbed()
        .setColor(config.success_color)
        .setAuthor(`${data.name} #${data.tag}`, data.badgeUrl)
        .setThumbnail(data.badgeUrl)
        .addField("Members", `<:rw_troops:622260065499349032> ${data.membersCount}/${teamLimit}`, true)
        .addField("Leader", `<:rw_captain:622580325884624897> ${leader.name}`, true);

    for(let i = 0; i < allActivesObject.activeFields.length; i++)
    {
        if(i == 0)
            msg.addField("All Activity",`${allActivesObject.activeFields[i]}`, true);
        else
            msg.addField("All Activity (cont.)", `${allActivesObject.activeFields[i]}`, true);
    }

    message.reply({embed:msg}).catch(err => {});
}
