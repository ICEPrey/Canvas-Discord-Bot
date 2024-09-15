import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { randomColor } from "../../helpers/colors";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Get the bot's ping and API latency");

export async function execute(interaction: ChatInputCommandInteraction) {
  const sent = await interaction.reply({
    content: "Pinging...",
    ephemeral: true,
    fetchReply: true,
  });

  const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
  const wsLatency = interaction.client.ws.ping;

  const embed = new EmbedBuilder()
    .setColor(randomColor())
    .setTitle("🏓 Pong!")
    .addFields(
      {
        name: "Bot Response Time",
        value: `${roundtripLatency}ms`,
        inline: true,
      },
      { name: "API Latency", value: `${wsLatency}ms`, inline: true },
    )
    .setFooter({ text: "Bot Ping Information" })
    .setTimestamp();

  await interaction.editReply({
    content: "",
    embeds: [embed],
  });
}
