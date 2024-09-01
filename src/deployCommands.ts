import {
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import { readdir } from "fs/promises";
import { join } from "path/posix";
import { Command } from "./types";
import { CONFIG } from "./config";

const commands: Command[] = [];
const foldersPath = join(__dirname, "commands");

async function loadCommands() {
  const commandFolders = await readdir(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = join(foldersPath, folder);
    const commandFiles = (await readdir(commandsPath)).filter(
      (file) => file.endsWith(".js") && file !== "helpers.js",
    );

    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const command = await import(filePath);

      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
        );
      }
    }
  }

  const rest = new REST().setToken(CONFIG.TOKEN);

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    const data = (await rest.put(
      Routes.applicationGuildCommands(CONFIG.CLIENT_ID, CONFIG.GUILD_ID),
      { body: commands },
    )) as RESTPostAPIApplicationCommandsJSONBody[];

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    console.error(error);
  }
}

loadCommands().catch((error) => {
  console.error("Error loading commands:", error);
  process.exit(1);
});
