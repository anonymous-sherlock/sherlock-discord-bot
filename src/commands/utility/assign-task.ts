import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, Emoji, GuildMember, MessageComponentInteraction, ModalBuilder, ReactionEmoji, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

const assignTask = {
  data: new SlashCommandBuilder()
    .setName("assign-task")
    .setDescription("Assing Task.")
    .addMentionableOption((option) => option.setName("user").setDescription("assign task to user").setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Select an Option')
        .setRequired(true)
        .addChoices(
          { name: 'Backend', value: 'backend' },
          { name: 'Frontend', value: 'frontend' }
        ).setRequired(true)).addStringOption(option =>
          option.setName("task")
            .setDescription("Description of the task")
            .setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction) {
    const assignedUser = interaction.options.getMentionable("user")! as GuildMember;
    const taskDescription = interaction.options.getString("task")!;
    const taskType = interaction.options.getString("type")! === "backend" ? "Backend" : "Frontend"
    const taskEmbed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(`New ${taskType} Task Assigned`)
      .setDescription(`A new task has been assigned to ${assignedUser}`)
      .addFields({
        name: taskType,
        value: taskDescription
      })
      .setTimestamp();
    // Create accept and decline buttons
    const acceptButton = new ButtonBuilder()
      .setLabel('Accept Task')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('accept_task');

    const declineButton = new ButtonBuilder()
      .setLabel('Decline Task')
      .setStyle(ButtonStyle.Danger)
      .setCustomId('decline_task');
    // Create an action row with both buttons
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(acceptButton, declineButton);

    const reply = await interaction.reply({
      content: `${assignedUser} New ${taskType} Task Assigned!!`,
      embeds: [taskEmbed],
      components: [actionRow]
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time:  2_147_483_647
    })

    collector.on('collect', async (interaction: MessageComponentInteraction) => {
      if (interaction.isButton()) {
        // non assigned user edge case
        if (interaction.member && interaction.member.user.id !== assignedUser.user.id) {
          if (interaction.customId === 'accept_task') {
            await interaction.reply({ content: 'You cannot accept the task assigned to a different user.', ephemeral: true });
          }
          else if (interaction.customId === 'decline_task') {
            await interaction.reply({ content: 'You cannot declined the task assigned to a different user.', ephemeral: true });
          }
          return;
        }
        if (interaction.customId === 'accept_task') {
          await interaction.update({ components: [] });
          await interaction.followUp({ content: `Task accepted by ${interaction.user}`, });
        } else if (interaction.customId === 'decline_task') {
          await interaction.update({ components: [] });
          await interaction.followUp({ content: `Task declined by ${interaction.user}`, });

          // const declinedText = new TextInputBuilder({
          //   custom_id: "reason-text",
          //   label: "Reason",
          //   style: TextInputStyle.Paragraph
          // });

          // const modal = new ModalBuilder({
          //   custom_id: `declined-reason-${interaction.user.id}`,
          //   title: "Reason for Declining the Task"
          // });

          // const modalActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(declinedText);
          // modal.addComponents(modalActionRow);
          // // await interaction.showModal(modal)
          // await interaction.awaitModalSubmit({ time: 3_00_000 }).then(async (modalInteraction) => {
          //   const declinedReasonText = modalInteraction.fields.getTextInputValue("reason-text")
          //   await modalInteraction.reply({ content: `Task declined by ${interaction.user} \nReason : ${declinedReasonText}`, });
          //   await interaction.deleteReply()
          // })
        }
      }
    });
  },
};

export default assignTask;
