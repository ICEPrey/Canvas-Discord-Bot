import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  StringSelectMenuInteraction,
} from "discord.js";
import { randomColor } from "../../helpers/colors";
import { getCourses, getDiscussions } from "../../helpers/api";
import { convert } from "html-to-text";
import { Course, DiscussionTopic } from "../../types";

export default {
  data: new SlashCommandBuilder()
    .setName("discussion")
    .setDescription("Fetches the latest discussion from Canvas"),
  execute,
};

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const userId: string = interaction.user.id;
    await interaction.deferReply({ ephemeral: true });

    const courses = await getCourses(userId);
    if (courses.length === 0) {
      await interaction.editReply("You have no active courses.");
      return;
    }

    const courseOptions = courses.map((course: Course) => ({
      label: course.name,
      value: course.id.toString(),
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("course_select")
      .setPlaceholder("Select a course")
      .addOptions(courseOptions);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      selectMenu,
    );

    const response = await interaction.editReply({
      content: "Please select a course to fetch discussions from:",
      components: [row],
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 30000,
    });

    collector.on("collect", async (i: StringSelectMenuInteraction) => {
      const selectedCourseId = i.values[0];
      const selectedCourse = courses.find(
        (course) => course.id.toString() === selectedCourseId,
      );

      if (!selectedCourse) {
        await i.update({
          content: "Invalid course selection. Please try again.",
          components: [],
        });
        return;
      }

      const discussions = await getDiscussions(
        userId,
        selectedCourse.id as number,
      );
      if (!discussions || discussions.length === 0) {
        await i.update({
          content: "No discussions found for the selected course.",
          components: [],
        });
        return;
      }

      const discussion = discussions[0] as DiscussionTopic;
      const embed = new EmbedBuilder()
        .setColor(randomColor())
        .setTitle(discussion.title)
        .setURL(discussion.html_url)
        .setDescription(convert(discussion.message))
        .setTimestamp(new Date(discussion.posted_at))
        .setFooter({ text: "Next Canvas check in 24 hours." });

      await i.update({
        content: `Here's the latest discussion for ${selectedCourse.name}:`,
        embeds: [embed],
        components: [],
      });

      collector.stop();
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: "Course selection timed out. Please try again.",
          components: [],
        });
      }
    });
  } catch (error) {
    console.error(
      `Unexpected error in discussion command for user ${interaction.user.id}:`,
      error,
    );
    await interaction.editReply({
      content:
        "An unexpected error occurred. Please try again later or contact support if the issue persists.",
      components: [],
    });
  }
}
