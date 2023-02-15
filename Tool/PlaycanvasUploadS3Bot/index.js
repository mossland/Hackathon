const { Client, GatewayIntentBits  } = require('discord.js');
const PlaycanvasDownloader = require("./Downloader.js");
const config = require("./config.json");

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
],
partials: [
    'CHANNEL', 
]
});

let working = [];

client.on("message", function(message) {
    console.log('message');
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();
    
    if (command === "ping") {
        message.reply(`pong!`);
    } else if (command === "sum") {
        const numArgs = args.map(x => parseFloat(x));
        const sum = numArgs.reduce((counter, x) => counter += x);
        message.reply(`Sum result: ${sum}`);
    }
});

client.on("messageCreate", async function(message) {
    let prefix = '!';
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (message.channelId != config.Discord_Config.channel) return;

    if (command === "ping") {
        message.reply(`pong!`);
    } else if (command === "sum") { 
        const numArgs = args.map(x => parseFloat(x));
        const sum = numArgs.reduce((counter, x) => counter += x);
        message.reply(`Sum result: ${sum}`);
    }
    else if (command === "build"){
        let isDev = true;
        
        if (args[1] == 'production') isDev = false;

        if (working.includes(args[0])){
            let channel = client.channels.cache.get(config.Discord_Config.channel);
            channel.send(`[${args[0]}]  please wait...`); 
            return;
        }

        working.push(args[0]);
        const dl = new PlaycanvasDownloader(isDev, args[0], client);
        await dl.start();
        working = working.filter((element) => element !== args[0]);
    }
});

client.on('ready', () =>{
    client.user.setActivity("in my support server", { type: "PLAYING" });
})

client.login(config.Discord_Config.botToken);
