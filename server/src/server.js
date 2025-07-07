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
// const File = require('./models/File');
// // Import the robust transfer function from the controller
// const { transferGroupToTelegram } = require('./controllers/file.controller');

// connectDB();

// const app = express();

// const whitelist = [
//     'http://localhost:3000',
//     process.env.FRONTEND_URL,
// ].filter(Boolean); // Filter out undefined/null values

// const corsOptions = {
//     origin: function (origin, callback) {
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
// app.use(express.json());

// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/files', fileRoutes);

// app.use(errorMiddleware);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
    
//     const ARCHIVE_INTERVAL_MS = 5 * 60 * 1000;
//     console.log(`Starting archival janitor. Will run every ${ARCHIVE_INTERVAL_MS / 1000 / 60} minutes.`);
    
//     setInterval(runArchivalProcess, ARCHIVE_INTERVAL_MS);
//     setTimeout(runArchivalProcess, 10000);
// });

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
//             // Use the robust, imported transfer function
//             await transferGroupToTelegram(group._id);
//         }

//     } catch (error) {
//         console.error('ARCHIVAL JANITOR: Error during group identification:', error);
//     }
//     console.log('ARCHIVAL JANITOR: Job finished.');
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
// const File = require('./models/File');
// const { transferGroupToTelegram } = require('./controllers/file.controller');

// connectDB();

// const app = express();

// const whitelist = [
//     'http://localhost:3000',
//     process.env.FRONTEND_URL,
// ].filter(Boolean);

// const corsOptions = {
//     origin: function (origin, callback) {
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

// // --- IMPORTANT: Middleware Configuration for Streaming ---
// // We apply the JSON body parser ONLY to the routes that expect JSON data.
// // This leaves the file upload route free to handle raw data streams.
// app.use('/api/auth', express.json(), authRoutes);
// app.use('/api/users', express.json(), userRoutes);

// // The /api/files route does NOT use express.json(), allowing for direct stream handling.
// app.use('/api/files', fileRoutes);
// // --- End Middleware Configuration ---

// app.use(errorMiddleware);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
    
//     const ARCHIVE_INTERVAL_MS = 5 * 60 * 1000;
//     console.log(`Starting archival janitor. Will run every ${ARCHIVE_INTERVAL_MS / 1000 / 60} minutes.`);
    
//     setInterval(runArchivalProcess, ARCHIVE_INTERVAL_MS);
//     setTimeout(runArchivalProcess, 10000);
// });

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
// const File = require('./models/File');
// const { transferGroupToTelegram } = require('./controllers/file.controller');
// const { checkTelegramConnection } = require('./services/telegram.service'); // <-- IMPORT THE KEEPALIVE

// connectDB();

// const app = express();

// // ... (cors configuration is fine)
// const whitelist = [
//     'http://localhost:3000',
//     process.env.FRONTEND_URL,
// ].filter(Boolean);

// const corsOptions = {
//     origin: function (origin, callback) {
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

// // ... (middleware configuration is fine)
// app.use('/api/auth', express.json(), authRoutes);
// app.use('/api/users', express.json(), userRoutes);
// app.use('/api/files', fileRoutes);
// app.use(errorMiddleware);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
    
//     // --- JANITOR PROCESS (NO CHANGE) ---
//     const ARCHIVE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
//     console.log(`Starting archival janitor. Will run every ${ARCHIVE_INTERVAL_MS / 1000 / 60} minutes.`);
//     setInterval(runArchivalProcess, ARCHIVE_INTERVAL_MS);
//     setTimeout(runArchivalProcess, 10000); // Run once after 10s

//     // --- NEW TELEGRAM KEEPALIVE PROCESS ---
//     const TELEGRAM_KEEPALIVE_MS = 4 * 60 * 1000; // 4 minutes
//     console.log(`Starting Telegram keep-alive. Will run every ${TELEGRAM_KEEPALIVE_MS / 1000 / 60} minutes.`);
//     // Run the health check periodically. The interval should be less than your archival interval.
//     setInterval(checkTelegramConnection, TELEGRAM_KEEPALIVE_MS);
//     setTimeout(checkTelegramConnection, 5000); // Run once after 5s to establish initial connection
// });


// async function runArchivalProcess() {
//     // ... (this function remains exactly the same)
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

// // server/src/server.js
// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./utils/database');
// const http = require('http'); // 1. Import the 'http' module

// const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
// const fileRoutes = require('./routes/file.routes');
// const errorMiddleware = require('./middleware/error.middleware');
// const File = require('./models/File');
// const { transferGroupToTelegram } = require('./controllers/file.controller');

// connectDB();

// const app = express();

// const whitelist = [
//     'http://localhost:3000',
//     process.env.FRONTEND_URL,
// ].filter(Boolean);

// const corsOptions = {
//     origin: function (origin, callback) {
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

// app.use('/api/auth', express.json(), authRoutes);
// app.use('/api/users', express.json(), userRoutes);
// app.use('/api/files', fileRoutes);

// app.use(errorMiddleware);

// const PORT = process.env.PORT || 5000;

// // 2. Create an HTTP server from the Express app
// const server = http.createServer(app);

// // 3. Set a long timeout for the server
// const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;
// server.setTimeout(TWO_HOURS_IN_MS);

// // 4. Use server.listen() instead of app.listen()
// server.listen(PORT, () => {
//     console.log(`Server running on port ${PORT} with a ${TWO_HOURS_IN_MS / 1000 / 60} minute timeout.`);

