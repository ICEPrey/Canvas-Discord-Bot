import { Client } from "discord.js";
import { CanvasUser, DataItem } from "../types";
import { fetchUsers } from "./supabase";
import logger from "../logger";

export async function runChecker<T extends DataItem>(
  client: Client,
  fetchData: (userId: string) => Promise<T[]>,
  postData: (userId: string, data: T, discordClient: Client) => Promise<void>,
  logSuccessMessage: string,
  logErrorMessage: string,
  interval: number,
): Promise<void> {
  const sentIds = new Set<number | string>();
  try {
    const userData: CanvasUser[] = await fetchUsers();
    for (const user of userData) {
      const dataItems = await fetchData(user.discord_id);
      for (const dataItem of dataItems) {
        if (!sentIds.has(dataItem.id)) {
          await postData(user.discord_id, dataItem, client);
          sentIds.add(dataItem.id);
        }
      }
    }
    logger.info(logSuccessMessage);
  } catch (error) {
    logger.error({ error }, logErrorMessage);
  } finally {
    setTimeout(
      () =>
        runChecker(
          client,
          fetchData,
          postData,
          logSuccessMessage,
          logErrorMessage,
          interval,
        ),
      interval,
    );
    logger.info(`Next check in ${interval / 3600000} hours.`);
  }
}
