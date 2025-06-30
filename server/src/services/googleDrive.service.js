// const { google } = require('googleapis');
// const path = require('path');
// const fs = require('fs');

// // 1. Use the .env variable and build a reliable absolute path
// // CORRECT AND FOOLPROOF
// const KEYFILEPATH = path.resolve(__dirname, '../config/service-account-key.json');

// const SCOPES = ['https://www.googleapis.com/auth/drive'];
// const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID;

// // 2. This will now find the file correctly
// const auth = new google.auth.GoogleAuth({
//   keyFile: KEYFILEPATH,
//   scopes: SCOPES,
// });

// const drive = google.drive({ version: 'v3', auth });

// // Creates a file in Google Drive and returns its ID
// exports.createFile = async (fileName, mimeType, fileStream) => {
//     const response = await drive.files.create({
//         requestBody: {
//             name: fileName,
//             parents: [GDRIVE_FOLDER_ID],
//         },
//         media: {
//             mimeType: mimeType,
//             body: fileStream,
//         },
//     });
//     return response.data;
// };

// // Gets a readable stream for a file from Google Drive
// exports.getFileStream = async (fileId) => {
//     const response = await drive.files.get(
//         { fileId: fileId, alt: 'media' },
//         { responseType: 'stream' }
//     );
//     return response.data;
// };

// // Deletes a file from Google Drive
// exports.deleteFile = async (fileId) => {
//     await drive.files.delete({ fileId: fileId });
// };

// // server/src/service/googleDrive.service.js
// const { google } = require('googleapis');
// const path = require('path');

// // --- Configuration ---

// // Path to your service account key file.
// const KEYFILEPATH = path.resolve(__dirname, '../config/service-account-key.json');

// // The required permission scope for Google Drive.
// const SCOPES = ['https://www.googleapis.com/auth/drive'];

// // The ID of the folder in your personal Drive where files will be uploaded.
// const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID;


// // --- Authentication Setup ---

// // We are now using the simplest form of Service Account authentication.
// // It will use its own identity. Ensure your Drive folder is shared
// // with the service account's email address.
// const auth = new google.auth.GoogleAuth({
//   keyFile: KEYFILEPATH,
//   scopes: SCOPES,
// });

// // Create the Google Drive API client instance.
// const drive = google.drive({ version: 'v3', auth });


// // --- Exported Service Functions (No changes here) ---

// exports.createFile = async (fileName, mimeType, fileStream) => {
//     const response = await drive.files.create({
//         requestBody: {
//             name: fileName,
//             parents: [GDRIVE_FOLDER_ID],
//         },
//         media: {
//             mimeType: mimeType,
//             body: fileStream,
//         },
//     });
//     return response.data;
// };

// exports.getFileStream = async (fileId) => {
//     const response = await drive.files.get(
//         { fileId: fileId, alt: 'media' },
//         { responseType: 'stream' }
//     );
//     return response.data;
// };

// exports.deleteFile = async (fileId) => {
//     await drive.files.delete({ fileId: fileId });
// };

// exports.listAllFiles = async () => {
//     const response = await drive.files.list({
//         q: `'${GDRIVE_FOLDER_ID}' in parents and trashed = false`,
//         fields: 'files(id, name)',
//     });
//     return response.data.files;
// };


// const { google } = require('googleapis');
// const path = require('path');

// const KEYFILEPATH = path.resolve(__dirname, '../config/service-account-key.json');
// const SCOPES = ['https://www.googleapis.com/auth/drive'];
// const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID;

// const auth = new google.auth.GoogleAuth({
//   keyFile: KEYFILEPATH,
//   scopes: SCOPES,
// });

// const drive = google.drive({ version: 'v3', auth });

// exports.createFile = async (fileName, mimeType, fileStream) => {
//   const response = await drive.files.create({
//     requestBody: {
//       name: fileName,
//       parents: [GDRIVE_FOLDER_ID],
//     },
//     media: {
//       mimeType: mimeType,
//       body: fileStream,
//     },
//   });
//   return response.data;
// };

// // ADD a timeout to this function
// exports.getFileStream = async (fileId) => {
//   const response = await drive.files.get(
//     { fileId: fileId, alt: 'media' },
//     { 
//       responseType: 'stream',
//       // Set a reasonable timeout (e.g., 60 seconds) to prevent stalls
//       timeout: 60000 
//     }
//   );
//   return response.data;
// };

// exports.deleteFile = async (fileId) => {
//   await drive.files.delete({ fileId: fileId });
// };

// exports.listAllFiles = async () => {
//   const response = await drive.files.list({
//     q: `'${GDRIVE_FOLDER_ID}' in parents and trashed = false`,
//     fields: 'files(id, name)',
//   });
//   return response.data.files || [];
// };

// // server/src/services/googleDrive.service.js
// const { google } = require('googleapis');
// const path = require('path');

// // ... (config remains the same)
// const KEYFILEPATH = path.resolve(__dirname, '../config/service-account-key.json');
// const SCOPES = ['https://www.googleapis.com/auth/drive'];
// const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID;

