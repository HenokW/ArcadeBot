const sqlHand = require("../util/sql_handler.js");
const apiReq = require("../util/apiRequest.js");
const config = require("../config.json");
const util = require("../util/util.js");
const snekfetch = require('snekfetch');
const Discord = require("discord.js");
const canvas = require("canvas");

const canvas_width = 850;
const canvas_height = 500;
const compare_bg = './resources/rw_compare.png';
const arr_up_img = './resources/game_assets/rw_up.png';
const arr_down_img = './resources/game_assets/rw_down.png';

const arrUp = '<:rw_up:622578151234732051>';
const arrDown = '<:rw_down:622578151339589632>';


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

module.exports.run = async function(client, message, args)
{
    message.channel.startTyping();

    if(!args[0])
        return util.sendErrorMessage(message, "Please mention, or enter the player tag of the user you would like to compare your stats with.", "REPLY");
    else
    {
        let userData = await sqlHand.getData(client, `./SQL/playersDB.db3`, "data", "id", message.author.id);
        if(!userData|| !userData.tag)
        {
            message.channel.stopTyping();
            return util.missingTagError(client, message, false);
        }

        if(message.mentions.users.first())
        {
            let user2Data = await sqlHand.getData(client, `./SQL/playersDB.db3`, "data", "id", message.mentions.users.first().id);
            if(!user2Data || !user2Data.tag)
            {
                message.channel.stopTyping();
                return util.missingTagError(client, message, true);
            }


            let playerData = await apiReq.request(client, message, {endpoint: "player/", tag: userData.tag});
            let player2Data = await apiReq.request(client, message, {endpoint: "player/", tag: user2Data.tag});

            message.channel.stopTyping();
            compareStats(client, message, playerData, player2Data);
        }
        else
        {
            let tag = util.tagCheck(args.shift());
            if(!tag) return saveError(client, message, tag);

            let playerData = await apiReq.request(client, message, {endpoint: "player/", tag: userData.tag});
            let player2Data = await apiReq.request(client, message, {endpoint: "player/", tag: tag});

            if(!player2Data || player2Data.error)
                return util.saveError(client, message);

            message.channel.stopTyping();
            compareStats(client, message, playerData, player2Data);
        }
    }
}

