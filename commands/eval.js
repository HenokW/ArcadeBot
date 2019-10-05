const sqlHand = require("../util/sql_handler.js");
const config = require("../config.json");
const util = require("../util/util.js");
const Discord = require("discord.js");

module.exports.run = async function(client, message, args)
{
    if(message.author.id != config.author_id) return;

    try {
      const code = args.join(" ");
      let evaled = eval(code);

    //message.channel.send(evaled);
      //message.channel.send(`\`\`\`js\n${clean(evaled)}\n\`\`\``);
    } catch (err) {
        console.log(err);
      // message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
}
