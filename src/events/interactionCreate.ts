import { Interaction, Events } from "discord.js";
import { Command } from "../types";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;
        const command = interaction.client.slashCommands.get(
            interaction.commandName,
        );
        if (!command) {
            console.error(`No command matching ${interaction.commandName}`);
        }
        try {
            await command?.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};
