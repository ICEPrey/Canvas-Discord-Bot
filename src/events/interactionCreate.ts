import { Events } from "discord.js";
import { BotEvent } from "../types";

const clientReadyEvent: BotEvent = {
    name: Events.InteractionCreate,
    execute: async function (interaction) {
        if (!interaction.isCommand()) return;

        const command = interaction.client.commands.get(
            interaction.commandName,
        );

        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found.`,
            );
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};

export = clientReadyEvent;
