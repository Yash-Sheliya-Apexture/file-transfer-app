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
//       // Very long timeout (30 minutes) to handle large file streams without aborting
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
//     // ** THE FIX **
//     // This parameter is crucial. It ensures that the file is created with the
//     // ownership model of the parent folder. Since you own the folder, you will
//     // own the file, and it will count against YOUR storage quota.
//     supportsAllDrives: true,
//   });
//   return response.data;
// };

// exports.getFileStream = async (fileId) => {
//   const response = await drive.files.get(
//     { 
//       fileId: fileId, 
//       alt: 'media',
//       // This is good practice to include for consistency
//       supportsAllDrives: true,
//     },
//     { 
//       responseType: 'stream',
//       // UPDATED TIMEOUT: 2 hours (120 minutes * 60 seconds * 1000 milliseconds)
//       timeout: 120 * 60 * 1000 
//     }
//   );
//   return response.data;
// };

// exports.deleteFile = async (fileId) => {
//   await drive.files.delete({ 
//     fileId: fileId,
//     // This is good practice to include for consistency
//     supportsAllDrives: true,
//   });
// };

// exports.listAllFiles = async () => {
//     const response = await drive.files.list({
//         q: `'${GDRIVE_FOLDER_ID}' in parents and trashed = false`,
//         fields: 'files(id, name)',
//         // These parameters ensure compatibility with all drive types
//         supportsAllDrives: true,
//         includeItemsFromAllDrives: true,
//     });
//     return response.data.files || [];
// };


// // server/src/services/googleDrive.service.js
// const { google } = require('googleapis');
// const fs = require('fs');
// const path = require('path');

// const SCOPES = ['https://www.googleapis.com/auth/drive'];
// const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID;
// const GDriveOwnerEmail = process.env.GDRIVE_OWNER_EMAIL;

// function loadCredentials() {
//     if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON) {
//         try {
//             console.log("Loading credentials from GOOGLE_SERVICE_ACCOUNT_KEY_JSON environment variable.");
//             return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON);
//         } catch (error) {
//             console.error("FATAL: Could not parse GOOGLE_SERVICE_ACCOUNT_KEY_JSON.", error);
//             throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY_JSON environment variable.");
//         }
//     } else if (process.env.GOOGLE_CREDENTIALS_PATH) {
//         try {
//             const keyFilePath = path.resolve(process.cwd(), process.env.GOOGLE_CREDENTIALS_PATH);
//             console.log(`Loading credentials from resolved file path: ${keyFilePath}`);
//             const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');
//             return JSON.parse(keyFileContent);
//         } catch (error) {
//             console.error(`FATAL: Could not read or parse credentials file at ${process.env.GOOGLE_CREDENTIALS_PATH}.`, error);
//             throw new Error("Invalid GOOGLE_CREDENTIALS_PATH or file content.");
//         }
//     } else {
//         throw new Error("FATAL: Google credentials not configured. Set either GOOGLE_SERVICE_ACCOUNT_KEY_JSON or GOOGLE_CREDENTIALS_PATH.");
//     }
// }

// const credentials = loadCredentials();

// const auth = new google.auth.GoogleAuth({
//   credentials,
//   scopes: SCOPES,
// });

// const drive = google.drive({ version: 'v3', auth });

// exports.createFile = async (fileName, mimeType, fileStream) => {
//   const response = await drive.files.create({
//     requestBody: { name: fileName, parents: [GDRIVE_FOLDER_ID] },
//     media: { mimeType: mimeType, body: fileStream },
//     supportsAllDrives: true,
//   });
//   return response.data;
// };

// exports.transferOwnership = async (fileId) => {
//     if (!GDriveOwnerEmail) {
//         console.warn("GDRIVE_OWNER_EMAIL not set. Cannot transfer ownership. File will remain on service account quota.");
//         return;
//     }
//     try {
//         await drive.permissions.create({
//             fileId: fileId,
//             transferOwnership: true,
//             requestBody: {
//                 role: 'owner',
//                 type: 'user',
//                 emailAddress: GDriveOwnerEmail,
//             },
//             supportsAllDrives: true,
//         });
//         console.log(`Successfully transferred ownership of ${fileId} to ${GDriveOwnerEmail}`);
//     } catch(error) {
//         console.error(`Failed to transfer ownership for file ${fileId}:`, error.message);
//     }
// };

// exports.getFileStream = async (fileId) => {
//   const response = await drive.files.get(
//     { fileId, alt: 'media', supportsAllDrives: true },
//     { responseType: 'stream', timeout: 120 * 60 * 1000 }
//   );
//   return response.data;
// };

// exports.deleteFile = async (fileId) => {
//   await drive.files.delete({ fileId, supportsAllDrives: true });
// };

// exports.listAllFiles = async () => {
//     const response = await drive.files.list({
//         q: `'${GDRIVE_FOLDER_ID}' in parents and trashed = false`,
//         fields: 'files(id, name)',
//         supportsAllDrives: true,
//         includeItemsFromAllDrives: true,
//     });
//     return response.data.files || [];
// };


// // server/src/services/googleDrive.service.js
// const { google } = require('googleapis');

// // --- NEW OAUTH 2.0 CONFIGURATION ---
// const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID;
// const GDRIVE_CLIENT_ID = process.env.GDRIVE_CLIENT_ID;
// const GDRIVE_CLIENT_SECRET = process.env.GDRIVE_CLIENT_SECRET;
// const GDRIVE_REDIRECT_URI = process.env.GDRIVE_REDIRECT_URI;
// const GDRIVE_REFRESH_TOKEN = process.env.GDRIVE_REFRESH_TOKEN;

