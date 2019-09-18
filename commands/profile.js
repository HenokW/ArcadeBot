const sqlHand = require("../util/sql_handler.js");
const apiReq = require("../util/apiRequest.js");
const config = require("../config.json");
const util = require("../util/util.js");
const Discord = require("discord.js");

const hqEmojis = {
    "1": "<:rw_hq_1:622268478023270430>",
    "2": "<:rw_hq_2:622268479885803550>",
    "3": "<:rw_hq_3:622268480153976853>",
    "4": "<:rw_hq_4:622268481034911744>",
    "5": "<:rw_hq_5:622268481106346012>",
    "6": "<:rw_hq_6:622268481005551636>",
    "7": "<:rw_hq_7:622268482486272000>",
    "8": "<:rw_hq_8:622268482767028244>"
}


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

const commanderCount = 5;
const defenseCount = 14;
const abilityCount = 7;
const troopCount = 17;

//https://www.rushstats.com/assets/level/${level_num}.png
module.exports.run = async function(client, message, args)
{
    message.channel.startTyping();
    let userData = await sqlHand.getData(client, `./SQL/playersDB.db3`, "data", "id", message.author.id);
    if(!userData || !userData.tag)
    {
        message.channel.stopTyping();
        return util.missingTagError(client, message);
    }

    let requestData = await apiReq.request(client, message, {endpoint: "player/", tag: userData.tag});

    message.channel.stopTyping();
    sendProfileMessage(client, message, requestData);
}

