import { ColorResolvable } from "discord.js";

const colors: ColorResolvable[] = [
  "Default",
  "White",
  "Aqua",
  "Green",
  "Blue",
  "Yellow",
  "Purple",
  "LuminousVividPink",
  "Fuchsia",
  "Gold",
  "Orange",
  "Red",
  "Grey",
  "Navy",
  "DarkAqua",
  "DarkGreen",
  "DarkBlue",
  "DarkPurple",
  "DarkVividPink",
  "DarkGold",
  "DarkOrange",
  "DarkRed",
  "DarkGrey",
  "DarkerGrey",
  "LightGrey",
  "DarkNavy",
  "Blurple",
  "Greyple",
  "DarkButNotBlack",
  "NotQuiteBlack",
];
export const randomColor = (): ColorResolvable => {
  return colors[Math.floor(Math.random() * colors.length)];
};