async function compareStats(client, message, myData, uData)
{
    statCanvas = canvas.createCanvas(canvas_width, canvas_height);
	ctx = statCanvas.getContext('2d');

    let canvasBG = await canvas.loadImage(compare_bg);
    //BG
	ctx.clearRect(0, 0, canvas_width, canvas_height);
	ctx.drawImage(canvasBG, 0, 0, statCanvas.width, statCanvas.height);

    ctx.font = '23px Industry Black';
	ctx.textAlign = 'center';
    ctx.lineWidth = 1.3;

    //Player names
    ctx.fillStyle = '#000000';
    ctx.fillText(myData.name, Math.floor(statCanvas.width / 2) - 60, 20 + 3);
    ctx.fillText(uData.name, Math.floor(statCanvas.width / 2) + 40, statCanvas.height - (20 - 1));
    ctx.fillStyle = '#ffffff';
    ctx.fillText(myData.name, Math.floor(statCanvas.width / 2) - 60, 20);
    ctx.strokeText(myData.name, Math.floor(statCanvas.width / 2) - 60, 20);
    ctx.fillText(uData.name, Math.floor(statCanvas.width / 2) + 40, statCanvas.height - 20 - 2);
    ctx.strokeText(uData.name, Math.floor(statCanvas.width / 2) + 40, statCanvas.height - 20 - 2);

    //Tag
    ctx.font = '15px Industry Black';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#000000';
    ctx.fillText(`#${myData.tag}`, Math.floor(statCanvas.width / 2) - 60, 37 + 3);
    ctx.fillText(`#${uData.tag}`, Math.floor(statCanvas.width / 2) + 40, statCanvas.height - (37 - 34));
    ctx.fillStyle = '#99ffff';
    ctx.fillText(`#${myData.tag}`, Math.floor(statCanvas.width / 2) - 60, 37);
    ctx.strokeText(`#${myData.tag}`, Math.floor(statCanvas.width / 2) - 60, 37);
    ctx.fillText(`#${uData.tag}`, Math.floor(statCanvas.width / 2) + 40, statCanvas.height - (37 - 31));
    ctx.strokeText(`#${uData.tag}`, Math.floor(statCanvas.width / 2) + 40, statCanvas.height - (37 - 31));

    let { body: p1League } = await snekfetch.get(myData.league.imageUrl);
    let { body: p2League } = await snekfetch.get(uData.league.imageUrl);
    let p1LeagueIcon = await canvas.loadImage(p1League);
    let p2LeagueIcon = await canvas.loadImage(p2League);
    ctx.drawImage(p1LeagueIcon, Math.floor(statCanvas.width / 2) - 197, 0, 70, 70); //X, Y, Constrain X, Constrain Y
    ctx.drawImage(p2LeagueIcon, Math.floor(statCanvas.width / 2) + 107, statCanvas.height - 70, 70, 70); //X, Y, Constrain X, Constrain Y




    var testImage = new Discord.Attachment(statCanvas.toBuffer(), 'CompareStats.png');
	message.channel.stopTyping();
	message.channel.send(message.author, testImage);

    // let seasonPoints = [0, 0];
    // if(myData.variables.seasonPoints != undefined) seasonPoints[0] = myData.variables.seasonPoints;
    // if(uData.variables.seasonPoints != undefined) seasonPoints[1] = uData.variables.seasonPoints;
    //
    // let msg = new Discord.RichEmbed()
    //     .setColor(config.success_color)
    //     .setAuthor(`${myData.name} || #${myData.tag}`, `https://www.rushstats.com/assets/level/${myData.expLevel}.png`)
    //     .setTitle(`${util.getLeagueMedal(myData.stars)}${myData.name} \`#${myData.tag}\` |vs| \`#${uData.tag}\` ${uData.name}${util.getLeagueMedal(uData.stars)}`)
    //     .addField(`Compared Stars`, `${util.getLeagueMedal(myData.stars)} **\`${myData.stars.toLocaleString()}\`** ${(myData.stars - uData.stars) <= 0? arrDown : arrUp} **\`${uData.stars.toLocaleString()}\`** ${util.getLeagueMedal(uData.stars)}`, false)
    //     .addField(`Compared Lifetime Stars`, `<:rw_gold_star:622260094775853066> **\`${(myData.variables.attackStars + myData.variables.defenseStars).toLocaleString()}\`** ${((myData.variables.attackStars + myData.variables.defenseStars) - (uData.variables.attackStars + uData.variables.defenseStars)) <= 0? arrDown : arrUp} **\`${(uData.variables.attackStars + uData.variables.defenseStars).toLocaleString()}\`**`, true)
    //     .addField(`Compared Season Points`, `<:rw_medal:622260064937312256> **\`${seasonPoints[0].toLocaleString()}\`** ${(seasonPoints[0] - seasonPoints[1]) <= 0? arrDown : arrUp} **\`${seasonPoints[1].toLocaleString()}\`**`, true)
    //     .addField(`Compared HQ Levels`, `${hqEmojis[myData.variables.hqLevel]} **\`${myData.variables.hqLevel}\`** ${(myData.variables.hqLevel - uData.variables.hqLevel) <= 0? arrDown : arrUp} **\`${uData.variables.hqLevel}\`**`, true)
    //     .addField(`Compared Chopper Levels`, `<:rw_chopper:622268961077198869> **\`${myData.variables.chopperLevel}\`** ${(myData.variables.chopperLevel - uData.variables.chopperLevel) <= 0? arrDown : arrUp} **\`${uData.variables.chopperLevel}\`**`, true)
    //
    //     .addField(`Compared Dom Attacks`, `<:rw_troops:622260065499349032> **\`${myData.variables.totalDominationAttacks.toLocaleString()}\`** ${(myData.variables.totalDominationAttacks - uData.variables.totalDominationAttacks) <= 0? arrDown : arrUp} **\`${uData.variables.totalDominationAttacks.toLocaleString()}\`**`, true)
    //     .addField(`Compared Dom Stars`, `<:rw_white_star:622579023364751361> **\`${myData.variables.dominationStars.toLocaleString()}\`** ${(myData.variables.dominationStars - uData.variables.dominationStars) <= 0? arrDown : arrUp} **\`${uData.variables.dominationStars.toLocaleString()}\`**`, true)
    //
    //     .addField(`Compared Attack Stars`, `<:rw_attack_stars:624046529937801283> **\`${myData.variables.attackStars.toLocaleString()}\`** ${(myData.variables.attackStars - uData.variables.attackStars) <= 0? arrDown : arrUp} **\`${uData.variables.attackStars.toLocaleString()}\`**`, true)
    //     .addField(`Compared Defense Stars`, `<:rw_defense_stars:624046530881519616> **\`${myData.variables.defenseStars.toLocaleString()}\`** ${(myData.variables.defenseStars - uData.variables.defenseStars) <= 0? arrDown : arrUp} **\`${uData.variables.defenseStars.toLocaleString()}\`**`, true)
    //     .addField(`Compared Attacks`, `<:rw_bullets:622260067013492737> **\`${myData.variables.totalAttacks.toLocaleString()}\`** ${(myData.variables.totalAttacks - uData.variables.totalAttacks) <= 0? arrDown : arrUp} **\`${uData.variables.totalAttacks.toLocaleString()}\`**`, true)
    //     .addField(`Compared Attacks Won`, `<:rw_gun:622260073724641291> **\`${myData.variables.totalAttacksWon.toLocaleString()}\`** ${(myData.variables.totalAttacksWon - uData.variables.totalAttacksWon) <= 0? arrDown : arrUp} **\`${uData.variables.totalAttacksWon.toLocaleString()}\`**`, true)
    //     .addField(`Compared Attacks Lost`, `<:rw_empty_star:622260080850632724> **\`${myData.variables.totalAttacksLost.toLocaleString()}\`** ${(myData.variables.totalAttacksLost - uData.variables.totalAttacksLost) <= 0? arrDown : arrUp} **\`${uData.variables.totalAttacksLost.toLocaleString()}\`**`, true)
    //     .addField(`Compared Defenses`, `<:rw_tri_shields:622260073963454479> **\`${(myData.variables.totalDefensesWon + myData.variables.totalDefensesLost).toLocaleString()}\`** ${((myData.variables.totalDefensesWon + myData.variables.totalDefensesLost) - (uData.variables.totalDefensesWon + uData.variables.totalDefensesLost)) <= 0? arrDown : arrUp} **\`${(uData.variables.totalDefensesWon + uData.variables.totalDefensesLost).toLocaleString()}\`**`, true)
    // message.reply({embed:msg});
}