// const auth = new google.auth.GoogleAuth({
//   keyFile: KEYFILEPATH,
//   scopes: SCOPES,
// });

// const drive = google.drive({ version: 'v3', auth });

// exports.createFile = async (fileName, mimeType, fileStream) => {
//   // ... (this function is correct)
//   const response = await drive.files.create({
//     requestBody: { name: fileName, parents: [GDRIVE_FOLDER_ID] },
//     media: { mimeType: mimeType, body: fileStream },
//   });
//   return response.data;
// };

// exports.getFileStream = async (fileId) => {
//   const response = await drive.files.get(
//     { fileId: fileId, alt: 'media' },
//     { 
//       responseType: 'stream',
//       // INCREASE TIMEOUT: 5 minutes. This should be enough for even large files to start streaming.
//       timeout: 5 * 60 * 1000 
//     }
//   );
//   return response.data;
// };

// // ... (deleteFile and listAllFiles are correct)
// exports.deleteFile = async (fileId) => { await drive.files.delete({ fileId: fileId }); };
// exports.listAllFiles = async () => {
//     const response = await drive.files.list({
//         q: `'${GDRIVE_FOLDER_ID}' in parents and trashed = false`,
//         fields: 'files(id, name)',
//     });
//     return response.data.files || [];
// };

// // server/src/services/googleDrive.service.js

// const { google } = require('googleapis');
// const fs = require('fs');
// const path = require('path');

// // --- Configuration ---
// const SCOPES = ['https://www.googleapis.com/auth/drive'];
// const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID;

// // --- DYNAMIC CREDENTIALS LOADER ---
// function loadCredentials() {
//     if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON) {
//         try {
//             console.log("Loading credentials from GOOGLE_SERVICE_ACCOUNT_KEY_JSON environment variable.");
//             return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON);
//         } catch (error) {
//             console.error("FATAL: Could not parse GOOGLE_SERVICE_ACCOUNT_KEY_JSON.", error);
//             throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY_JSON environment variable.");
//         }
//     }
//     else if (process.env.GOOGLE_CREDENTIALS_PATH) {
//         try {
//             // This builds an absolute path from the root of where the node process is running
//             const keyFilePath = path.resolve(process.cwd(), process.env.GOOGLE_CREDENTIALS_PATH);
//             console.log(`Loading credentials from resolved file path: ${keyFilePath}`);
//             const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');
//             return JSON.parse(keyFileContent);
//         } catch (error) {
//             console.error(`FATAL: Could not read or parse the credentials file at ${process.env.GOOGLE_CREDENTIALS_PATH}.`, error);
//             throw new Error("Invalid GOOGLE_CREDENTIALS_PATH or file content.");
//         }
//     }
//     else {
//         throw new Error("FATAL: Google credentials not configured. Set either GOOGLE_SERVICE_ACCOUNT_KEY_JSON (for production) or GOOGLE_CREDENTIALS_PATH (for development).");
//     }
// }

// const credentials = loadCredentials();

// // --- Authentication Setup ---
// const auth = new google.auth.GoogleAuth({
//   credentials,
//   scopes: SCOPES,
// });

// const drive = google.drive({ version: 'v3', auth });

// // The rest of the file is correct and remains unchanged.
// exports.createFile = async (fileName, mimeType, fileStream) => {
//   const response = await drive.files.create({
//     requestBody: { name: fileName, parents: [GDRIVE_FOLDER_ID] },
//     media: { mimeType: mimeType, body: fileStream },
//   });
//   return response.data;
// };

// exports.getFileStream = async (fileId) => {
//   const response = await drive.files.get(
//     { fileId: fileId, alt: 'media' },
//     { 
//       responseType: 'stream',
//       timeout: 5 * 60 * 1000
//     }
//   );
//   return response.data;
// };

// exports.deleteFile = async (fileId) => {
//   await drive.files.delete({ fileId: fileId });
// };

// exports.listAllFiles = async () => {
//     const response = await drive.files.list({
//         q: `'${GDRIVE_FOLDER_ID}' in parents and trashed = false`,
//         fields: 'files(id, name)',
//     });
//     return response.data.files || [];
// };


// // server/src/services/googleDrive.service.js

// const { google } = require('googleapis');
// const fs = require('fs');
// const path = require('path');

// // --- Configuration ---
// const SCOPES = ['https://www.googleapis.com/auth/drive'];
// const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID;

