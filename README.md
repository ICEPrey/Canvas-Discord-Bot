<a name="readme-top"></a>
<br />

<div align="center">
  <a href="https://github.com/ICEPrey/Canvas-Discord-Bot">
    <img src="https://www.uab.edu/elearning/images/pictures/academic-technologies/logos/canvas.png" alt="Logo" width="288" height="288">
    <p style="font-style: italic; font-size: 0.8em;">The Canvas logo is used for identification purposes only and remains the property of Instructure, Inc.</p>

  </a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

  <h3 align="center">Canvas Discord Bot</h3>

  <p align="center">
    An awesome Canvas Discord bot to assist and connect your Discord server with Canvas!
    ·
    <a href="https://github.com/ICEPrey/Canvas-Discord-Bot/issues">Report Bug</a>
    ·
    <a href="https://github.com/ICEPrey/Canvas-Discord-Bot/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-canvas-discord-bot">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#canvas-instructions">Canvas Instructions</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Canvas Discord Bot

🔔 Stay Informed: Receive instant notifications about upcoming assignments, quizzes, and important announcements in your DM's. Never miss a due date again!

### Disclaimer

This project is not affiliated with, maintained, or endorsed by Instructure, Inc. or Canvas LMS. It is an independent third-party integration.


(Still Developing) 📅 Synchronized Calendars: Sync your Canvas course calendars with your Discord server to effortlessly manage your schedule. The bot ensures that you're always aware of what's ahead.

📢 Announcement Broadcasting: Professors and instructors can easily broadcast course announcements to your DM's, ensuring effective communication with students.

📋 Assignment Details: Quickly access assignment descriptions, without leaving Discord. The bot enhances your efficiency by keeping everything within your reach.

(Still Developing) 📊 Grade Notifications: Receive instant updates when your grades are posted. Celebrate your successes and track your progress without constantly logging into Canvas.

🔒 Security Matters: Your privacy and data security is top priority. The bot operates within authorized channels and follows all relevant security protocols.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![supabase][supabase]][supabase-url]
- [![bun][bun]][bun-url]
- [![discordjs][discordjs]][discordjs-url]
- [![typescript][typescript]][typescripturl]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

Node.js: Make sure you have Node.js installed on your system. If not, you can download it from the official Node.js website.

Canvas API Credentials:

- Go to your Canvas LMS account settings
- Look for the "Approved Integrations" or "API Access Tokens" section
- Generate a new API token
- Copy the generated token and paste it into the .env file
- Keep this token secure as it provides access to your Canvas account

Discord Bot Token:

- Go to the Discord Developer Portal (discord.com/developers/applications)
- Create a new application and add a bot to it
- Find the bot token in the "Bot" section
- Copy the bot token and paste it into the .env file
- Invite the bot to your Discord server using the OAuth2 URL generator

Supabase Account:

- Set up a Supabase account at supabase.com
- Create a new project (you can use the "Free" tier)
- Find the project URL and anonymous key in "Settings" > "API"
- Paste the project URL and anonymous key into the .env file
- Then navigate to the sql editor in Supabase and copy the setup.sql script into the SQL editor in Supabase to create the database schema

### Prerequisites

- bun
  ```sh
  bun add bun@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/ICEPrey/Canvas-Discord-Bot
   ```
2. Install NPM packages
   ```sh
   bun install
   ```

### Start the project

1.  Compile the project
    ```sh
    bun run watch
    ```
2.  Run the project
    ```sh
    bun run start
    ```
    <p align="right">(<a href="#readme-top">back to top</a>)</p>

# Available Commands

```js
/account (to insert canvas token)
/assigment (to display assignments from canvas)
/missing (to dm you missing assignments)
```

# Canvas Instructions

## Step 1

![canvas1]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Step 2

![canvas2]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Step 3

![canvas3]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See [license] for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[contributors-shield]: https://img.shields.io/github/stars/ICEPrey/Canvas-Discord-Bot.svg?style=for-the-badge
[contributors-url]: https://github.com/ICEPrey/Canvas-Discord-Bot/graphs/contributors
[forks-shield]: https://img.shields.io/github/stars/ICEPrey/Canvas-Discord-Bot.svg?style=for-the-badge
[forks-url]: https://github.com/ICEPrey/Canvas-Discord-Bot/network/members
[stars-shield]: https://img.shields.io/github/stars/ICEPrey/Canvas-Discord-Bot.svg?style=for-the-badge
[stars-url]: https://github.com/ICEPrey/Canvas-Discord-Bot/stargazers
[issues-shield]: https://img.shields.io/github/stars/ICEPrey/Canvas-Discord-Bot.svg?style=for-the-badge
[issues-url]: https://github.com/ICEPrey/Canvas-Discord-Bot/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/ICEPrey/Canvas-Discord-Bot/License.MD
[product-screenshot]: images/screenshot.png
[bun]: https://img.shields.io/badge/Bun-339933?style=for-the-badge&logo=bun&logoColor=white
[supabase]: https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white
[discordjs]: https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white
[bun-url]: https://bun.sh/
[supabase-url]: https://supabase.com/
[discordjs-url]: https://discord.js.org/
[canvas1]: images/canvas/canvasStep1.png
[canvas2]: images/canvas/canvasStep2.png
[canvas3]: images/canvas/canvasStep3.png
[license]: License.MD
[typescript]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[typescripturl]: https://www.typescriptlang.org/

```

```
