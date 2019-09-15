const sqlHand = require("../util/sql_handler.js");
const apiReq = require("../util/apiRequest.js");
const config = require("../config.json");
const util = require("../util/util.js");
const Discord = require("discord.js");

const teamLimit = 25;
module.exports.run = async function(client, message, args)
{
    message.channel.startTyping();
    let userData = await sqlHand.getData(client, `./SQL/playersDB.db3`, "data", "id", message.author.id);
    if(!userData || !userData.tag)
    {
        message.channel.stopTyping();
        return util.missingTagError(client, message);
    }

    let userRequestData = await apiReq.request(client, message, {endpoint: "player/", tag: userData.tag});
    let requestData = await apiReq.request(client, message, {endpoint: "team/", tag: userRequestData.team.tag});

    message.channel.stopTyping();
    sendTeamMessage(client, message, requestData);
}

async function sendTeamMessage(client, message, data)
{
    const limit = 10;

    let members = data.members;
    let scoreLB = members;

    await scoreLB.sort((a, b) => b.stars - a.stars);
    if(scoreLB.length > 10) scoreLB.splice(limit - 1, scoreLB.length - limit);

    //Making it nice and pretty
    //--------------
    let leaders = undefined;
    for(let i = 0; i < members.length; i++)
        if(members[i].role == "Leader")
        {
            leader = members[i];
            break;
        }
    let temp = "";
    for(let i = 0; i < scoreLB.length; i++)
        temp += `**\`${i + 1}.)\`** ${util.getLeagueMedal(scoreLB[i].stars)} ${scoreLB[i].name} **\`${scoreLB[i].stars}\`**\n`;
    scoreLB = temp;
    //--------------

    let msg = new Discord.RichEmbed()
        .setColor(config.success_color)
        .setAuthor(`${data.name} #${data.tag}`, data.badgeUrl)
        .setDescription(data.description)
        .setThumbnail(data.badgeUrl)
        .addField("Score", `<:rw_gold_star:622260094775853066> ${data.score}`, true)
        .addField("Required Score", `<:rw_medal:622260064937312256> ${data.requiredScore}`, true)
        .addField("Dominations Won", `<:rw_white_star:622579023364751361> ${data.dominationsWon}`, true)
        .addField("Members", `<:rw_troops:622260065499349032> ${data.membersCount}/${teamLimit}`, true)
        .addField("Leader", `<:rw_captain:622580325884624897> ${leader.name}`)
        .addField("Top Members", scoreLB, true);


    message.reply({embed:msg}).catch(err => {});
}