// // --- DYNAMIC CREDENTIALS LOADER ---
// function loadCredentials() {
//     // For production (like Render), use the environment variable
//     if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON) {
//         try {
//             console.log("Loading credentials from GOOGLE_SERVICE_ACCOUNT_KEY_JSON environment variable.");
//             return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON);
//         } catch (error) {
//             console.error("FATAL: Could not parse GOOGLE_SERVICE_ACCOUNT_KEY_JSON.", error);
//             throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY_JSON environment variable.");
//         }
//     }
//     // For local development, use the file path
//     else if (process.env.GOOGLE_CREDENTIALS_PATH) {
//         try {
//             const keyFilePath = path.resolve(process.cwd(), process.env.GOOGLE_CREDENTIALS_PATH);
//             console.log(`Loading credentials from resolved file path: ${keyFilePath}`);
//             const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');
//             return JSON.parse(keyFileContent);
//         } catch (error) {
//             console.error(`FATAL: Could not read or parse credentials file at ${process.env.GOOGLE_CREDENTIALS_PATH}.`, error);
//             throw new Error("Invalid GOOGLE_CREDENTIALS_PATH or file content.");
//         }
//     }
//     // Fail if no credentials are found
//     else {
//         throw new Error("FATAL: Google credentials not configured. Set either GOOGLE_SERVICE_ACCOUNT_KEY_JSON (for production) or GOOGLE_CREDENTIALS_PATH (for development).");
//     }
// }

// const credentials = loadCredentials();

// // --- Authentication Setup ---
// const auth = new google.auth.GoogleAuth({
//   credentials,
//   scopes: SCOPES,
// });

// const drive = google.drive({ version: 'v3', auth });

// exports.createFile = async (fileName, mimeType, fileStream) => {
//   const response = await drive.files.create({
//     requestBody: { name: fileName, parents: [GDRIVE_FOLDER_ID] },
//     media: { mimeType: mimeType, body: fileStream },
//   });
//   return response.data;
// };

// exports.getFileStream = async (fileId) => {
//   const response = await drive.files.get(
//     { fileId: fileId, alt: 'media' },
//     { 
//       responseType: 'stream',
//       // UPDATED TIMEOUT: 2 hours (120 minutes * 60 seconds * 1000 milliseconds)
//       timeout: 120 * 60 * 1000 
//     }
//   );
//   return response.data;
// };

// exports.deleteFile = async (fileId) => {
//   await drive.files.delete({ fileId: fileId });
// };

// exports.listAllFiles = async () => {
//     const response = await drive.files.list({
//         q: `'${GDRIVE_FOLDER_ID}' in parents and trashed = false`,
//         fields: 'files(id, name)',
//     });
//     return response.data.files || [];
// };


// server/src/services/googleDrive.service.js

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID;
// IMPORTANT: Add your personal Google account email to the .env file
const GDRIVE_OWNER_EMAIL = process.env.GDRIVE_OWNER_EMAIL;

// --- DYNAMIC CREDENTIALS LOADER (Unchanged) ---
function loadCredentials() {
    if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON) {
        try {
            return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON);
        } catch (error) {
            throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY_JSON environment variable.");
        }
    }
    else if (process.env.GOOGLE_CREDENTIALS_PATH) {
        try {
            const keyFilePath = path.resolve(process.cwd(), process.env.GOOGLE_CREDENTIALS_PATH);
            return JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
        } catch (error) {
            throw new Error("Invalid GOOGLE_CREDENTIALS_PATH or file content.");
        }
    }
    else {
        throw new Error("FATAL: Google credentials not configured.");
    }
}

const credentials = loadCredentials();

// --- Authentication Setup ---
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });


// --- CORE FUNCTIONS ---

/**
 * NEW: A function to transfer ownership of a file to your personal account.
 */
async function transferOwnership(fileId) {
    if (!GDRIVE_OWNER_EMAIL) {
        console.warn("GDRIVE_OWNER_EMAIL not set. Skipping ownership transfer. Files will count against service account quota.");
        return;
    }
    // First, grant owner permission to your personal email
    await drive.permissions.create({
        fileId: fileId,
        requestBody: {
            role: 'owner',
            type: 'user',
            emailAddress: GDRIVE_OWNER_EMAIL,
        },
        // IMPORTANT: This allows transferring ownership away from the service account
        transferOwnership: true,
    });
    console.log(`Ownership of file ${fileId} transferred to ${GDRIVE_OWNER_EMAIL}.`);
}

/**
 * UPDATED: The main file creation function now transfers ownership after upload.
 */
exports.createFile = async (fileName, mimeType, fileStream) => {
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [GDRIVE_FOLDER_ID],
    },
    media: {
      mimeType: mimeType,
      body: fileStream,
    },
    // Add fields to ensure we get the file ID back
    fields: 'id' 
  });

  const fileId = response.data.id;
  if (fileId) {
    // After creating the file, immediately transfer ownership to your account
    await transferOwnership(fileId);
  }
  
  return response.data;
};


// --- OTHER FUNCTIONS (Unchanged) ---
exports.getFileStream = async (fileId) => {
  const response = await drive.files.get(
    { fileId: fileId, alt: 'media' },
    { 
      responseType: 'stream',
      timeout: 120 * 60 * 1000 // 2-hour timeout
    }
  );
  return response.data;
};

exports.deleteFile = async (fileId) => {
  await drive.files.delete({ fileId: fileId });
};

exports.listAllFiles = async () => {
    const response = await drive.files.list({
        q: `'${GDRIVE_FOLDER_ID}' in parents and trashed = false`,
        fields: 'files(id, name)',
    });
    return response.data.files || [];
};