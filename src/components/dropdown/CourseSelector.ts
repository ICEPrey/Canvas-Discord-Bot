import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  ChatInputCommandInteraction,
} from "discord.js";
import { fetchCourses } from "../../helpers/api";
import { Course } from "../../types";

const SELECTION_TIMEOUT = 60000;

export async function CourseSelector(
  interaction: ChatInputCommandInteraction,
  userId: string,
): Promise<string | null> {
  try {
    const courses = await fetchCourses(userId);
    if (courses.length === 0) {
      await interaction.reply({
        content: "You have no active courses.",
        ephemeral: true,
      });
      return null;
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("course_select")
      .setPlaceholder("Select a course")
      .addOptions(
        courses.map((course: Course) => ({
          label: course.name,
          value: course.id.toString(),
        })),
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      selectMenu,
    );

    await interaction.reply({
      content: "Please select a course:",
      components: [row],
      ephemeral: true,
    });

    return new Promise((resolve) => {
      const collector = interaction.channel?.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: SELECTION_TIMEOUT,
      });

      collector?.on("collect", async (i) => {
        const courseId = i.values[0];
        await i.update({
          content: `You selected course ID: ${courseId}`,
          components: [],
        });
        resolve(courseId);
      });

      collector?.on("end", async (collected) => {
        if (collected.size === 0) {
          await interaction.followUp({
            content: "Course selection timed out. Please try again.",
            ephemeral: true,
          });
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error(`Error fetching courses for user ${userId}:`, error);
    await interaction.reply({
      content:
        "An error occurred while fetching your courses. Please try again later.",
      ephemeral: true,
    });
    return null;
  }
}
