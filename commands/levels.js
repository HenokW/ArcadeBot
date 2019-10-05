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
    sendCardInfo(client, message, requestData);
}

async function sendCardInfo(client, message, data)
{
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

    const upgradeIcon = new Discord.Attachment('./resources/game_assets/ui_sprite_298.png', 'upgrade.png');
    let msg = new Discord.RichEmbed()
        .setColor(config.success_color)
        .setAuthor(`${data.name} | #${data.tag}`, `https://www.rushstats.com/assets/level/${data.expLevel}.png`)
        .attachFile(upgradeIcon)
        .setThumbnail('attachment://upgrade.png')
        .addField(`HQ Level`, `${hqEmojis[data.variables.hqLevel]} ${data.variables.hqLevel}`, true)
        .addField("Chopper Level", `<:rw_chopper:622268961077198869> ${data.variables.chopperLevel}`, true);

    if(commanders)
        msg.addField("Commanders", commanders, false);
    if(abilities)
        msg.addField("Abilities", abilities, false);
    if(defenses)
        msg.addField("Defenses", defenses, false);
    if(troops)
        msg.addField("Troops", troops, false);

    message.reply({embed:msg}).catch(err => {});
}
