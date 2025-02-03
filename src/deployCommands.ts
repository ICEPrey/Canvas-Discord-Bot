import {
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
  Client,
} from "discord.js";
import { SlashCommand } from "./types";
import { CONFIG } from "./config";
import fs from "fs";
import path from "path";
import logger from "./logger";

async function deployCommands(client: Client) {
  const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
  const commandsPath = path.join(__dirname, "../commands");

  // Load command files
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));

  // Register commands with the client
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command: SlashCommand = await import(filePath).then(
      (module) => module.default,
    );

    // Add type guard to ensure proper typing
    if (isSlashCommand(command)) {
      client.slashCommands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    } else {
      logger.warn(
        `[WARNING] The command at ${filePath} is missing required properties.`,
      );
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
    logger.error("Error deploying commands:", error);
  }
}
// Add type guard for SlashCommand
function isSlashCommand(command: unknown): command is SlashCommand {
  return (
    typeof command === "object" &&
    command !== null &&
    "data" in command &&
    "execute" in command &&
    typeof command.data === "object" &&
    typeof command.execute === "function"
  );
}

const client = new Client({ intents: [] });
deployCommands(client).catch((error) => {
  logger.error("Error loading commands:", error);
  process.exit(1);
});
