const sqlHand = require("../util/sql_handler.js");
const config = require("../config.json");
const util = require("../util/util.js");
const Discord = require("discord.js");

module.exports.run = async(client, message, args) =>
{
	if(message.member.hasPermission("ADMINISTRATOR"))
	{
		//Increment the guild command usage count
		let guildInfo = await sqlHand.getData(client, `./SQL/guildsDB.db3`, "data", "id", message.guild.id);

		let newfix = args.shift();
		if(!newfix) return util.sendErrorMessage(message, "You cannot set an empty prefix.", "REPLY");
		if(newfix == guildInfo.prefix) return util.sendErrorMessage(message, "Your current prefix matches your new prefix request.", "REPLY");

		guildInfo.prefix = newfix;
		await sqlHand.setData(client, `./SQL/guildsDB.db3`, config.sql_guildSetterQuery, "data", guildInfo);

		const prefixMessage = new Discord.MessageEmbed()
			.setColor("#be243e")
			.setDescription("Your server's prefix has successfully been set to: **`" + newfix + "`** Incase of an emergency, you can reset your server's prefix by using **`@" + client.user.username + " resetprefix`**\n\n**Guild:** `" + message.guild.name + "`\n**Changed by:**" + message.author);

		message.reply({embed:prefixMessage}).catch(err => {});
	}
	else
		util.sendErrorMessage(message, "You must be a server administrator to use this command.", "REPLY");
}

module.exports.reset = async(client, message, args) =>
{
	if(message.member.hasPermission("ADMINISTRATOR"))
	{
		//Increment the guild command usage count
		let guildInfo = await sqlHand.getData(client, `./SQL/guildsDB.db3`, "data", "id", message.guild.id);

		let newfix = config.default_prefix;
		if(newfix == guildInfo.prefix) return util.sendErrorMessage(message, "Your current prefix already matches the default prefix **`a.`**.", "REPLY");

		guildInfo.prefix = newfix;
		await sqlHand.setData(client, `./SQL/guildsDB.db3`, config.sql_guildSetterQuery, "data", guildInfo);

		const prefixMessage = new Discord.MessageEmbed()
			.setColor("#be243e")
			.setDescription("Your server's prefix has successfully been reset to: **`" + newfix + "`**\n\n**Guild:** `" + message.guild.name + "`\n**Reset by:**" + message.author);

		message.reply({embed:prefixMessage}).catch(err => {});
	}
	else
		util.sendErrorMessage(message, "You must be a server administrator to use this command.", "REPLY");
}
