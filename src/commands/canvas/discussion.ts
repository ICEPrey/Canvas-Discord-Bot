import {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { randomColor } from "../../helpers/colors";
import { Command, DiscussionTopic } from "../../types";
import { getDiscussions } from "../../helpers/api";
import { convert } from "html-to-text";
import { CourseSelector } from "../../components/dropdown/CourseSelector";

export const data = new SlashCommandBuilder()
  .setName("discussion")
  .setDescription("Fetches the latest discussion from Canvas")
  .setDMPermission(false);

export async function execute(
  interaction: ChatInputCommandInteraction,
  client: Client,
) {
  try {
    const commandData: Command["data"] = {
      name: "discussion",
      permissions: [],
      aliases: [],
    };
    const userId: string = interaction.user.id;
    await interaction.deferReply({ ephemeral: true });

    const courseId = await CourseSelector(interaction, userId);
    if (!courseId) return;

    const discussions: DiscussionTopic[] = await getDiscussions(
      userId,
      parseInt(courseId),
    );
    if (!discussions || discussions.length === 0) {
      await interaction.editReply("No discussions found.");
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

    await interaction.editReply({ embeds: [embed] });
    return { data: commandData };
  } catch (error) {
    console.error(
      `Error fetching discussion for user ${client.user?.id}:`,
      error,
    );
    await interaction.editReply("There was an error fetching the discussion.");
  }
}