//     const ARCHIVE_INTERVAL_MS = 5 * 60 * 1000;
//     console.log(`Starting archival janitor. Will run every ${ARCHIVE_INTERVAL_MS / 1000 / 60} minutes.`);
    
//     setInterval(runArchivalProcess, ARCHIVE_INTERVAL_MS);
//     setTimeout(runArchivalProcess, 10000);
// });


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

// const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./utils/database');
// const http = require('http'); // 1. Import the 'http' module

// const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
// const fileRoutes = require('./routes/file.routes');
// const errorMiddleware = require('./middleware/error.middleware');
// const File = require('./models/File');
// const { transferGroupToTelegram } = require('./controllers/file.controller');
// const { initializeTelegramClient } = require('./services/telegram.service'); // Import the initializer

// connectDB();

// const app = express();

// const whitelist = [
//     'http://localhost:3000',
//     process.env.FRONTEND_URL,
// ].filter(Boolean);

// const corsOptions = {
//     origin: function (origin, callback) {
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

// app.use('/api/auth', express.json(), authRoutes);
// app.use('/api/users', express.json(), userRoutes);
// app.use('/api/files', fileRoutes);

// app.use(errorMiddleware);

// const PORT = process.env.PORT || 5000;

// // 2. Create an HTTP server from the Express app
// const server = http.createServer(app);

// // 3. Set a long timeout for the server
// const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;
// server.setTimeout(TWO_HOURS_IN_MS);

// // 4. Use server.listen() and make the callback async to handle the client initialization
// server.listen(PORT, async () => {
//     console.log(`Server running on port ${PORT} with a ${TWO_HOURS_IN_MS / 1000 / 60} minute timeout.`);

//     // "Warm up" the singleton Telegram connection on startup
//     try {
//         await initializeTelegramClient();
//     } catch (error) {
//         console.error("Could not initialize Telegram client on startup. Will retry on first use.", error.message);
//     }

//     const ARCHIVE_INTERVAL_MS = 5 * 60 * 1000;
//     console.log(`Starting archival janitor. Will run every ${ARCHIVE_INTERVAL_MS / 1000 / 60} minutes.`);
    
//     setInterval(runArchivalProcess, ARCHIVE_INTERVAL_MS);
//     setTimeout(runArchivalProcess, 10000); // Also run shortly after startup
// });


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
//             // Do not await here to allow multiple groups to process in parallel if needed
//             // The transfer function itself is async and will run independently.
//             transferGroupToTelegram(group._id);
//         }

//     } catch (error) {
//         console.error('ARCHIVAL JANITOR: Error during group identification:', error);
//     }
//     console.log('ARCHIVAL JANITOR: Job finished.');
// }

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors'); // We still need the import, but won't use it globally
const connectDB = require('./utils/database');
const http = require('http');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const fileRoutes = require('./routes/file.routes');
const errorMiddleware = require('./middleware/error.middleware');
const File = require('./models/File');
const { transferGroupToTelegram } = require('./controllers/file.controller');
const { initializeTelegramClient } = require('./services/telegram.service');

connectDB();

const app = express();

// =========================== THE FIX IS HERE ===========================
// The Nginx server is now responsible for all CORS headers.
// We are commenting out the Node.js 'cors' middleware to prevent duplicate headers.
/*
const whitelist = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error('CORS Error: Request from origin', origin, 'is not allowed.');
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
*/
// ========================= END OF FIX ==========================


app.use('/api/auth', express.json(), authRoutes);
app.use('/api/users', express.json(), userRoutes);
app.use('/api/files', fileRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;
server.setTimeout(TWO_HOURS_IN_MS);

server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT} with a ${TWO_HOURS_IN_MS / 1000 / 60} minute timeout.`);

    try {
        await initializeTelegramClient();
    } catch (error) {
        console.error("Could not initialize Telegram client on startup. Will retry on first use.", error.message);
    }
    
    const ARCHIVE_INTERVAL_MS = 5 * 60 * 1000;
    console.log(`Starting archival janitor. Will run every ${ARCHIVE_INTERVAL_MS / 1000 / 60} minutes.`);
    
    setInterval(runArchivalProcess, ARCHIVE_INTERVAL_MS);
    setTimeout(runArchivalProcess, 10000);
});


async function runArchivalProcess() {
    console.log('ARCHIVAL JANITOR: Running job...');
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    try {
        const archivableGroups = await File.aggregate([
            { $match: { status: 'IN_DRIVE', driveUploadTimestamp: { $ne: null } } },
            {
                $group: {
                    _id: '$groupId',
                    countInDrive: { $sum: 1 },
                    groupTotal: { $first: '$groupTotal' },
                    lastUploadTime: { $max: '$driveUploadTimestamp' }
                }
            },
            {
                $match: {
                    $expr: { $eq: ['$countInDrive', '$groupTotal'] },
                    lastUploadTime: { $lte: fiveMinutesAgo }
                }
            }
        ]);

        if (archivableGroups.length === 0) {
            console.log('ARCHIVAL JANITOR: No complete groups are old enough to archive.');
            return;
        }

        console.log(`ARCHIVAL JANITOR: Found ${archivableGroups.length} group(s) to process.`);
        for (const group of archivableGroups) {
            transferGroupToTelegram(group._id);
        }

    } catch (error) {
        console.error('ARCHIVAL JANITOR: Error during group identification:', error);
    }
    console.log('ARCHIVAL JANITOR: Job finished.');
}
