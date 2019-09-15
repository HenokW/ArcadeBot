const sqlHand = require("./util/sql_handler.js");
const config = require("./config.json");
const Discord = require("discord.js");
const colors = require("colors");
const fs = require("fs");

const sqlite3 = require('sqlite3').verbose();
const client = new Discord.Client();

fs.readdir("./commands/", (err, files) =>
{
	if(err)
		client.emit("error", err);

	let jsfile = files.filter(f => f.split(".").pop() === "js");
	if(jsfile.length <= 0)
	{//
		console.log("\n> Unable to find commands.");
		return;
	}

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
	console.log("I've been connected to a new guild:\n" + guild.name + "\n" + guild.id);

	//Check to make sure we haven't missed an entry while offline
	let sqlChecks = require("./util/sqlCheck.js");
	await sqlChecks.run(client);
});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
// client.on("debug", (e) => console.info(e));

client.on("message", async message =>
{
	if(message.channel.type === "dm") return;
	if(message.author.bot) return;

	let guildInfo = await sqlHand.getData(client, './SQL/guildsDB.db3', 'data', 'id', message.guild.id);

	let args = message.content.slice(guildInfo.prefix.length).trim().split(' ');
	let cmd = args.shift().toLowerCase();

	//If they happened to ping the bot
	if(message.content == (client.user))
		return message.channel.send("For further help, please feel free to use **`" + guildInfo.prefix + "help`** for a complete rundown of all my commands.\n\n**Guild prefix:** `" + guildInfo.prefix + "`").catch(err => {});

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

	//Check to make sure we haven't missed an entry while offline
	let sqlChecks = require("./util/sqlCheck.js");
	await sqlChecks.run(client);
}

async function dirCheck()
{
	let myGuilds = client.guilds.array();
	if (!fs.existsSync("./SQL")) { fs.mkdirSync("./SQL"); }

	return;
}


client.login(config.token);
