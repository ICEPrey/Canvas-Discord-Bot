import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  Collection,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { getCourses } from "../../helpers/api";
import { Course } from "../../types";
const SELECTION_TIMEOUT = 60000;

export async function CourseSelector(
  interaction: ChatInputCommandInteraction,
  userId: string,
): Promise<string | null> {
  try {
    const courses = await getCourses(userId);
    if (courses.length === 0) {
      await interaction.followUp({
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
    const followUpMessage = await interaction.followUp({
      content: "Please select a course:",
      components: [row],
      ephemeral: true,
      fetchReply: true,
    });

    return new Promise<string | null>((resolve) => {
      const collector = followUpMessage.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: SELECTION_TIMEOUT,
      });

      collector.on("collect", async (i: StringSelectMenuInteraction) => {
        const courseId = i.values[0];
        await i.update({
          content: `You selected course ID: ${courseId}`,
          components: [],
        });
        collector.stop();
        resolve(courseId);
      });

      collector.on(
        "end",
        async (collected: Collection<string, StringSelectMenuInteraction>) => {
          if (collected.size === 0) {
            await interaction.followUp({
              content: "Course selection timed out. Please try again.",
              ephemeral: true,
            });
            resolve(null);
          }
        },
      );
    });
  } catch (error) {
    console.error(`Error in CourseSelector for user ${userId}:`, error);
    await interaction.followUp({
      content:
        "An error occurred while fetching courses. Please try again later.",
      ephemeral: true,
    });
    return null;
  }
}
