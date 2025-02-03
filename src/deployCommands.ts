import {
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
  Client,
} from "discord.js";
import { readdir } from "fs/promises";
import { join } from "path/posix";
import { Command, SlashCommand } from "./types";
import { CONFIG } from "./config";
import fs from "fs";
import path from "path";
import logger from "./logger";

const commands: Command[] = [];
const foldersPath = join(__dirname, "commands");

async function loadCommands(client: Client) {
  const commandsPath = path.join(__dirname, "../commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command: SlashCommand = require(filePath);
    client.slashCommands.set(command.command.name, command);
  }
}

async function loadCommandsOld() {
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
    logger.info(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    const data = (await rest.put(
      Routes.applicationGuildCommands(CONFIG.CLIENT_ID, CONFIG.GUILD_ID),
      { body: commands },
    )) as RESTPostAPIApplicationCommandsJSONBody[];

    logger.info(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    console.error(error);
  }
}

loadCommandsOld().catch((error) => {
  console.error("Error loading commands:", error);
  process.exit(1);
});
