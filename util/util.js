const sqlHand = require("./sql_handler.js");
const config = require("../config.json");
const Discord = require("discord.js");

module.exports.tagCheck = function(tag)
{
    const validChars = ['0', '2', '8', '9', 'P', 'Y', 'L', 'Q', 'G', 'R', 'J', 'C', 'U', 'V'];

    if(tag[0] == "#") tag = tag.substring(1, tag.length);
    if(tag.length < 3) return false;

    tag = tag.toUpperCase();

    for(let i = 0; i < tag.length; i++)
        if(!validChars.includes(tag[i])) return false;

    return tag;
}

module.exports.missingTagError = function(client, message, searched)
{
    const errImg = new Discord.Attachment('./resources/invalid_tag_img.png', 'errorImg.png');
    let msg = new Discord.RichEmbed()
        .setColor(config.error_color)
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
        .setTitle("You don't have a tag saved")
        .setDescription("To save your tag, please use the **`save #TAG`** command. You can find your tag in-game in your player profile.")
        .attachFile(errImg)
        .setImage('attachment://errorImg.png');

    if(searched)
        msg.setTitle("That user doesn't have a tag saved");

        return message.reply({embed:msg}).catch(err => {});
}

module.exports.formatMs = function(time) {
    time = time / 1000;

	hr = Math.floor(time / 3600);
    if(hr == '00')
        hr = '';
    else
        hr = hr + 'h ';

	min = Math.floor((time % 3600) / 60);
    if(min == '00')
        min = '';
    else
        min = min + 'm ';

	sec = Math.floor((time % 3600) % 60);
    if(sec == '00')
        sec = '';
    else
        sec = sec + 's ';
        
    return `${hr}${min}${sec}`;
}

module.exports.timeInMS = function() {
    return Math.round((new Date()).getTime());
}

module.exports.timeInS = function() {
    return Math.round((new Date()).getTime() / 1000);
}

module.exports.sendErrorMessage = function(message, content, type)
{
    //.setColor("#303030")
    const prefixMessage = new Discord.RichEmbed()
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
		.setColor(config.error_color)
		.setDescription(`✖ ${content}`);

    switch(type)
    {
        case "REPLY":
            message.reply({embed:prefixMessage}).catch(err => {});
            break;
        case "CHANNEL":
            message.channel.send({embed:prefixMessage}).catch(err => {});
            break;
        case "DM":
            message.author.send({embed:prefixMessage}).catch(err => {});
            break;
        default:
            throw new Error("Invalid type given. Available types are: 'REPLY', 'CHANNEL', and 'DM'.");
    }

    message.channel.stopTyping();
}

module.exports.getLeagueMedal = function(starNum)
{
    //Grabbing current league medal
    let star = "<:rw_league_0:622260074215374850>";

    if(starNum >= 10000) star = "<:rw_league_12:622262584837537792>";
    else if(starNum >= 8000) star = "<:rw_league_11:622260103839481866>";
    else if(starNum >= 6500) star = "<:rw_league_10:622260104342929413>";
    else if(starNum >= 5200) star = "<:rw_league_9:622260102669533196>";
    else if(starNum >= 4000) star = "<:rw_league_8:622260100567924747>";
    else if(starNum >= 3000) star = "<:rw_league_7:622260098814836736>";
    else if(starNum >= 2400) star = "<:rw_league_6:622260096432603223>";
    else if(starNum >= 1800) star = "<:rw_league_5:622260095996395540>";
    else if(starNum >= 1200) star = "<:rw_league_4:622260097048903720>";
    else if(starNum >= 600) star = "<:rw_league_3:622260093253058600>";
    else if(starNum >= 200) star = "<:rw_league_2:622260097426391040>";
    else if(starNum >= 10) star = "<:rw_league_1:622260095266324510>";

    return star;
}

module.exports.id_to_emote = {
    //Abilities
    "46000000": "<:rw_boost:622323893348204555>",
    "46000001": "<:rw_heal:622323876461805598>",
    "46000002": "<:rw_arcade:622323894648569876>",
    "46000003": "<:rw_vanish:622323892425588776>",
    "46000004": "<:rw_paratroopers:622323894992240651>",
    "46000005": "<:rw_satellite:622323895198023693>",
    "46000006": "<:rw_fridge:622323890072322048>",

    //Commanders
    "48000000": "<:rw_coach:622323148574031892>",
    "48000008": "<:rw_lady_nade:622323151535079455>",
    "48000016": "<:rw_big:622323151879012355>",
    "48000024": "<:rw_bearman:622323151669297171>",
    "48000032": "<:rw_mother:622323152239853568>",

    //Characters
    "49000000": "<:rw_troopers:622324955551367171>",
    "49000004": "<:rw_pitcher:622324956859990026>",
    "49000005": "<:rw_shield:622324952581931019>",
    "49000007": "<:rw_tank:622324954393870346>",
    "49000008": "<:rw_zooka:622324951688544256>",
    "49000009": "<:rw_plumber_van:622324956415393812>",
    "49000010": "<:rw_jetpack:622324956042362881>",
    "49000012": "<:rw_gorilla:622324954100137984>",
    "49000013": "<:rw_hotshot:622324954410516481>",
    "49000014": "<:rw_laser:622324953798148096>",
    "49000015": "<:rw_boxer:622324948819771403>",
    "49000016": "<:rw_henchmen:622324956352479272>",
    "49000024": "<:rw_helipod:622324938342137867>",
    "49000025": "<:rw_blaze:622324955354365962>",
    "49000026": "<:rw_rocket_truck:622324934324125706>",
    "49000027": "<:rw_kungfu:622324953483706391>",
    "49000029": "<:rw_ninja:622324953265471488>",

    //Defenses
    "50000000": "<:rw_mortar:622440822993846302>",
    "50000001": "<:rw_mines:622440823832838144>",
    "50000003": "<:rw_walls:622440803201187843>", //?
    "50000004": "<:rw_walls:622440803201187843>", //?
    "50000005": "<:rw_cannon:622440816853385216>",
    "50000006": "<:rw_plumber_hole:622440822628941824>",
    "50000007": "<:rw_cluster_bomb:622440823199367168>",
    "50000008": "<:rw_gatling:622440816803315742>",
    "50000009": "<:rw_bomb:622440822637330432>",
    "50000010": "<:rw_freeze_mine:622440823274995714>",
    "50000011": "<:rw_plasma_gun:622440822016573450>",
    "50000012": "<:rw_box_ninja:622440785241047040>",
    "50000013": "<:rw_tesla:622440821605531699>",
    "50000014": "<:rw_rockets:622440812822790144>",
    "50000015": "<:rw_dummy:622440820422737930>",

    "0": "<:rw_unknown:622260060554395703>"
}
