import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ChatInputCommandInteraction,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  StringSelectMenuInteraction,
} from "discord.js";
import { getCanvasToken, upsertUser } from "../../helpers/supabase";
import axios from "axios";
import { SchoolSearchResult } from "../../types";
import logger from "../../logger";
export const data = new SlashCommandBuilder()
  .setName("account")
  .setDescription("Set an access token to use the /assignment command")
  .addStringOption((option) =>
    option
      .setName("token")
      .setDescription("Your Canvas access token")
      .setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;
  const existingToken = await getCanvasToken(userId);

  if (existingToken !== null) {
    await interaction.reply({
      content:
        "You already have a Canvas token stored. If you want to update it, please contact support.",
      ephemeral: true,
    });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId("tokenModal")
    .setTitle("Canvas Access Token");

  const tokenInput = new TextInputBuilder()
    .setCustomId("tokenInput")
    .setLabel("Enter your Canvas access token")
    .setPlaceholder("(this is crypted) 12345~AbCdE.....")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const schoolInput = new TextInputBuilder()
    .setCustomId("schoolInput")
    .setLabel("Enter your school name")
    .setPlaceholder("Long Beach College")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const tokenRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    tokenInput,
  );
  const schoolRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    schoolInput,
  );

  modal.addComponents(tokenRow, schoolRow);

  await interaction.showModal(modal);

  try {
    const modalSubmission = await interaction.awaitModalSubmit({
      filter: (i) => i.customId === "tokenModal",
      time: 60000,
    });

    if (modalSubmission) {
      await modalSubmission.deferReply({ ephemeral: true });

      const token = modalSubmission.fields.getTextInputValue("tokenInput");
      const schoolName =
        modalSubmission.fields.getTextInputValue("schoolInput");

      const schoolResponse = await axios.get<SchoolSearchResult[]>(
        `https://canvas.instructure.com/api/v1/accounts/search?name=${encodeURIComponent(
          schoolName,
        )}&per_page=5`,
      );
      const schools = schoolResponse.data;

      if (schools.length === 0) {
        await modalSubmission.editReply({
          content: "No schools found with that name. Please try again.",
        });
        return;
      }

      const schoolOptions = schools.map((school: SchoolSearchResult) => ({
        label: school.name,
        value: school.id.toString(),
        description: school.domain,
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("school_select")
        .setPlaceholder("Select your school")
        .addOptions(schoolOptions);

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        selectMenu,
      );

      const response = await modalSubmission.editReply({
        content: "Please select your school:",
        components: [row],
      });

      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 30000,
      });

      collector.on("collect", async (i: StringSelectMenuInteraction) => {
        const selectedSchoolId = i.values[0];
        const selectedSchool = schools.find(
          (school) => school.id.toString() === selectedSchoolId,
        );

        if (selectedSchool) {
          await upsertUser(token, interaction.user.id, selectedSchool.id, {
            id: selectedSchool.id,
            name: selectedSchool.name,
            canvas_domain: selectedSchool.domain,
          });

          await i.update({
            content: `Token has been successfully saved to the database for ${selectedSchool.name}`,
            components: [],
          });
        } else {
          await i.update({
            content: "School selection failed. Please try again.",
            components: [],
          });
        }

        collector.stop();
      });

      collector.on("end", async (collected) => {
        if (collected.size === 0) {
          await modalSubmission.editReply({
            content: "School selection timed out. Please try again.",
            components: [],
          });
        }
      });
    }
  } catch (error) {
    logger.error({ error }, "Error in account command");
    await interaction.reply({
      content: "An error occurred while processing your request.",
      ephemeral: true,
    });
  }
}
