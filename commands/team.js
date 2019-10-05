const sqlHand = require("../util/sql_handler.js");
const apiReq = require("../util/apiRequest.js");
const config = require("../config.json");
const util = require("../util/util.js");
const Discord = require("discord.js");

const teamLimit = 25;
module.exports.run = async function(client, message, args)
{
    message.channel.startTyping();

    if(!args[0])
    {
        let userData = await sqlHand.getData(client, `./SQL/playersDB.db3`, "data", "id", message.author.id);
        if(!userData || !userData.tag)
        {
            message.channel.stopTyping();
            return util.missingTagError(client, message);
        }

        let userRequestData = await apiReq.request(client, message, {endpoint: "player/", tag: userData.tag});
        if(!userRequestData.team) return util.sendErrorMessage(message, "You don't seem to be apart of a team! Please join a team to use this command.", "REPLY");
        let requestData = await apiReq.request(client, message, {endpoint: "team/", tag: userRequestData.team.tag});

        message.channel.stopTyping();
        sendTeamMessage(client, message, requestData);
    }
    else
    {
        if(message.mentions.users.first())
        {
            let userData = await sqlHand.getData(client, `./SQL/playersDB.db3`, "data", "id", message.mentions.users.first().id);
            if(!userData || !userData.tag)
            {
                message.channel.stopTyping();
                return util.missingTagError(client, message, true);
            }

            let userRequestData = await apiReq.request(client, message, {endpoint: "player/", tag: userData.tag});
            if(!userRequestData.team) return util.sendErrorMessage(message, "This user doesn't seem to be apart of a team! They must be in a team to use this command.", "REPLY");
            let requestData = await apiReq.request(client, message, {endpoint: "team/", tag: userRequestData.team.tag});

            message.channel.stopTyping();
            sendTeamMessage(client, message, requestData);
        }
        else
        {
            let tag = util.tagCheck(args.shift());
            if(!tag) return saveError(client, message, tag);

            let requestData = await apiReq.request(client, message, {endpoint: "team/", tag: tag});
            if(requestData)
            {
                message.channel.stopTyping();
                sendTeamMessage(client, message, requestData);
            }
            else {
                message.channel.stopTyping();
                return util.sendErrorMessage(message, "Invalid team tag provided. Please ensure you're entering a valid team tag.", "REPLY");
            }
        }
    }
}

async function sendTeamMessage(client, message, data)
{
    const limit = 10;

    let members = data.members;
    let scoreLB = members.slice(0);
    let staffLB = members.slice(0);

    await scoreLB.sort((a, b) => b.stars - a.stars);
    let staffLB_sorted = staffLB.filter(function(obj) {
        return ['Leader', 'Co-Leader'].includes(obj.role);
    });
    await staffLB_sorted.sort((a, b) => b.stars - a.stars);
    if(scoreLB.length > limit) scoreLB.splice(limit, scoreLB.length - 1);
    if(staffLB_sorted.length > 5) staffLB_sorted.splice(5, staffLB_sorted.length - 1);

    //Making it nice and pretty
    //--------------
    let leader = undefined;
    for(let i = 0; i < data.members.length; i++)
        if(data.members[i].role == "Leader")
        {
            leader = members[i];
            break;
        }

    let temp = "";
    for(let i = 0; i < scoreLB.length; i++)
        temp += `**\`${i + 1}.\`** ${util.getLeagueMedal(scoreLB[i].stars)} **\`${scoreLB[i].stars}\`** ${util.level_to_emote[scoreLB[i].expLevel]} ${scoreLB[i].name}\n`;
    scoreLB = temp;
    temp = "";
    for(let i = 0; i < staffLB_sorted.length; i++)
        temp += `**\`${i + 1}.\`** ${util.getLeagueMedal(staffLB_sorted[i].stars)} **\`${staffLB_sorted[i].stars}\`** ${util.level_to_emote[staffLB_sorted[i].expLevel]} ${staffLB_sorted[i].name}\n`;
    staffLB_sorted = temp;

    //--------------

    let msg = new Discord.RichEmbed()
        .setColor(config.success_color)
        .setAuthor(`${data.name} | #${data.tag}`, data.badgeUrl)
        .setDescription(data.description)
        .setThumbnail(data.badgeUrl)
        .addField("Score", `<:rw_gold_star:622260094775853066> ${data.score.toLocaleString()}`, true)
        .addField("Required Score", `<:rw_medal:622260064937312256> ${data.requiredScore.toLocaleString()}`, true)
        .addField("Dominations Won", `<:rw_white_star:622579023364751361> ${data.dominationsWon.toLocaleString()}`, true)
        .addField("Members", `<:rw_troops:622260065499349032> ${data.membersCount}/${teamLimit}`, true)
        .addField("Leader", `<:rw_captain:622580325884624897> ${leader.name || undefined}`)
        .addField("Top Members", scoreLB, true)
        .addField("Top Staff", staffLB_sorted, true);


    message.reply({embed:msg}).catch(err => {});
}

function saveError(client, message, tag)
{
    let msg = new Discord.RichEmbed()
        .setColor(config.error_color)
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
        .addField("Invalid tag provided", "Please make sure you're entering a valid team tag.\n\n" +
            "**Valid Numbers:** `0, 2, 8, 9`\n" +
            "**Valid Letters:** `C, G, J, L, P, Q, R, U, V, Y`");

    message.reply({embed:msg}).catch(error => { client.emit("error", error) });
    message.channel.stopTyping();
}
