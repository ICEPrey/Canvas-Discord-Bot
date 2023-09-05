import { REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { Command } from "./types";
import "dotenv/config";
const commands: Command[] = [];
const foldersPath = join(__dirname, "commands");
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).filter(
        (file) => file.endsWith(".js") && file !== "helpers.js",
    );
    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
            );
        }
    }
}

const rest = new REST().setToken(process.env.TOKEN || "");

(async () => {
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`,
        );

        const data: any = await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID || "",
                process.env.GUILD_ID || "",
            ),
            { body: commands },
        );

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`,
        );
    } catch (error) {
        console.error(error);
    }
})();
