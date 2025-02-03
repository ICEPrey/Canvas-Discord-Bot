import { readdir } from "fs/promises";
import { join } from "path/posix";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { CONFIG } from "./config";
import logger from "./logger";

async function main() {
  logger.info("Starting bot...");
  const client: Client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.commands = new Collection();

  const foldersPath = join(__dirname, "commands");
  const commandFolders = await readdir(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = join(foldersPath, folder);
    const commandFiles = (await readdir(commandsPath)).filter((file) =>
      file.endsWith(".js"),
    );

    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const command = await import(filePath);

      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
      } else {
        logger.warn(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
        );
      }
    }
  }

  const eventsPath = join(__dirname, "events");
  const eventFiles = (await readdir(eventsPath)).filter(
    (file) => file.endsWith(".js") && file !== "helpers.js",
  );

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = await import(filePath);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  client.login(CONFIG.TOKEN);
}

main().catch((error) => {
  logger.error(error, "Error in main function");
  process.exit(1);
});
