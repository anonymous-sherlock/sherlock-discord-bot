require('dotenv').config();
import askCommand from "@/src/commands/utility/ask";
import { ActivityType, Client, Events, GatewayIntentBits, IntentsBitField, Partials } from 'discord.js';
import assignTask from "./commands/utility/assign-task";
import codeCommand from './commands/utility/code-review';
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildMessageTyping,
        IntentsBitField.Flags.AutoModerationExecution,
    ],
    partials: [Partials.Message, Partials.Reaction, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User],
})

const collector = 

client.on('ready', (c) => {
    console.log(`✅ ${c.user.tag} is online.`);
    client.user?.setActivity({
        name: "Modern Talking",
        type: ActivityType.Listening,
        url: "https://www.youtube.com/watch?v=bssz8cSRL0w"

    })
});

client.on("typingStart", (c) => {
})

client.on('messageCreate', async (message) => {
    if (message.author.bot) return

    const contentLower = message.content.toLowerCase();

    // const sentiments = await getMessageAnalysis(contentLower)
    // console.log(sentiments)
    // message.delete()
    // message.channel.send(`<@${message.author.id}>, promotional content is not allowed in this server. Your message has been deleted.`);

});


client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    switch (interaction.commandName) {
        case "ask":
            askCommand.execute(interaction);
            break;
        case "assign-task":
            assignTask.execute(interaction)
            break;
        case "code-review":
            codeCommand.execute(interaction)
            break;
        default:
            break;
    }

});


client.on(Events.MessageReactionAdd, async (reaction, user) => {
    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    // Now the message has been cached and is fully available
    console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`);
    // The reaction is now also fully available and the properties will be reflected accurately:
    console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
    console.log(`${reaction.emoji.name} emoji name`);
});


client.login(process.env.BOT_TOKEN);