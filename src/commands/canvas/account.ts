import {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  codeBlock,
  ChatInputCommandInteraction,
  Interaction,
} from "discord.js";
import { AccessToken, getCanvasToken } from "../../helpers/supabase";
import axios from "axios";

async function chooseSchool(
  interaction: ChatInputCommandInteraction,
  schools: { name: string; id: number; domain: string }[],
): Promise<{ name: string; id: number; domain: string }> {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("school_select")
    .setPlaceholder("Select a school")
    .addOptions(
      schools.map((school) => ({
        label: school.name,
        value: school.id.toString(),
      })),
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu,
  );

  await interaction.editReply({
    content: "Please select your college:",
    components: [row],
  });

  const collector = interaction.channel?.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 60000,
  });

  return new Promise((resolve, reject) => {
    collector?.on("collect", async (index) => {
      const selectedOption = schools.find(
        (school) => school.id === parseInt(index.values[0]),
      );
      if (selectedOption) {
        await interaction.editReply({
          content: `You have selected: ${selectedOption.name}`,
          components: [],
        });
        resolve(selectedOption);
      } else {
        await interaction.followUp({
          content:
            "Invalid selection. Please select a valid school from the dropdown menu.",
          ephemeral: true,
        });
      }
    });

    collector?.on("end", async (collected, reason) => {
      if (reason === "time" && !collected.size) {
        await interaction.editReply({
          content: "School selection timed out. Please try again.",
          components: [],
        });
        reject(new Error("Timeout"));
      }
    });
  });
}

export const data = new SlashCommandBuilder()
  .setName("account")
  .setDescription("Set an access token to use the /assignment command")
  .addStringOption((option) =>
    option
      .setName("token")
      .setDescription("The canvas access token")
      .setRequired(true),
  )
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const token = interaction.options.getString("token", true);
  const userId = interaction.user.id;
  const existingToken = await getCanvasToken(userId);

  if (existingToken !== null) {
    await interaction.reply({
      ephemeral: true,
      content:
        "You already have a Canvas token stored. If you want to update it, please contact support.",
    });
    return;
  }

  const confirm = new ButtonBuilder()
    .setCustomId("confirm")
    .setLabel("Submit Token")
    .setStyle(ButtonStyle.Success);

  const cancel = new ButtonBuilder()
    .setCustomId("cancel")
    .setLabel("Cancel")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    cancel,
    confirm,
  );

  await interaction.reply({
    ephemeral: true,
    content: `Are you sure you want to submit this token: \n${codeBlock(
      "fix",
      token,
    )}`,
    components: [row],
  });

  const confirmation = await interaction.channel?.awaitMessageComponent({
    filter: (i: Interaction) => i.user.id === userId,
    time: 60000,
  });

  if (confirmation?.customId === "confirm") {
    const schoolResponse = await axios.get(
      "https://canvas.instructure.com/api/v1/accounts/search?name=long beach&per_page=5",
    );
    const schools = schoolResponse.data;
    const selectedSchool = await chooseSchool(interaction, schools);

    if (selectedSchool) {
      await AccessToken(token, userId, selectedSchool.id, {
        name: selectedSchool.name,
        domain: selectedSchool.domain,
      });
      await interaction.followUp({
        content: `Token has been successfully saved to the database for ${selectedSchool.name}`,
        ephemeral: true,
      });
    } else {
      await interaction.followUp({
        content: "Invalid school selection. Please try again.",
        ephemeral: true,
      });
    }
  } else {
    await interaction.followUp({
      content: "Action cancelled",
      ephemeral: true,
    });
  }
}
