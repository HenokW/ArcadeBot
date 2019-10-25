const sqlHand = require("./util/sql_handler.js");
const config = require("./config.json");
const Discord = require("discord.js");
const colors = require("colors");
const fs = require("fs");

const sqlite3 = require('sqlite3').verbose();
const client = new Discord.Client();

const devEnabled = true;
fs.readdir("./commands/", (err, files) =>
{
	if(err)
		client.emit("error", err);

	let jsfile = files.filter(f => f.split(".").pop() === "js");
	if(jsfile.length <= 0)
		return console.log("\n> Unable to find commands.");

	console.log("\n==== COMMANDS ====");
	console.log(`${jsfile.length} commands found`);
	console.log("==================\n");
	jsfile.forEach((f, i) => { let props = require(`./commands/${f}`); });
});

client.on("ready", async () =>
{
	console.log("> I'm now ONLINE!\n".bold.green);
	client.user.setActivity("@" + client.user.username + " for help");

	//Actions needed after bot starts up
	await startup();
});

client.on("guildCreate", async guild =>
{
	console.log("I've been connected to a new guild:\n" + guild.name + "\n" + guild.id + '\n');
	var joinMsg = new Discord.MessageEmbed()
		.setColor("#FFFFFF")
		.setTitle("New guild connected")
		.setDescription(`**Guild Name:** **\`${guild.name}\`**\n` +
						`**Guild ID:** **\`${guild.id}\`**\n` +
						`**Member Count:** **\`${guild.members.array().length}\`**`);
	if(guild.iconURL) joinMsg.setThumbnail(guild.iconURL);
	client.emit("log", joinMsg)

	//Check to make sure we haven't missed an entry while offline
	let sqlChecks = require("./util/sqlCheck.js");
	await sqlChecks.run(client);
});

client.on("guildDelete", async guild =>
{
	console.log("I've been disconnected from guild:\n" + guild.name + "\n" + guild.id + '\n');
	var leaveMsg = new Discord.MessageEmbed()
		.setColor("#ff0000")
		.setTitle("Removed from a guild")
		.setDescription(`**Guild Name:** **\`${guild.name}\`**\n` +
						`**Guild ID:** **\`${guild.id}\`**\n` +
						`**Member Count:** **\`${guild.members.array().length}\`**`);
	if(guild.iconURL) leaveMsg.setThumbnail(guild.iconURL);
	client.emit("log", leaveMsg);

	// return client.shard.broadcastEval(`
	// 	const channel = this.channels.get("423255381498920963");
	// 	if (channel) {
	// 		const Discord = require("discord.js");
	// 		let msg = new Discord.MessageEmbed()
	// 			.setColor("#ff0000")
	// 			.setTitle("Removed from a guild")
	// 			.setDescription('**Guild Name:** **${guild.name}**\n' +
	// 							'**Guild ID:** **${guild.id}**\n' +
	// 							'**Member Count:** **${guild.members.array().length}**')
	// 			.setTimestamp();
	//
	// 		channel.send({embed:msg});
	// 		true;
	// 	}
	// 	else {
	// 		false;
	// 	}
	// `).then(console.log);
});

client.on("error", (e) => {
	//console.error(e);
	if(e.length > 1024) e = e.substring(0, 1023);

	let msg = new Discord.MessageEmbed()
		.setColor("#ff0000")
		.setTitle("New Error")
		.setDescription(e);

	client.emit("log", msg);
});

client.on("warn", (e) => console.warn(e));
client.on("log", async (options) => {
	//if(devEnabled) return;

	let title = options.title || "-------";
	let description = options.description || "-- No description provided --";
	let color = options.color || "#FFFFFF";
	let icon = options.icon;
	let logChan = await client.guilds.get('622518500170137611').channels.get('622658922037116929'); //ORIGINAL ARCADE
	// let logChan = await client.guilds.get('346430947421323267').channels.get('423255381498920963');

	// return client.shard.broadcastEval(`
	// 	const channel = this.channels.get("423255381498920963");
	// 	if (channel) {
	// 		const Discord = require("discord.js");
	// 		let msg = new Discord.MessageEmbed()
	// 			.setColor("#ff0000")
	// 			.setTitle("Error: Unhandled Rejection")
	// 			.addField("Type", '${type}')
	// 			.addField("Error message", '${stack}')
	// 			.setTimestamp();
	//
	// 		channel.send({embed:msg});
	// 		true;
	// 	}
	// 	else {
	// 		false;
	// 	}
	// `).then(console.log);
	logChan.send({embed:options});
});

// client.on("debug", (e) => console.info(e));
process.on('unhandledRejection', (reason, p) =>
{
	// console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
	let errStack = reason;
	console.log(errStack);
	if(errStack.length > 2048) errStack = errStack.substring(0, 2047);

	if(devEnabled) return console.error(reason);
	client.emit("log", p, errStack);

// application specific logging, throwing an error, or other logic here
});

client.on("message", async message =>
{
	if(message.channel.type === "dm") return;
	if(message.author.bot) return;

	if(devEnabled && message.guild.id != '346430947421323267') return;
	let guildInfo = await sqlHand.getData(client, './SQL/guildsDB.db3', 'data', 'id', message.guild.id);

	let args = message.content.slice(guildInfo.prefix.length).trim().split(' ');
	let cmd = args.shift().toLowerCase();

	//If they happened to ping the bot
	if(message.content.replace(/[<@>]/g, '') == (client.user))
		return message.channel.send("For further help, please feel free to use **`" + guildInfo.prefix + "help`** for a complete rundown of all my commands.\n\n**Guild prefix:** `" + guildInfo.prefix + "`").catch(err => {});

	//Prefix resetting
	if(message.content.trim().split(' ')[0] == message.mentions.users.first() && args[0] == 'resetprefix')
	{
		let resetFile = require('./commands/setprefix.js');
		return resetFile.reset(client, message, args);
	}

	//Not their prefix, RUN AWAY!
	if(!message.content.startsWith(guildInfo.prefix)) return;

	try
	{
		let cmdFile = require(`./commands/${cmd}.js`);
		cmdFile.run(client, message, args);
	} catch(e) { }
});

async function startup()
{
	//Directory check
	await dirCheck();

	//exports.createdb = function(client, sqlDir, table, query, uniqueValue)
	const playerDB = "playersDB";
	await sqlHand.createdb(client, `./SQL/${playerDB}.db3`, "data", config.sql_playerDBQuery,"id");

	const guildDB = "guildsDB";
	await sqlHand.createdb(client, `./SQL/${guildDB}.db3`, "data", config.sql_guildQuery, "id");

	// const teamDB = "teamsDB";
	// await sqlHand.createdb(client, `./SQL/${teamDB}.db3`, "data", config.sql_teamDBQuery,"id");

	const teamLogsDB = "teamLogsDB";
	await sqlHand.createdb(client, `./SQL/${teamLogsDB}.db3`, "data", config.sql_teamLogsDBQuery,"id");
	await sqlHand.createdb(client, `./SQL/${teamLogsDB}.db3`, "logData", config.sql_teamLogDataDBQuery,"logID");

	//Check to make sure we haven't missed an entry while offline
	let sqlChecks = require("./util/sqlCheck.js");
	await sqlChecks.run(client);

	let logHandler = require("./util/logHandler.js");
	logHandler.startup(client);
}

async function dirCheck()
{
	let myGuilds = client.guilds.array();
	if (!fs.existsSync("./SQL")) { fs.mkdirSync("./SQL"); }

	return;
}


client.login(config.token);
