# AdCense Chrome Extension

![Chrome](https://img.shields.io/badge/Chrome-%234285F4.svg?style=for-the-badge&logo=googlechrome&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)
![Webpack](https://img.shields.io/badge/webpack-%238DD6F9.svg?style=for-the-badge&logo=webpack&logoColor=black)

AdCense is a Chrome extension that helps you browse websites faster and cleaner by blocking intrusive advertisements. It is designed specifically to use a list of predefined ad domains and CSS selectors to detect and block pop-up ads and other intrusive ad formats.

## Features

- **Pop-up Ad Blocking**: Blocks pop-up ads on websites to enhance user experience.
- **Custom Ad Domains**: AdCense fetches and updates ad domain lists from a backend Laravel service to ensure up-to-date protection.
- **Selective Blocking**: Users can choose to block ads for an entire site or just a specific page.
- **Minimal Resource Usage**: Optimized for performance, ensuring it runs efficiently in the background.
- **Easy Installation and Usage**: Simple setup and intuitive user interface.

## Technologies Used

- **JavaScript**: The core language used to develop the extension's logic.
- **Webpack**: Bundles the JavaScript files for optimized performance.
- **Chrome API**: Utilizes Chrome’s declarativeNetRequest, alarms, tabs, and storage APIs to manage ad blocking and user preferences.
- **Laravel Backend**: Provides the domain lists used by AdCense to block ads.

## Installation

To install and run AdCense locally:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/psyofrelief/adcense-extension.git
   ```
2. **Navigate to the Project Directory:**
   ```bash
   cd adcense-extension
   ```
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Build the Extension:**
   ```bash
   npm run build
   ```
   This will bundle and minify the JavaScript and CSS files using Webpack.
5. **Load the Extension in Chrome:**
   - Open Chrome and go to `chrome://extensions/`.
   - Enable "Developer mode" using the toggle switch in the top right.
   - Click on "Load unpacked" and select the `dist` folder generated in the previous step.

## Usage

- **Block Ads on a Site**: Open the extension popup and click on "Block Site" to block ads across the entire site.
- **Block Ads on a Page**: Open the extension popup and click on "Block Page" to block ads only on the current page.
- **Turn Off Blocking**: Disable ad blocking by clicking on "Turn Off" in the extension popup.
- **Automatic Updates**: The extension fetches the latest ad domains from the Laravel backend every 24 hours.

## Development

### Folder Structure

- **`/src`**: Contains the source JavaScript files (`background.js`, `contentScript.js`, `popup.js`).
- **`/public`**: Holds static assets like the HTML, CSS, and icon files.
- **`/dist`**: The Webpack output directory containing the bundled files ready for deployment.

### Key Components

- **background.js**: Handles alarms, storage, and background tasks such as updating ad domain lists and applying blocking rules.
- **contentScript.js**: Applies the ad blocking rules directly on the webpage.
- **popup.js**: Manages the extension popup UI, enabling users to interact with the ad blocker.
- **Laravel Backend**: The backend fetches and parses EasyList domains and provides them to the extension.

## Preview

### Extension Popup

![Popup UI Preview](https://imgur.com/yiYx54C.png)

## Contributing

Contributions are welcome! If you’d like to improve AdCense, please fork the repository and submit a pull request.

## License

AdCense is open-sourced software licensed under the [MIT License](LICENSE).
