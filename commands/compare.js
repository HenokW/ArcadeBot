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
const arr_up_img_file = './resources/game_assets/rw_up.png';
const arr_down_img_file = './resources/game_assets/rw_down.png';

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
    let arrUpIcon = await canvas.loadImage(arr_up_img_file);
    let arrDownIcon = await canvas.loadImage(arr_down_img_file);
    //BG
	ctx.clearRect(0, 0, canvas_width, canvas_height);
	ctx.drawImage(canvasBG, 0, 0, statCanvas.width, statCanvas.height);

    ctx.font = '23px Industry Black';
	ctx.textAlign = 'center';
    ctx.lineWidth = 1.3;

    //Names
    drawCustomText(ctx, {font: 'italic 23px Industry Black', color: "#ffffff", text: myData.name, width: 20, x: Math.floor(statCanvas.width / 2) - 60, y: 20 + 3}); //Lifetime Stars
    drawCustomText(ctx, {font: 'italic 23px Industry Black', color: "#ffffff", text: uData.name, width: 20, x: Math.floor(statCanvas.width / 2) + 40, y: statCanvas.height - (23 - 1)}); //Lifetime Stars

    //Tags
    drawCustomText(ctx, {font: 'italic 15px Industry Black', color: "#99ffff", text: `#${myData.tag}`, x: Math.floor(statCanvas.width / 2) - 60, y: 37 + 3});
    drawCustomText(ctx, {font: 'italic 15px Industry Black', color: "#99ffff", text: `#${uData.tag}`, x: Math.floor(statCanvas.width / 2) + 40, y: statCanvas.height - (40 - 34)});

    let { body: p1League } = await snekfetch.get(myData.league.imageUrl);
    let { body: p2League } = await snekfetch.get(uData.league.imageUrl);
    let p1LeagueIcon = await canvas.loadImage(p1League);
    let p2LeagueIcon = await canvas.loadImage(p2League);
    ctx.drawImage(p1LeagueIcon, Math.floor(statCanvas.width / 2) - 197, 0, 70, 70); //X, Y, Constrain X, Constrain Y
    ctx.drawImage(p2LeagueIcon, Math.floor(statCanvas.width / 2) + 107, statCanvas.height - 70, 70, 70); //X, Y, Constrain X, Constrain Y

    // let { body: p1Level } = await snekfetch.get(myData.expLevel <= 100? `https://www.rushstats.com/assets/level/${myData.expLevel}.png` : `https://www.rushstats.com/assets/level/100.png` ).catch(err => {});
    // let { body: p2Level } = await snekfetch.get(uData.expLevel <= 100? `https://www.rushstats.com/assets/level/${uData.expLevel}.png` : `https://www.rushstats.com/assets/level/100.png` ).catch(err => {});
    // let p1LevelIcon = await canvas.loadImage(p1Level).catch(err => {});
    // let p2LevelIcon = await canvas.loadImage(p2Level).catch(err => {});
    // ctx.drawImage(p1LevelIcon, Math.floor(statCanvas.width / 2) - 75, 50, 30, 30); //X, Y, Constrain X, Constrain Y
    // ctx.drawImage(p2LevelIcon, Math.floor(statCanvas.width / 2) + 25, statCanvas.height - 75, 30, 30); //X, Y, Constrain X, Constrain Y

    //1st column
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.stars || 0) - (uData.stars  || 0)).toLocaleString()}`, x: 65, y: Math.floor(statCanvas.height / 4) - 10}); //Stars
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.hqLevel || 0) - (uData.variables.hqLevel || 0)).toLocaleString()}`, x: 65, y: Math.floor(statCanvas.height / 2) - 33}); //HQ
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.totalDominationAttacks || 0) - (uData.variables.totalDominationAttacks || 0)).toLocaleString()}`, x: 65, y: Math.floor(statCanvas.height / 2) + Math.floor(statCanvas.height / 4) - 55}); //Dom Attacks
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.attackStars || 0) - (uData.variables.attackStars || 0)).toLocaleString()}`, x: 65, y: statCanvas.height - 77}); //Attack Stars
    ctx.drawImage( ((myData.stars || 0) - (uData.stars  || 0)) < 0? arrDownIcon : arrUpIcon, 54, Math.floor(statCanvas.height / 4) - 5, 25, 25 );
    ctx.drawImage( ((myData.variables.hqLevel || 0) - (uData.variables.hqLevel  || 0)) < 0? arrDownIcon : arrUpIcon, 54, Math.floor(statCanvas.height / 2) - 28, 25, 25);
    ctx.drawImage( ((myData.variables.totalDominationAttacks || 0) - (uData.variables.totalDominationAttacks || 0)) < 0? arrDownIcon : arrUpIcon, 54, Math.floor(statCanvas.height / 2) + Math.floor(statCanvas.height / 4) - 50, 25, 25);
    ctx.drawImage( ((myData.variables.attackStars || 0) - (uData.variables.attackStars || 0)) < 0? arrDownIcon : arrUpIcon, 54, statCanvas.height - 72, 25, 25);

    //2nd column
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs(( (myData.variables.attackStars + myData.variables.defenseStars || 0) ) - ((uData.variables.attackStars + uData.variables.defenseStars || 0) )).toLocaleString()}`, x: 191, y: Math.floor(statCanvas.height / 4) - 10}); //Lifetime Stars
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.chopperLevel || 0) - (uData.variables.chopperLevel || 0)).toLocaleString()}`, x: 191, y: Math.floor(statCanvas.height / 2) - 33}); //Chopper
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.dominationStars || 0) - (uData.variables.dominationStars || 0)).toLocaleString()}`, x: 191, y: Math.floor(statCanvas.height / 2) + Math.floor(statCanvas.height / 4) - 55}); //Dom Stars
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.defenseStars || 0) - (uData.variables.defenseStars || 0)).toLocaleString()}`, x: 191, y: statCanvas.height - 77}); //Defense Stars
    ctx.drawImage( (( (myData.variables.attackStars + myData.variables.defenseStars || 0) ) - ((uData.variables.attackStars + uData.variables.defenseStars || 0) )) < 0? arrDownIcon : arrUpIcon, 180, Math.floor(statCanvas.height / 4) - 5, 25, 25);
    ctx.drawImage( ((myData.variables.chopperLevel || 0) - (uData.variables.chopperLevel || 0)) < 0? arrDownIcon : arrUpIcon, 180, Math.floor(statCanvas.height / 2) - 28, 25, 25);
    ctx.drawImage( ((myData.variables.dominationStars || 0) - (uData.variables.dominationStars || 0)) < 0? arrDownIcon : arrUpIcon, 180, Math.floor(statCanvas.height / 2) + Math.floor(statCanvas.height / 4) - 50, 25, 25);
    ctx.drawImage( ((myData.variables.defenseStars || 0) - (uData.variables.defenseStars || 0)) < 0? arrDownIcon : arrUpIcon, 180, statCanvas.height - 72, 25, 25);

    //3rd column
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.seasonPoints || 0) - (uData.variables.seasonPoints || 0)).toLocaleString()}`, x: 317, y: statCanvas.height - 77}); //Season Points
    ctx.drawImage( ((myData.variables.seasonPoints || 0) - (uData.variables.seasonPoints || 0)) < 0? arrDownIcon : arrUpIcon, 306, statCanvas.height - 72, 25, 25);
    //---------------------------------
    //5th column
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.totalAttacks || 0) - (uData.variables.totalAttacks || 0)).toLocaleString()}`, x: 535, y: Math.floor(statCanvas.height / 4) - 10}); //Attacks
    ctx.drawImage( ((myData.variables.totalAttacks || 0) - (uData.variables.totalAttacks || 0)) < 0? arrDownIcon : arrUpIcon, 524, Math.floor(statCanvas.height / 4) - 5, 25, 25);

    //6th column
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.totalAttacksWon || 0) - (uData.variables.totalAttacksWon || 0)).toLocaleString()}`, x: 661, y: Math.floor(statCanvas.height / 4) - 10}); //Attacks Won
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs(( (myData.variables.totalDefensesWon + myData.variables.totalDefensesLost) || 0) - ( (uData.variables.totalDefensesWon + uData.variables.totalDefensesLost) || 0)).toLocaleString()}`, x: 661, y: Math.floor(statCanvas.height / 2) - 33}); //Defenses
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.totalGoldDonated || 0) - (uData.variables.totalGoldDonated || 0)).toLocaleString()}`, x: 661, y: Math.floor(statCanvas.height / 2) + Math.floor(statCanvas.height / 4) - 55}); //Gold donated
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.totalFreeBoxesOpened || 0) - (uData.variables.totalFreeBoxesOpened || 0)).toLocaleString()}`, x: 661, y: statCanvas.height - 77}); //Free boxes
    ctx.drawImage( ((myData.variables.totalAttacksWon || 0) - (uData.variables.totalAttacksWon || 0)) < 0? arrDownIcon : arrUpIcon, 650, Math.floor(statCanvas.height / 4) - 5, 25, 25);
    ctx.drawImage( (( (myData.variables.totalDefensesWon + myData.variables.totalDefensesLost) || 0) - ( (uData.variables.totalDefensesWon + uData.variables.totalDefensesLost) || 0))< 0? arrDownIcon : arrUpIcon, 650, Math.floor(statCanvas.height / 2) - 28, 25, 25);
    ctx.drawImage( ((myData.variables.totalGoldDonated || 0) - (uData.variables.totalGoldDonated || 0)) < 0? arrDownIcon : arrUpIcon, 650, Math.floor(statCanvas.height / 2) + Math.floor(statCanvas.height / 4) - 50, 25, 25);
    ctx.drawImage( ((myData.variables.totalFreeBoxesOpened || 0) - (uData.variables.totalFreeBoxesOpened || 0)) < 0? arrDownIcon : arrUpIcon, 650, statCanvas.height - 72, 25, 25);

    //7th column
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.totalAttacksLost || 0) - (uData.variables.totalAttacksLost || 0)).toLocaleString()}`, x: 787, y: Math.floor(statCanvas.height / 4) - 10}); //Attacks lost
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.totalDefensesWon || 0) - (uData.variables.totalDefensesWon || 0)).toLocaleString()}`, x: 787, y: Math.floor(statCanvas.height / 2) - 33}); //Defenses Won
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.totalGoldLooted || 0) - (uData.variables.totalGoldLooted || 0)).toLocaleString()}`, x: 784, y: Math.floor(statCanvas.height / 2) + Math.floor(statCanvas.height / 4) - 55}); //Gold Looted
    drawCustomText(ctx, {font: 'italic 20.5px Industry Black', color: "#ffffff", text: `${Math.abs((myData.variables.obstaclesRemoved || 0) - (uData.variables.obstaclesRemoved || 0)).toLocaleString()}`, x: 784, y: statCanvas.height - 77}); //Obstacles removed
    ctx.drawImage( ((myData.variables.totalAttacksLost || 0) - (uData.variables.totalAttacksLost || 0)) < 0? arrDownIcon : arrUpIcon, 776, Math.floor(statCanvas.height / 4) - 5, 25, 25);
    ctx.drawImage( ((myData.variables.totalDefensesWon || 0) - (uData.variables.totalDefensesWon || 0)) < 0? arrDownIcon : arrUpIcon, 776, Math.floor(statCanvas.height / 2) - 28, 25, 25);
    ctx.drawImage( ((myData.variables.totalGoldLooted || 0) - (uData.variables.totalGoldLooted || 0)) < 0? arrDownIcon : arrUpIcon, 773, Math.floor(statCanvas.height / 2) + Math.floor(statCanvas.height / 4) - 50, 25, 25);
    ctx.drawImage( ((myData.variables.obstaclesRemoved || 0) - (uData.variables.obstaclesRemoved || 0)) < 0? arrDownIcon : arrUpIcon, 773, statCanvas.height - 72, 25, 25);


    var testImage = new Discord.Attachment(statCanvas.toBuffer(), 'CompareStats.png');
	message.channel.stopTyping();
	message.channel.send(message.author, testImage);
}

function drawCustomText(ctx, options)
{
    if(!options.font || !options.color || !options.text || !options.x || !options.y) return;

    ctx.font = options.font;
	ctx.textAlign = 'center';
    ctx.lineWidth = 1.3;
    ctx.fillStyle = 'black';

    ctx.fillText(options.text, options.x, options.y + 3, 160);
    ctx = drawStroked(ctx, options);

    return ctx;
}

function drawStroked(ctx, options)
{
    ctx.font = options.font;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1.5 * 2;

    ctx.strokeText(options.text, options.x, options.y, 160);
    ctx.fillStyle = options.color;
    ctx.fillText(options.text, options.x, options.y, 160);

    return ctx
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
