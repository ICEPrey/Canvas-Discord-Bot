import { Client } from "discord.js";
import { fetchUser } from "../helpers/supabase";

export async function runChecker(
  client: Client,
  fetchData: (userId: string) => Promise<any[]>,
  postData: (userId: string, data: any, client: Client) => Promise<void>,
  logSuccessMessage: string,
  logErrorMessage: string,
  interval: number,
): Promise<void> {
  const sentIds = new Set<number | string>();

  try {
    const userData = await fetchUser();

    for (const user of userData) {
      const dataItems = await fetchData(user.discord_user);

      dataItems.forEach((dataItem) => {
        if (!sentIds.has(dataItem.id)) {
          postData(user.discord_user, dataItem, client);
          sentIds.add(dataItem.id);
        }
      });
    }

    console.log(logSuccessMessage);
  } catch (error) {
    console.error(logErrorMessage, error);
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
    console.log(`Next check in ${interval / 3600000} hours.`);
  }
}
