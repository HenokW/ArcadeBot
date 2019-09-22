const sqlHand = require("./sql_handler.js");
const config = require("../config.json");

exports.run = async function(client) {
    console.log("===== STARTING SQL CHECKS =====");
    await db_guildChecks(client);
    console.log("===== FINISHED SQL CHECKS =====");
}

async function db_guildChecks(client)
{
    let count = 0;
    let dir = "./SQL/guildsDB.db3";
    let guildsArr = client.guilds.array();

    await sqlHand.createdb(client, dir, "data", config.sql_guildQuery, "id");
    for(let i = 0; i < guildsArr.length; i++)
    {
        let guildInfo = await sqlHand.getData(client, "./SQL/guildsDB.db3", "data", "id", guildsArr[i].id);
        if(guildInfo == undefined)
        {
            count++;
            var data = {
                id: guildsArr[i].id,
                prefix: config.default_prefix,
                clan: null
            }

            await sqlHand.setData(client, dir, config.sql_guildSetterQuery, "data", data);
        }
    }

    console.log(`Created: ${count} Guild entries.`);
}
