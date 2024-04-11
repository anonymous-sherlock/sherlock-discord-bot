require('dotenv').config();
import path from "path"
import fs from "fs"
import { REST, Routes } from "discord.js";

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath).default;
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
const rest = new REST().setToken(process.env.BOT_TOKEN!);

// and deploy your commands!
(async () => {
    try {
        // console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data: any = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
            body: commands
        });
        console.log(`✅ Successfully added ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();