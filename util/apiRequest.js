const config = require("../config.json");
const Discord = require("discord.js");
const axios = require("axios");

const RETRY_LIMIT = 3; //How many times we should retry a failed request before returning an error
const TIMEOUT_DURATION = 2500; //Time in ms
const API_URL = "https://api.rushstats.com/v1/";
let request = axios.create(
    {
        headers: {
            "Authorization": config.rw_token
        }
    });

// *NEED TO FINISH** //
module.exports.request = async function(client, message, options)
{
    let endpoint = (options.endpoint || undefined);
    let tag = (options.tag || undefined);
    let query = (options.query || undefined);
    let triedCount = options.triedCount || (options.triedCount = 0 && 0);

    if(!endpoint) throw new Error("Object missing a specified endpoint. Please provide an endpoint using the 'endpoint' variable.");
    if(!query && endpoint == "search/") throw new Error("Object missing a specified search query. Please Please provide an endpoint using the 'query' variable.");
    if(!tag && endpoint != "search/") throw new Error("Object missing a specified tag query. Please Please provide a player tag using the 'tag' variable.");

    /*
    400 	Bad Request -- Your request sucks.
    401 	Unauthorized -- No authentication was provided, or key invalid.
    404 	Not Found -- The specified player / clan cannot be found. Could be invalid tags.
    429 	Too Many Requests -- You have hit the API Ratelimit. More info
    500 	Internal Server Error -- We had a problem with our server. Try again later.
    503 	Service Unavailable -- We're temporarily offline for maintenance. Please try again later.
    522 	Service Unavailable -- We're temporarily offline. Please try again later.
    */
    return new Promise(function(resolve, reject)
    {
        if(endpoint != "search/")
        {
            // setTimeout(function(){ reject(reqError(message)); }, 5000);
            request.get(`${API_URL}${endpoint}${tag}`, {timeout: TIMEOUT_DURATION})
            .then(res =>
            {
                if(res.status == 200)
                    resolve(res.data);
                else
                    throw new Error(res.status);
            })
            .catch(err =>
            {
                if(options.triedCount >= RETRY_LIMIT)
                {
                    if(err.message.includes('404')) {
                        tagError(client, message);
                    }
                    else
                        reqError(message);

                    reject(err);
                    client.emit("error", err);
                }
                else {
                    options.triedCount++;
                    module.exports.request(client, message, options);
                }
            });
        }
    });
}

function tagError(client, message)
{
    const errImg = new Discord.Attachment('./resources/invalid_tag_img.png', 'errorImg.png');
    let msg = new Discord.RichEmbed()
        .setColor(config.error_color)
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
        .addField("Invalid tag provided", "Please make sure you're entering a valid search tag.\n\n" +
            "**Valid Numbers:** `0, 2, 8, 9`\n" +
            "**Valid Letters:** `C, G, J, L, P, Q, R, U, V, Y`")
        .attachFile(errImg)
        .setImage('attachment://errorImg.png');

    message.reply({embed:msg}).catch(error => { client.emit("error", error) });
    message.channel.stopTyping();
}

function reqError(message)
{
    if(!message) return;

    let msg = new Discord.RichEmbed()
        .setColor(config.error_color)
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
        .setTitle("Uh-oh, something happened!")
        .setDescription("Please feel free to try this command again. if this issue persists, and the game isn't currently under maintenance, or hasn't recently came out of maintenance, then chances are the issue is on our end!\n\nIf this is the case, please try again later, or join our support server to let us know.");

    message.channel.stopTyping();
    return message.channel.send({embed:msg}).catch(err => {});
}
