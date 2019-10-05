const sqlHand = require("../util/sql_handler.js");
const apiReq = require("../util/apiRequest.js");
const config = require("../config.json");
const util = require("../util/util.js");
const Discord = require("discord.js");

//This is super weird, doing this just to save lines of code
const leagueImgs = {
    "<:rw_league_0:622260074215374850>": "./resources/game_assets/leagues/league_0.png",
    "<:rw_league_1:622260095266324510>": "./resources/game_assets/leagues/league_1.png",
    "<:rw_league_2:622260097426391040>": "./resources/game_assets/leagues/league_2.png",
    "<:rw_league_3:622260093253058600>": "./resources/game_assets/leagues/league_3.png",
    "<:rw_league_4:622260097048903720>": "./resources/game_assets/leagues/league_4.png",
    "<:rw_league_5:622260095996395540>": "./resources/game_assets/leagues/league_5.png",
    "<:rw_league_6:622260096432603223>": "./resources/game_assets/leagues/league_6.png",
    "<:rw_league_7:622260098814836736>": "./resources/game_assets/leagues/league_7.png",
    "<:rw_league_8:622260100567924747>": "./resources/game_assets/leagues/league_8.png",
    "<:rw_league_9:622260102669533196>": "./resources/game_assets/leagues/league_9.png",
    "<:rw_league_10:622260104342929413>": "./resources/game_assets/leagues/league_10.png",
    "<:rw_league_11:622260103839481866>": "./resources/game_assets/leagues/league_11.png",
    "<:rw_league_12:622262584837537792>": "./resources/game_assets/leagues/league_12.png"
}

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

        let requestData = await apiReq.request(client, message, {endpoint: "player/", tag: userData.tag});

        message.channel.stopTyping();
        sendDomMessage(client, message, requestData);
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

            let requestData = await apiReq.request(client, message, {endpoint: "player/", tag: userData.tag});

            message.channel.stopTyping();
            sendDomMessage(client, message, requestData);
        }
        else
        {
            let tag = util.tagCheck(args.shift());
            if(!tag) return saveError(client, message, tag);

            let requestData = await apiReq.request(client, message, {endpoint: "player/", tag: tag});

            if(!requestData || requestData.error)
                return util.saveError(client, message);

            message.channel.stopTyping();
            sendDomMessage(client, message, requestData);
        }
    }
}

async function sendDomMessage(client, message, data)
{
    let seasonPoints = 0;
    if(data.variables.seasonPoints != undefined) seasonPoints = data.variables.seasonPoints;

    let commanders = data.commanders || undefined;
    let abilities = data.airdrops || undefined;
    let defenses = data.defenses || undefined;
    let troops = data.troops || undefined;

    if(commanders) await commanders.sort((a,b) => b.level - a.level);
    if(abilities) await abilities.sort((a,b) => b.level - a.level);
    if(defenses) await defenses.sort((a,b) => b.level - a.level);
    if(troops) await troops.sort((a,b) => b.level - a.level);

    //----
    let temp = "";
    if(commanders)
        for(let i = 0; i < commanders.length; i++)
            temp += `${util.id_to_emote[commanders[i].scId]}**\`${commanders[i].level}\`**    `;
    commanders = temp;

    temp = ""
    if(abilities)
        for(let i = 0; i < abilities.length; i++)
            temp += `${util.id_to_emote[abilities[i].scId]}**\`${abilities[i].level}\`**    `;
    abilities = temp;

    temp = ""
    if(defenses)
        for(let i = 0; i < defenses.length; i++)
            temp += `${util.id_to_emote[defenses[i].scId]}**\`${defenses[i].level}\`**    `;
    defenses = temp;

    temp = ""
    if(troops)
        for(let i = 0; i < troops.length; i++)
            temp += `${util.id_to_emote[troops[i].scId]}**\`${troops[i].level}\`**    `;
    troops = temp;
    //----

    const dom = new Discord.Attachment('./resources/game_assets/ui_sprite_386.png', 'domination.png');
    let msg = new Discord.RichEmbed()
        .setColor(config.success_color)
        .setAuthor(`${data.name} | #${data.tag}`, `https://www.rushstats.com/assets/level/${data.expLevel}.png`)
        .attachFile(dom)
        .setThumbnail('attachment://domination.png')
        .addField("Current Stars", `${util.getLeagueMedal(data.stars)} ${data.stars.toLocaleString()}`, true)
        .addField("Lifetime Stars", `<:rw_gold_star:622260094775853066> ${(data.variables.attackStars + data.variables.defenseStars || 0).toLocaleString()}`, true)
        .addField("Season Points", `<:rw_medal:622260064937312256> ${seasonPoints.toLocaleString()}`, true)
        .addField("Total Dominations", `<:rw_domination:624055931612692500> ${(data.variables.dominationTeamWinCount || 0) + (data.variables.dominationTeamLoseCount || 0)}`, true)
        .addField("Total Attacks", `<:target:629706290821595137> ${data.variables.totalDominationAttacks || 0}`, true)
        .addField("Attacks Won", `<:rw_gun:622260073724641291> ${data.variables.dominationAttacksWon || 0}`, true)
        .addField("Attacks Lost", `<:rw_empty_star:622260080850632724> ${data.variables.dominationAttacksLost || 0}`, true)
        .addField("Wins", `<:rw_up:622578151234732051> ${data.variables.dominationTeamWinCount || 0} (**${Number.parseFloat((((data.variables.dominationTeamWinCount || 0) / ((data.variables.dominationTeamWinCount || 0) + (data.variables.dominationTeamLoseCount || 0))) || 0) * 100).toPrecision(4)}%**)`, true)
        .addField("Losses", `<:rw_down:622578151339589632> ${data.variables.dominationTeamLoseCount || 0} (**${Number.parseFloat((((data.variables.dominationTeamLoseCount || 0) / ((data.variables.dominationTeamWinCount || 0) + (data.variables.dominationTeamLoseCount || 0))) || 0) * 100).toPrecision(4)}%**)`, true)
        .addField("Stars Earned", `<:rw_white_star:622579023364751361> ${(data.variables.dominationStars || 0).toLocaleString()}`, true)
        .addField("Stars Missed", `<:rw_empty_star:622260080850632724> ${((data.variables.totalDominationAttacks || 0) * 3) - (data.variables.dominationStars || 0)}`, true)
        .addField("Gold Looted", `<:rw_gold:622260066271363072> ${data.variables.dominationGoldsLooted || 0}`, true)
        .setFooter("*Troop and Defense information may be off")
        .addBlankField();

    if(commanders)
        msg.addField(`Commanders*`, commanders, false);
    if(abilities)
        msg.addField(`Abilities*`, abilities, false);
    if(defenses)
        msg.addField(`Defenses*`, defenses, false);
    if(troops)
        msg.addField(`Troops*`, troops, false);

    message.reply({embed:msg}).catch(err => {});
}

function saveError(client, message, tag)
{
    const errImg = new Discord.Attachment('./resources/invalid_tag_img.png', 'errorImg.png');
    let msg = new Discord.RichEmbed()
        .setColor(config.error_color)
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
        .addField("Invalid tag provided", "Please make sure you're entering a valid player tag. You can find your tag in-game in your player profile.\n\n" +
            "**Valid Numbers:** `0, 2, 8, 9`\n" +
            "**Valid Letters:** `C, G, J, L, P, Q, R, U, V, Y`")
        .attachFile(errImg)
        .setImage('attachment://errorImg.png');

    message.reply({embed:msg}).catch(error => { client.emit("error", error) });
    message.channel.stopTyping();
}
