import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { randomColor } from "../../helpers/colors";
import { getDiscussions } from "../../helpers/api";
import { convert } from "html-to-text";
import { CourseSelector } from "../../components/dropdown/CourseSelector";

export const data = new SlashCommandBuilder()
  .setName("discussion")
  .setDescription("Fetches the latest discussion from Canvas")
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const userId: string = interaction.user.id;
    await interaction.deferReply({ ephemeral: true });
    const courseId = await CourseSelector(interaction, userId);

    if (!courseId) {
      await interaction.editReply("No course was selected. Command cancelled.");
      return;
    }

    // Fetch discussions for the selected course
    const discussions = await getDiscussions(userId, parseInt(courseId));

    if (!discussions || discussions.length === 0) {
      await interaction.editReply(
        "No discussions found for the selected course.",
      );
      return;
    }

    const discussion = discussions[0];
    const embed = new EmbedBuilder()
      .setColor(randomColor())
      .setTitle(discussion.title)
      .setURL(discussion.html_url)
      .setDescription(convert(discussion.message))
      .setTimestamp(new Date(discussion.posted_at))
      .setFooter({ text: "Next Canvas check in 24 hours." });

    await interaction.editReply({
      content: "Here's the latest discussion:",
      embeds: [embed],
    });
  } catch (error) {
    console.error(
      `Unexpected error in discussion command for user ${interaction.user.id}:`,
      error,
    );
    await interaction.editReply({
      content:
        "An unexpected error occurred. Please try again later or contact support if the issue persists.",
    });
  }
}
