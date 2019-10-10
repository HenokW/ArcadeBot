const config = require('./config.json');
const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./bot.js', { token: config.token });

manager.spawn(7);
manager.on('launch', shard => console.log(`Launched shard ${shard.id}`));
