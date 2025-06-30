// // server/src/server.js
// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./utils/database');

// const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
// const fileRoutes = require('./routes/file.routes');
// const errorMiddleware = require('./middleware/error.middleware');
// const gDriveService = require('./services/googleDrive.service');
// const File = require('./models/File');
// // Connect to Database
// connectDB();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/files', fileRoutes);

// // Error Handling Middleware
// app.use(errorMiddleware);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     // Run the cleanup function on server start
//     runDriveCleanup();
// });

// // NEW JANITOR FUNCTION
// async function runDriveCleanup() {
//     console.log('Running Google Drive cleanup job...');
//     try {
//         const driveFiles = await gDriveService.listAllFiles();
//         if (driveFiles.length === 0) {
//             console.log('Drive folder is already clean. No action needed.');
//             return;
//         }

//         for (const driveFile of driveFiles) {
//             // Check if this file is properly archived in our database
//             const dbFile = await File.findOne({ 
//                 gDriveFileId: driveFile.id,
//                 status: 'IN_TELEGRAM' 
//             });
//             console.log(`Found orphaned file in Drive: ${driveFile.name} (${driveFile.id}). Deleting...`);
//             await gDriveService.deleteFile(driveFile.id);
//         }
//         console.log('Google Drive cleanup job finished.');
//     } catch (error) {
//         console.error('Error during Google Drive cleanup:', error);
//     }
// }

// // server/src/server.js
// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./utils/database');

// const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
// const fileRoutes = require('./routes/file.routes');
// const errorMiddleware = require('./middleware/error.middleware');
// const gDriveService = require('./services/googleDrive.service');
// const File = require('./models/File');
// // Connect to Database
// connectDB();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/files', fileRoutes);

// // Error Handling Middleware
// app.use(errorMiddleware);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     // Run the cleanup function on server start
//     runDriveCleanup();
// });

// // FIXED JANITOR FUNCTION
// async function runDriveCleanup() {
//   console.log('Running Google Drive cleanup job...');
//   try {
//     const driveFiles = await gDriveService.listAllFiles();
//     if (!driveFiles || driveFiles.length === 0) {
//       console.log('Drive folder is already clean or inaccessible. No action needed.');
//       return;
//     }

//     for (const driveFile of driveFiles) {
//       // Find the corresponding file in our database.
//       const dbFile = await File.findOne({ gDriveFileId: driveFile.id });

//       // An orphan is a file in Drive that:
//       // 1. Doesn't exist in our DB (upload failed before DB record was finalized).
//       // 2. Exists in our DB but is marked as IN_TELEGRAM (post-transfer cleanup failed).
//       // 3. Exists in our DB but is marked as ERROR.
//       if (!dbFile || dbFile.status === 'IN_TELEGRAM' || dbFile.status === 'ERROR') {
//         let reason = 'not tracked in database';
//         if (dbFile) {
//           reason = `status is '${dbFile.status}'`;
//         }
//         console.log(`Found orphaned file in Drive: ${driveFile.name} (${driveFile.id}). Reason: ${reason}. Deleting...`);
//         await gDriveService.deleteFile(driveFile.id);
//       }
//     }
//     console.log('Google Drive cleanup job finished.');
//   } catch (error) {
//     console.error('Error during Google Drive cleanup:', error);
//   }
// }

// // server/src/server.js

// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./utils/database');

// const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
// const fileRoutes = require('./routes/file.routes');
// const errorMiddleware = require('./middleware/error.middleware');
// const gDriveService = require('./services/googleDrive.service');
// const telegramService = require('./services/telegram.service');
// const File = require('./models/File');

// connectDB();

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/files', fileRoutes);

// app.use(errorMiddleware);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
    
//     // Set the interval for the archival job (e.g., every 1 minute for testing, 5 minutes for production)
//     const ARCHIVE_INTERVAL_MS = 1 * 60 * 1000; // 1 minute
//     console.log(`Starting archival janitor. Will run every ${ARCHIVE_INTERVAL_MS / 1000} seconds.`);
    
