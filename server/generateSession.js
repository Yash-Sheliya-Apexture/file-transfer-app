// server/generateSession.js
const { TelegramClient } = require('telegram'); // <-- THE FIX IS HERE
const { StringSession } = require('telegram/sessions'); // <-- AND HERE
const input = require('input');

// These are your personal API credentials from my.telegram.org
const apiId = 27976483;
const apiHash = 'a3ff949f0c2136476414ba6e62475079';

const stringSession = new StringSession('');

(async () => {
    console.log('Starting session generation...');
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text('Please enter your phone number (e.g., +1234567890): '),
        password: async () => await input.text('Please enter your 2FA password (if you have one, press Enter if not): '),
        phoneCode: async () => await input.text('Please enter the code you received from Telegram: '),
        onError: (err) => console.log(err),
    });

    console.log('\n✅ You are now connected to Telegram.');
    
    const sessionString = client.session.save();
    
    console.log('\n\n--- Your Session String ---');
    console.log(sessionString);
    console.log('\n👆 Copy this entire string and paste it into your .env file as a single line for the SESSION_STRING variable.');

    await client.disconnect();
    console.log('Client disconnected. Setup complete.');
})();