// // Validate that all required environment variables are set
// if (!GDRIVE_FOLDER_ID || !GDRIVE_CLIENT_ID || !GDRIVE_CLIENT_SECRET || !GDRIVE_REDIRECT_URI || !GDRIVE_REFRESH_TOKEN) {
//     throw new Error("FATAL: Google Drive OAuth 2.0 credentials are not fully configured. Please check your .env file.");
// }

// // Create an OAuth2 client
// const oAuth2Client = new google.auth.OAuth2(
//     GDRIVE_CLIENT_ID,
//     GDRIVE_CLIENT_SECRET,
//     GDRIVE_REDIRECT_URI
// );

// // Set the refresh token, which allows us to get new access tokens automatically
// oAuth2Client.setCredentials({ refresh_token: GDRIVE_REFRESH_TOKEN });

// // --- THE FIX IS HERE ---
// // We initialize the Drive API with a custom, much longer timeout.
// // This tells gaxios (the underlying HTTP client) to wait up to 2 hours for a response.
// const drive = google.drive({
//   version: 'v3',
//   auth: oAuth2Client,
//   // Set a global timeout for all requests made with this drive object.
//   // The value is in milliseconds. 120 * 60 * 1000 = 2 hours.
//   requestConfig: {
//     timeout: 120 * 60 * 1000,
//   },
// });
// // --- END OF FIX ---


// // Your `createFile` function does NOT need to change.
// exports.createFile = async (fileName, mimeType, fileStream) => {
//   const response = await drive.files.create({
//     requestBody: { name: fileName, parents: [GDRIVE_FOLDER_ID] },
//     media: { mimeType: mimeType, body: fileStream },
//     supportsAllDrives: true,
//   });
//   return response.data;
// };

// exports.transferOwnership = async (fileId) => {
//     console.log(`OAuth2 Client used: Ownership of ${fileId} is already correct. No transfer needed.`);
//     return;
// };

// // Also apply a long timeout for downloads, just in case.
// exports.getFileStream = async (fileId) => {
//   const response = await drive.files.get(
//     { fileId, alt: 'media', supportsAllDrives: true },
//     { responseType: 'stream', timeout: 120 * 60 * 1000 }
//   );
//   return response.data;
// };

// exports.deleteFile = async (fileId) => {
//   await drive.files.delete({ fileId, supportsAllDrives: true });
// };

// exports.listAllFiles = async () => {
//     const response = await drive.files.list({
//         q: `'${GDRIVE_FOLDER_ID}' in parents and trashed = false`,
//         fields: 'files(id, name)',
//         supportsAllDrives: true,
//         includeItemsFromAllDrives: true,
//     });
//     return response.data.files || [];
// };

// server/src/services/googleDrive.service.js
const { google } = require('googleapis');
const axios = require('axios');

// --- OAUTH 2.0 CONFIGURATION ---
const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID;
const GDRIVE_CLIENT_ID = process.env.GDRIVE_CLIENT_ID;
const GDRIVE_CLIENT_SECRET = process.env.GDRIVE_CLIENT_SECRET;
const GDRIVE_REDIRECT_URI = process.env.GDRIVE_REDIRECT_URI;
const GDRIVE_REFRESH_TOKEN = process.env.GDRIVE_REFRESH_TOKEN;

if (!GDRIVE_FOLDER_ID || !GDRIVE_CLIENT_ID || !GDRIVE_CLIENT_SECRET || !GDRIVE_REDIRECT_URI || !GDRIVE_REFRESH_TOKEN) {
    throw new Error("FATAL: Google Drive OAuth 2.0 credentials are not fully configured. Please check your .env file.");
}

const oAuth2Client = new google.auth.OAuth2(
    GDRIVE_CLIENT_ID,
    GDRIVE_CLIENT_SECRET,
    GDRIVE_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: GDRIVE_REFRESH_TOKEN });

// --- THE FINAL AND CORRECT HIGH-SPEED UPLOAD INITIATION FUNCTION ---
exports.initiateResumableUpload = async (fileName, mimeType, fileSize, origin) => {
  try {
    const { token } = await oAuth2Client.getAccessToken();
    if (!token) {
      throw new Error("Unable to retrieve Google Drive access token.");
    }

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GDRIVE_FOLDER_ID],
    };

    // Define the precise headers required by the Google Drive Resumable Upload API
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': mimeType,
      'X-Upload-Content-Length': fileSize.toString(),
      // --- THE CRITICAL FIX (Part 2): Tell Google which website is allowed to use the upload URL ---
      'Origin': origin,
    };

    const response = await axios.post(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      fileMetadata,
      { headers }
    );

    const uploadUrl = response.headers.location;
    if (!uploadUrl) {
      throw new Error("Google Drive API did not return a valid 'location' header for the upload session.");
    }
    
    return { uploadUrl };

  } catch (error) {
    console.error(
      "Google Drive Init Error:", 
      error.response ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` : error.message
    );
    throw new Error("Failed to create Google Drive upload session.");
  }
};

// --- All other functions remain unchanged. They are already correct. ---

exports.getFileStream = async (fileId) => {
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  const response = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'stream', timeout: 120 * 60 * 1000 }
  );
  return response.data;
};

exports.deleteFile = async (fileId) => {
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  await drive.files.delete({ fileId, supportsAllDrives: true });
};

exports.listAllFiles = async () => {
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  const response = await drive.files.list({
      q: `'${GDRIVE_FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
  });
  return response.data.files || [];
};
