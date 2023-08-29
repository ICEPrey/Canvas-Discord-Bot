import { SlashCommandBuilder } from "discord.js";
module.exports = {
    data: new SlashCommandBuilder().setName("ping").setDescription("test"),
    async execute(interaction: any) {
        await interaction.reply("pong");
    },
};