//     // Run the job periodically
//     setInterval(runArchivalProcess, ARCHIVE_INTERVAL_MS);
    
//     // Run it once on startup after a short delay
//     setTimeout(runArchivalProcess, 5000); // Run after 5 seconds
// });


// // --- NEW, CORRECTED ARCHIVAL LOGIC ---

// /**
//  * This is the main janitor function. It finds groups that are complete and old enough to be archived.
//  */
// async function runArchivalProcess() {
//     console.log('ARCHIVAL JANITOR: Running job...');
//     const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

//     try {
//         // Use MongoDB aggregation to find groups that are ready for archival.
//         const archivableGroups = await File.aggregate([
//             // 1. Find all files that are potential candidates
//             { $match: { status: 'IN_DRIVE', driveUploadTimestamp: { $ne: null } } },
//             // 2. Group them by their groupId to analyze each batch
//             {
//                 $group: {
//                     _id: '$groupId',
//                     countInDrive: { $sum: 1 },
//                     groupTotal: { $first: '$groupTotal' },
//                     lastUploadTime: { $max: '$driveUploadTimestamp' } // Find the timestamp of the newest file in the group
//                 }
//             },
//             // 3. Filter these groups to find the ones that are complete and old enough
//             {
//                 $match: {
//                     $expr: { $eq: ['$countInDrive', '$groupTotal'] }, // The group is complete
//                     lastUploadTime: { $lte: fiveMinutesAgo }         // The entire group is old enough
//                 }
//             }
//         ]);

//         if (archivableGroups.length === 0) {
//             console.log('ARCHIVAL JANITOR: No complete groups are old enough to archive.');
//             return;
//         }

//         console.log(`ARCHIVAL JANITOR: Found ${archivableGroups.length} group(s) to process.`);

//         // Process each identified group sequentially to prevent server overload
//         for (const group of archivableGroups) {
//             const groupId = group._id;
//             console.log(`ARCHIVAL JANITOR: Starting transfer for group ${groupId}.`);
//             await transferGroupToTelegram(groupId);
//         }

//     } catch (error) {
//         console.error('ARCHIVAL JANITOR: Error during group identification:', error);
//     }
//     console.log('ARCHIVAL JANITOR: Job finished.');
// }


// /**
//  * This function takes a groupId, transfers all its files to Telegram,
//  * and then cleans them up from Google Drive.
//  */
// async function transferGroupToTelegram(groupId) {
//   const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });
//   const successfullyTransferred = [];

//   // PHASE 1: TRANSFER ALL FILES TO TELEGRAM
//   for (const fileDoc of filesInGroup) {
//     try {
//       await fileDoc.updateOne({ status: 'ARCHIVING' });

//       const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
//       const CHUNK_SIZE = 15 * 1024 * 1024;
//       let chunkBuffer = Buffer.alloc(0);
//       const uploadPromises = [];
//       let chunkIndex = 0;

//       for await (const data of gDriveStream) {
//         chunkBuffer = Buffer.concat([chunkBuffer, data]);
//         while (chunkBuffer.length >= CHUNK_SIZE) {
//           const chunkToUpload = chunkBuffer.slice(0, CHUNK_SIZE);
//           chunkBuffer = chunkBuffer.slice(CHUNK_SIZE);
//           uploadPromises.push(telegramService.uploadChunk(chunkToUpload, `${fileDoc.originalName}.part${chunkIndex++}`));
//         }
//       }

//       if (chunkBuffer.length > 0) {
//         uploadPromises.push(telegramService.uploadChunk(chunkBuffer, `${fileDoc.originalName}.part${chunkIndex++}`));
//       }

//       const messageIds = await Promise.all(uploadPromises);

//       await fileDoc.updateOne({
//         telegramMessageIds: messageIds,
//         status: 'IN_TELEGRAM',
//       });
//       // Add the successful file to our list for cleanup
//       successfullyTransferred.push(fileDoc);
//       console.log(`Successfully transferred ${fileDoc.originalName} to Telegram.`);

