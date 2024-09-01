import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { randomColor } from "../../helpers/colors";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Get the bot's ping");

export async function execute(interaction: ChatInputCommandInteraction) {
  const reply = await interaction.reply({
    ephemeral: true,
    fetchReply: true,
    embeds: [
      new EmbedBuilder()
        .setDescription("Calculating ping...")
        .setColor(randomColor()),
    ],
  });
  const embed = new EmbedBuilder()
    .setDescription(
      `Pong! Latency is ${
        reply.createdTimestamp - interaction.createdTimestamp
      }ms`,
    )
    .setColor(randomColor());

  await interaction.editReply({
    embeds: [embed],
  });
}
