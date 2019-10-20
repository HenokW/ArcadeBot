const sqlHand = require("../util/sql_handler.js");
const config = require("../config.json");
const util = require("../util/util.js");
const Discord = require("discord.js");
const { inspect } = require("util");

module.exports.run = async function(client, message, args)
{
    if(message.author.id != config.author_id) return;

    // try {
    //   const code = args.join(" ");
    //   let evaled = eval(code);
    //
    // //message.channel.send(evaled);
    //   message.channel.send(` \`\`\`js\n${uneval(evaled)}\n\`\`\` `);
    // } catch (err) {
    //     console.log(err);
    //   // message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    // }
    //

   let toEval = args.join(" ");
   let evaluated = inspect(eval(toEval, { depth: 0 } ))
   try {
       if(toEval) {
           let hrStart = process.hrtime()
           let hrDiff;
           hrDiff = process.hrtime(hrStart)
           // return message.channel.send(`*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms.*\`\`\`js\n${evaluated}\n\`\`\``, { maxLength: 1900 })
           return message.channel.send(`**‣Output:**\`\`\`js\n${evaluated}\n\`\`\`\n**‣Executed Time:**\`\`\`${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms\`\`\``, { maxLength: 1900 })

       } else {
           message.channel.send("Empty eval")
       }
   } catch(e) {
       message.channel.send(`Error whilst evaluating: \`${e.message}\``)
   }
}