//     } catch (error) {
//       console.error(`Failed to transfer ${fileDoc.originalName} (ID: ${fileDoc._id}) to Telegram:`, error);
//       await fileDoc.updateOne({ status: 'ERROR' });
//     }
//   }

//   // PHASE 2: CLEANUP FROM GOOGLE DRIVE
//   if (successfullyTransferred.length > 0) {
//       console.log(`Starting cleanup of ${successfullyTransferred.length} files from Google Drive for group ${groupId}.`);
//       for (const transferredFile of successfullyTransferred) {
//           try {
//               await gDriveService.deleteFile(transferredFile.gDriveFileId);
//               console.log(`Deleted ${transferredFile.originalName} from Drive.`);
//           } catch(error) {
//               console.error(`Failed to delete file ${transferredFile.gDriveFileId} from Drive during cleanup:`, error);
//           }
//       }
//   }
//    console.log(`Finished processing group ${groupId}.`);
// }

// // server/src/server.js

// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./utils/database');

// const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
// const fileRoutes = require('./routes/file.routes');
// const errorMiddleware = require('./middleware/error.middleware');
// const gDriveService = require('./services/googleDrive.service');
// const telegramService = require('./services/telegram.service');
// const File = require('./models/File');

// connectDB();

// const app = express();

// // --- CORS CONFIGURATION FOR PRODUCTION ---
// // IMPORTANT: You must add your Vercel URL to this list after deploying the frontend.
// const whitelist = [
//     'http://localhost:3000', // For local development
//     process.env.FRONTEND_URL, // This will be your Vercel URL
// ];

// const corsOptions = {
//     origin: function (origin, callback) {
//         // Allow requests with no origin (like mobile apps, Postman, or curl)
//         // and requests from our whitelisted domains.
//         if (!origin || whitelist.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             console.error('CORS Error: Request from origin', origin, 'is not allowed.');
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
// };

// app.use(cors(corsOptions));
// // --- END CORS CONFIGURATION ---

// app.use(express.json());


// // --- HEALTH CHECK ENDPOINT ---
// app.get('/health', (req, res) => {
//     res.status(200).send('OK');
// });


// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/files', fileRoutes);

// app.use(errorMiddleware);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
    
//     // Set the interval for the archival job (5 minutes is good for production)
//     const ARCHIVE_INTERVAL_MS = 5 * 60 * 1000;
//     console.log(`Starting archival janitor. Will run every ${ARCHIVE_INTERVAL_MS / 1000 / 60} minutes.`);
    
//     // Run the job periodically
//     setInterval(runArchivalProcess, ARCHIVE_INTERVAL_MS);
    
//     // Run it once on startup after a short delay
//     setTimeout(runArchivalProcess, 10000);
// });

// // --- ARCHIVAL JANITOR LOGIC ---
// async function runArchivalProcess() {
//     console.log('ARCHIVAL JANITOR: Running job...');
//     const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

//     try {
//         const archivableGroups = await File.aggregate([
//             { $match: { status: 'IN_DRIVE', driveUploadTimestamp: { $ne: null } } },
//             {
//                 $group: {
//                     _id: '$groupId',
//                     countInDrive: { $sum: 1 },
//                     groupTotal: { $first: '$groupTotal' },
//                     lastUploadTime: { $max: '$driveUploadTimestamp' }
//                 }
//             },
//             {
//                 $match: {
//                     $expr: { $eq: ['$countInDrive', '$groupTotal'] },
//                     lastUploadTime: { $lte: fiveMinutesAgo }
//                 }
//             }
//         ]);

//         if (archivableGroups.length === 0) {
//             console.log('ARCHIVAL JANITOR: No complete groups are old enough to archive.');
//             return;
//         }

//         console.log(`ARCHIVAL JANITOR: Found ${archivableGroups.length} group(s) to process.`);
//         for (const group of archivableGroups) {
//             await transferGroupToTelegram(group._id);
//         }

