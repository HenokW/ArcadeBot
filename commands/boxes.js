const sqlHand = require("../util/sql_handler.js");
const boxCycle = require("../api/rw-cycle.json");
const apiReq = require("../util/apiRequest.js");
const config = require("../config.json");
const util = require("../util/util.js");
const Discord = require("discord.js");

const cycleLimit = 210;
const totalBoxes = 3; //Common, Rare, Epic
const boxDisplayLength = 10; //How many boxes in a row will be returned

const boxArr = {
    "Common": "<:rw_common_box:622121677869809666>",
    "Rare": "<:rw_rare_box:622121678415331348>",
    "Epic": "<:rw_epic_box:622121680659283979>",
    "Arrow": "<:rw_right_arr:622137959042514946>"
}

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
    let cycleCount = requestData.variables.cycleOffset + 1;

    //If their cycleCount is over the provded limit, bring them down inside the bounds
    if(cycleCount > cycleLimit) cycleCount = cycleCount % cycleLimit;

    let futureBoxes = {};
    let tempCycle = cycleCount;
    for(let i = 0; i < tempCycle + cycleLimit; i++) //Use 'i' to indicate how far we've gone
    {
        //Stay in the bounds
        if(tempCycle > cycleLimit) tempCycle = 1;

        if(!futureBoxes["Common"])
            if(boxCycle[tempCycle] == "Common")
                futureBoxes["Common"] = i+1;
        if(!futureBoxes["Rare"])
            if(boxCycle[tempCycle] == "Rare")
                futureBoxes["Rare"] = i+1;
        if(!futureBoxes["Epic"])
            if(boxCycle[tempCycle] == "Epic")
                futureBoxes["Epic"] = i+1;

        tempCycle++;
    }

    let boxDisplay = "";
    for(let i = 0; i < boxDisplayLength; i++)
    {
        if((cycleCount + i) > cycleLimit) cycleCount = 1;
        boxDisplay += boxArr[boxCycle[cycleCount++]];
        if(i == 0) boxDisplay += boxArr["Arrow"];
    }

    message.channel.stopTyping();
    return sendBoxCycle(message, requestData, boxDisplay, futureBoxes);
}

function sendBoxCycle(message, data, cycle, cycle2)
{
    let futureCycle = "";
    futureCycle += `${boxArr["Common"]}` + "**`+" + cycle2["Common"] + "`**  ";
    futureCycle += `${boxArr["Rare"]}` + "**`+" + cycle2["Rare"] + "`**  ";
    futureCycle += `${boxArr["Epic"]}` + "**`+" + cycle2["Epic"] + "`**  ";

    const boxImg = new Discord.MessageAttachment(getRandomBox(), 'box.png');
    let msg = new Discord.MessageEmbed()
        .setColor(config.success_color)
        .setAuthor(`${data.name} | #${data.tag}`, message.author.displayAvatarURL())
        //.setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
        .addField(`Current box cycle`, cycle)
        .addField(`Future box cycle`, futureCycle)
        .attachFiles(boxImg)
        .setThumbnail('attachment://box.png');

    message.reply({embed:msg}).catch(err => {});
}

function getRandomBox()
{
    let boxes = [
        "./resources/game_assets/boxes/Common.png",
        "./resources/game_assets/boxes/Rare.png",
        "./resources/game_assets/boxes/Epic.png",
        "./resources/game_assets/boxes/Free.png"
    ];

    let num = Math.floor(Math.random() * boxes.length);
    return boxes[num];
}
