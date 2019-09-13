const config = require("../config.json");
const Discord = require("discord.js");
const axios = require("axios");

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
            request.get(`${API_URL}${endpoint}${tag}`)
            .then(res =>
            {
                if(res.status == 200)
                    resolve(res.data);
                else
                    throw new Error(res.status);
            })
            .catch(err =>
            {
                reject(undefined);
                //console.error(err.response.status);
            })
        }
    });
}