//     } catch (error) {
//         console.error('ARCHIVAL JANITOR: Error during group identification:', error);
//     }
//     console.log('ARCHIVAL JANITOR: Job finished.');
// }

// async function transferGroupToTelegram(groupId) {
//   const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });
//   const successfullyTransferred = [];

//   console.log(`ARCHIVAL JANITOR: Starting transfer for group ${groupId}.`);
//   // PHASE 1: TRANSFER
//   for (const fileDoc of filesInGroup) {
//     try {
//       await fileDoc.updateOne({ status: 'ARCHIVING' });
//       const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
//       const CHUNK_SIZE = 15 * 1024 * 1024;
//       let chunkBuffer = Buffer.alloc(0);
//       const uploadPromises = [];
//       let chunkIndex = 0;
//       for await (const data of gDriveStream) {
//         chunkBuffer = Buffer.concat([chunkBuffer, data]);
//         while (chunkBuffer.length >= CHUNK_SIZE) {
//           const chunkToUpload = chunkBuffer.slice(0, CHUNK_SIZE);
//           chunkBuffer = chunkBuffer.slice(CHUNK_SIZE);
//           uploadPromises.push(telegramService.uploadChunk(chunkToUpload, `${fileDoc.originalName}.part${chunkIndex++}`));
//         }
//       }
//       if (chunkBuffer.length > 0) {
//         uploadPromises.push(telegramService.uploadChunk(chunkBuffer, `${fileDoc.originalName}.part${chunkIndex++}`));
//       }
//       const messageIds = await Promise.all(uploadPromises);
//       await fileDoc.updateOne({ telegramMessageIds: messageIds, status: 'IN_TELEGRAM' });
//       successfullyTransferred.push(fileDoc);
//     } catch (error) {
//       console.error(`Failed to transfer ${fileDoc.originalName}:`, error);
//       await fileDoc.updateOne({ status: 'ERROR' });
//     }
//   }

//   // PHASE 2: CLEANUP
//   if (successfullyTransferred.length > 0) {
//       console.log(`Starting cleanup of ${successfullyTransferred.length} files from Google Drive for group ${groupId}.`);
//       for (const transferredFile of successfullyTransferred) {
//           try {
//               await gDriveService.deleteFile(transferredFile.gDriveFileId);
//           } catch(error) {
//               console.error(`Failed to delete file ${transferredFile.gDriveFileId} from Drive:`, error);
//           }
//       }
//   }
//    console.log(`Finished processing group ${groupId}.`);
// }


// server/src/server.js

const path = require('path');
// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/database');

// Import API routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const fileRoutes = require('./routes/file.routes');

// Import middleware
const errorMiddleware = require('./middleware/error.middleware');

// Import the function to start the background worker
const { initializeWorker } = require('./worker');

// Connect to the database immediately
connectDB();

const app = express();

// --- CORS Configuration for Production and Development ---
// This allows your Vercel frontend to communicate with your Render backend.
const whitelist = [
    'http://localhost:3000',    // For local development
    process.env.FRONTEND_URL,   // Your Vercel URL will be read from this .env variable
].filter(Boolean); // This filters out any undefined/empty values

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman) and whitelisted domains
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error(`CORS Error: Origin ${origin} not allowed.`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

// --- Core Middlewares ---
app.use(cors(corsOptions));
app.use(express.json());

// --- Health Check Endpoint ---
// This is useful for monitoring services like Uptime Robot to keep your free server awake.
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

// --- Error Handling Middleware ---
// This should be the last middleware added.
app.use(errorMiddleware);


const PORT = process.env.PORT || 5000;

// Start the server and listen for requests
app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);

    // --- START THE BACKGROUND WORKER ---
    // After the API server is successfully listening, we initialize the worker.
    // It will run in the same Node.js process and start pulling jobs from the Redis queue.
    console.log("Initializing background worker...");
    initializeWorker();
});