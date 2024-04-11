import { GoogleGenerativeAI } from "@google/generative-ai";
import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEYS!);
const askCommand = {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask to Sherlock.")
    .addStringOption((option) => option.setName("question").setDescription("ask your question to sherlock").setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction) {
    const question = interaction.options.get("question")?.value
    await interaction.deferReply({ ephemeral: true });
    let prompt =
      `Act as Specialist and provide the most accurate answer for this question in very short details.\n
    -------------------------------
    ${question}`;


    try {
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

export default askCommand;