function sendProfileMessage(client, message, data)
{
    let seasonPoints = 0;
    if(data.variables.seasonPoints != undefined) seasonPoints = data.variables.seasonPoints;

    //Grabbing current league medal
    let star = "<:rw_league_0:622260074215374850>"
    let starCount = data.stars;
    if(starCount >= 10000) star = "<:rw_league_12:622262584837537792>";
    else if(starCount >= 8000) star = "<:rw_league_11:622260103839481866>";
    else if(starCount >= 6500) star = "<:rw_league_10:622260104342929413>";
    else if(starCount >= 5200) star = "<:rw_league_9:622260102669533196>";
    else if(starCount >= 4000) star = "<:rw_league_8:622260100567924747>";
    else if(starCount >= 3000) star = "<:rw_league_7:622260098814836736>";
    else if(starCount >= 2400) star = "<:rw_league_6:622260096432603223>";
    else if(starCount >= 1800) star = "<:rw_league_5:622260095996395540>";
    else if(starCount >= 1200) star = "<:rw_league_4:622260097048903720>";
    else if(starCount >= 600) star = "<:rw_league_3:622260093253058600>";
    else if(starCount >= 200) star = "<:rw_league_2:622260097426391040>";
    else if(starCount >= 10) star = "<:rw_league_1:622260095266324510>";

    //Getting available cards
    //---------
    let defenseText = "";
    let myDefenses = data.defenses || [];
    for(let i = 0; i < myDefenses.length; i++) {
        if(!util.id_to_emote[myDefenses[i].scId]) defenseText += util.id_to_emote["0"]; //Unknown emote
        else defenseText += util.id_to_emote[myDefenses[i].scId];
    }

    let abilityText = "";
    let myAbilities = data.airdrops || [];
    for(let i = 0; i < myAbilities.length; i++) {
        if(!util.id_to_emote[myAbilities[i].scId]) abilityText += util.id_to_emote["0"]; //Unknown emote
        else abilityText += util.id_to_emote[myAbilities[i].scId];
    }

    let troopText = "";
    let myTroops = data.troops || [];
    for(let i = 0; i < myTroops.length; i++) {
        if(!util.id_to_emote[myTroops[i].scId]) troopText += util.id_to_emote["0"]; //Unknown emote
        else troopText += util.id_to_emote[myTroops[i].scId];
    }

    let commanderText = "";
    let myCommanders = data.commanders || [];
    for(let i = 0; i < myCommanders.length; i++) {
        if(!util.id_to_emote[myCommanders[i].scId]) commanderText += util.id_to_emote["0"]; //Unknown emote
        else commanderText += util.id_to_emote[myCommanders[i].scId];
    }
    //-----------

    const greenTimer = new Discord.Attachment('./resources/game_assets/green_timer.png', 'green_timer.png');
    const leagueIcon = new Discord.Attachment(leagueImgs[star], 'league_icon.png');
    let msg = new Discord.RichEmbed()
        .setColor(config.success_color)
        .setAuthor(`${data.name} #${data.tag}`, `https://www.rushstats.com/assets/level/${data.expLevel}.png`)
        .attachFiles([leagueIcon, greenTimer])
        .setThumbnail('attachment://league_icon.png')
        .addField("Current Stars", `${star} ${data.stars}`, true)
        .addField("Lifetime Stars", `<:rw_gold_star:622260094775853066> ${data.variables.attackStars + data.variables.defenseStars}`, true)
        .addField("Season Points", `<:rw_medal:622260064937312256> ${seasonPoints}`, true)
        .addField(`HQ Level`, `${hqEmojis[data.variables.hqLevel]} ${data.variables.hqLevel}`, true)
        .addField("Chopper Level", `<:rw_chopper:622268961077198869> ${data.variables.chopperLevel}`, true)

        .addField("Domination Attacks", `<:rw_troops:622260065499349032> ${data.variables.totalDominationAttacks || 0}`, true)
        .addField("Domination Stars", `<:rw_gold_star:622260094775853066> ${data.variables.dominationStars || 0}`, true)

        .addField("Total Attacks", `<:rw_bullets:622260067013492737> ${data.variables.totalAttacks}`, true)
        .addField("Attacks Won", `<:rw_gun:622260073724641291> ${data.variables.totalAttacksWon}`, true)
        .addField("Attacks Lost", `<:rw_empty_star:622260080850632724> ${data.variables.totalAttacksLost}`, true)
        .addField("Total Defenses", `<:rw_tri_shields:622260073963454479> ${data.variables.totalDefensesWon + data.variables.totalDefensesLost}`, true)
        .addField("Defenses Won", `<:rw_shield:622260063867895848> ${data.variables.totalDefensesWon}`, true)
        .addField("Defenses Lost", `<:rw_shield_dam:622260068985077779> ${data.variables.totalDefensesLost}`, true)

        .addField("Gold Looted", `<:rw_gold:622260066271363072> ${data.variables.totalGoldLooted}`, true)
        .addField("Gold Donated", `<:rw_give_gold:622272799549030401> ${data.variables.totalGoldDonated}`, true);

        if(data.team) msg.addField(data.team.role, `<:rw_0:622319032221040650> ${data.team.name} | ${data.team.tag}`, true);
        else {
            msg.addField("Team", `<:rw_0:622319032221040650> Not a member`, true);
        }

        msg.addField("Free Boxes Opened", `<:rw_free_box:622121677907820547> ${data.variables.totalFreeBoxesOpened}`, true)
        .addField("Obstacles Removed", `<:rw_crate:622299162557415464> ${data.variables.obstaclesRemoved}`, true)

        .addBlankField()
        .addField(`Commanders Unlocked`, `${commanderText} **\`${myCommanders.length}/${commanderCount}\`**`, false)
        .addField(`Troops Unlocked`, `${troopText} **\`${myTroops.length}/${troopCount}\`**`, false)
        .addField(`Abilities Unlocked`, `${abilityText} **\`${myAbilities.length}/${abilityCount}\`**`, false)
        .addField(`Defenses Unlocked`, `${defenseText} **\`${myDefenses.length}/${defenseCount}\`**`, false)
        .setFooter(`Last Seen Online: ${data.timeSinceLastActivity}`, 'attachment://green_timer.png');

    message.reply({embed:msg}).catch(err => {});
}
