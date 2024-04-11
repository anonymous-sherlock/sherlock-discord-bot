require("dotenv").config();
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEYS!);


const codeCommand = {
    data: new SlashCommandBuilder()
        .setName("code-review")
        .setDescription("Share your code so we can review")
        .addStringOption(option =>
            option.setName('language')
                .setDescription('Select the programming language')
                .setRequired(true)
                .addChoices(
                    { name: 'JavaScript', value: 'javaScript' },
                    { name: 'TypeScript', value: 'typescript' },
                    { name: 'Python', value: 'python' },
                ).setRequired(true))
        .addStringOption(option => option.setName("snippet").setDescription("Your code snippet.").setRequired(true))
    ,
    async execute(interaction: ChatInputCommandInteraction) {
        const snippet = interaction.options.get("snippet")?.value?.toString() ?? "";
        const language = interaction.options.get("language")?.value?.toString() ?? "";
        await interaction.deferReply({ ephemeral: true });
        try {
            let prompt;
            switch (language.toLowerCase()) {
                case 'python':
                    prompt = "Please optimize the following Python code:\n\n" +
                        `${snippet}\n`
                    break;
                case 'javascript':
                    prompt = "Please optimize the following JavaScript code:\n\n" +
                        `${snippet}\n`
                    break;
                case 'typescript':
                    prompt = "Please optimize the following TypeScript code:\n\n" +
                        `${snippet}\n`
                    break;
                default:
                    prompt = "Please optimize the following code snippet in the specified language:\n\n" +
                        `${snippet}\n`
            }


            const parts = [{ text: `input: ${prompt}`, },];
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const generationConfig = {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            };

            const result = await model.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig,
            });
            const reply = await result.response.text();

            if (reply.length > 2000) {
                const replyArray = reply.match(/[\s\S]{1,2000}/g);
                replyArray?.forEach(async (msg) => {
                    await interaction.followUp(msg);
                });
                return;
            }
            interaction.followUp(reply);
            return
        } catch (error) {
            await interaction.followUp({ content: "Oops! Looks like there's a hiccup in the code. Gremlins must be at it again! 🚫👾 Please try again later.", ephemeral: true });
            return;
        }
    },
};

export default codeCommand;
