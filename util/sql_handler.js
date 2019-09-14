const SQLite = require("sqlite3");
const fs = require("fs");

/*
sqlDir - SQL directory
table - the name of the table within the desired database
identifier - the column used to seperate unique entries
index - the desired entry to be returned
*/
exports.getData = async function(client, sqlDir, table, identifier, index)
{
    return new Promise(async (resolve, reject) =>
    {
        let db = new SQLite.Database(sqlDir);
        try
        {
            let dataEntry = undefined;
            let returnData = undefined;

            db.serialize(function()
            {
                let query = db.prepare(`SELECT * FROM ${table} WHERE ${identifier} = ?`);
                dataEntry = new Promise((resolve, reject) => {
                    query.get(index, function(err, data) { resolve(data); });
                });

                query.finalize();
            });

            db.close();
            await dataEntry.then(data => returnData = data);
            resolve(returnData);
        }
        catch(e) {
            client.emit("error", e);
            await db.close();

            reject(e);
        }
    });

    promise.then((data) => { console.log(data) });
}

/*
sqlDir - SQL directory
table - the name of the table within the desired database
data - the new data set to replace our index

** CURRENTLY ONLY SUPPORTS INTEGERS AS THE FIRST COLUMN VALUE **
*/
exports.setData = async function(client, sqlDir, sqlSetQuery, table, data)
{
    let db = new SQLite.Database(sqlDir);
    try
    {
        let keys = Object.keys(data);
        let values = Object.values(data);
        db.serialize(function()
        {
            db.run((sqlSetQuery), values, function(err) {
                if (err)
                    client.emit("error", err.message);
            });
        });

        await db.close();
    }
    catch(e)
    {
        client.emit("error", e);
        return undefined;

        await db.close();
    }
}

exports.createdb = function(client, sqlDir, table, query, uniqueValue)
{
    return promise = new Promise((resolve, reject) =>
    {
        let db = new SQLite.Database(sqlDir);
        try
        {
            db.serialize(function()
        	{
        		let sqlTable = db.prepare(`SELECT count(*) FROM sqlite_master WHERE type='table' AND name = '${table}';`);
        		if(!sqlTable['count(*)'])
        		{
        			let createTbl = db.run((`CREATE TABLE IF NOT EXISTS ${table}(${query})`), function() {
                        let createUnique = db.run((`CREATE UNIQUE INDEX IF NOT EXISTS _x${uniqueValue} ON ${table} (${uniqueValue});`), function() {
                            sqlTable.finalize();
                            db.close();
                            resolve(true);
                        });
                    });
        		}
                else
                {
                    db.close();
                    resolve(true);
                }
        	});
        }
        catch(e)
        {
            client.emit("error", e);
            db.close();

            reject(e);
        }
    });

    promise.then((data) => { return data });
}

// **CURRENTLY NOT AVAILABLE** //
/*
exports.createColumn = async function(client, options, dirInfo)
{
    //Arg check
    if(typeof options.name === 'undefined') throw new Error("Column name not passed as an object, 'name'");
    if(typeof options.type === 'undefined') throw new Error("Column type not passed as an object, 'type'");

    //Get how many files we would need to modify
    if(typeof dirInfo === 'undefined')
    {
        await fs.readdir("./SQL/guild_data/", async (err, files) => {
            if(err) throw err;

            let dirInfo = {
                count: files.length,
                files: files
            }
            return this.createColumn(client, options, dirInfo);
        });
    }
    else
    {
        let colName = options.name;
        let colType = options.type;
        for(let i = 0; i < dirInfo.count; i++)
        {
            try
            {
                let sqlFile = new SQLite(`./SQL/guild_data/${dirInfo.files[i]}/channel_settings.db3`);
                client.createColumnData = sqlFile.prepare(`ALTER TABLE data ADD COLUMN ${colName} ${colType};`);
                client.createColumnData.run();

                sqlFile.close();
            } catch(e) { client.emit("error", e); }
        }
    }
}
*/

//Merges an array of keys, and values to be used as an object compatible with SQLite
exports.merge = async function(keys, values)
{
    let obj = {};
    for (let i = 0; i < keys.length; ++i)
        obj[keys[i]] = values[i];

    return obj;
}
