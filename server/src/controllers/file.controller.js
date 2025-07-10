// const File = require('../models/File');
// const gDriveService = require('../services/googleDrive.service');
// const telegramService = require('../services/telegram.service');
// const { PassThrough } = require('stream');
// const axios = require('axios'); // For the telegram download part

// /**
//  * The new, streaming upload controller.
//  * It pipes the incoming request directly to Google Drive, avoiding memory buffering.
//  */
// exports.uploadFile = async (req, res, next) => {
//     let fileDoc; // Define here to access in catch block
//     try {
//         // We get file metadata from headers instead of multer
//         const fileName = req.headers['x-file-name'];
//         const fileMimeType = req.headers['content-type'] || 'application/octet-stream';
//         const fileSize = parseInt(req.headers['content-length'], 10);

//         // Basic validation
//         if (!fileSize || !fileName) {
//             return res.status(400).json({ message: 'File metadata headers (Content-Length, X-File-Name) are required.' });
//         }

//         // 1. Create a file record in DB immediately
//         fileDoc = await File.create({
//             originalName: decodeURIComponent(fileName), // Decode URL-encoded names
//             size: fileSize,
//             owner: req.user ? req.user._id : null,
//         });

//         // The PassThrough stream acts as a conduit for the data
//         const passThrough = new PassThrough();

//         // Pipe the incoming request data directly into our pass-through stream
//         req.pipe(passThrough);

//         // 2. Start the upload to Google Drive using the stream
//         const gDriveFile = await gDriveService.createFile(
//             decodeURIComponent(fileName),
//             fileMimeType,
//             passThrough // Pass the stream, not a buffer
//         );

//         // 3. Update DB with GDrive ID and status
//         fileDoc.gDriveFileId = gDriveFile.id;
//         fileDoc.status = 'IN_DRIVE';
//         await fileDoc.save();

//         // 4. Respond to user with the shareable link
//         res.status(201).json({
//             message: 'File uploaded successfully!',
//             downloadLink: `${req.protocol}://${req.get('host')}/api/files/download/${fileDoc.uniqueId}`
//         });

//         // 5. Trigger background transfer to Telegram (fire and forget)
//         transferToTelegram(fileDoc._id);

//     } catch (error) {
//         console.error('Upload failed:', error);
//         // If an error occurs during upload, mark the file record as errored
//         if (fileDoc) {
//             await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' });
//         }
//         next(error);
//     }
// };

// /**
//  * Helper for the background transfer from Google Drive to Telegram.
//  */
// async function transferToTelegram(fileId) {
//     const CHUNK_SIZE = 15 * 1024 * 1024; // 15MB
//     try {
//         const fileDoc = await File.findById(fileId);
//         if (!fileDoc || fileDoc.status !== 'IN_DRIVE') return;

//         fileDoc.status = 'ARCHIVING';
//         await fileDoc.save();

//         const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);

//         const fileBuffer = await streamToBuffer(gDriveStream);

//         const messageIds = [];
//         let chunkIndex = 0;

//         for (let i = 0; i < fileBuffer.length; i += CHUNK_SIZE) {
//             const chunk = fileBuffer.slice(i, i + CHUNK_SIZE);
//             const chunkFileName = `${fileDoc.originalName}.part${chunkIndex++}`;
//             const messageId = await telegramService.uploadChunk(chunk, chunkFileName);
//             messageIds.push(messageId);
//         }

//         fileDoc.telegramMessageIds = messageIds;
//         fileDoc.status = 'IN_TELEGRAM';
//         await fileDoc.save();

//         // Delete from Google Drive after successful transfer
//         await gDriveService.deleteFile(fileDoc.gDriveFileId);
//         console.log(`File ${fileDoc.originalName} transferred to Telegram and deleted from Drive.`);

//     } catch (error) {
//         console.error(`Failed to transfer file ${fileId} to Telegram:`, error);
//         await File.findByIdAndUpdate(fileId, { status: 'ERROR' });
//     }
// }

// function streamToBuffer(stream) {
//     return new Promise((resolve, reject) => {
//         const chunks = [];
//         stream.on('data', (chunk) => chunks.push(chunk));
//         stream.on('error', reject);
//         stream.on('end', () => resolve(Buffer.concat(chunks)));
//     });
// }

// /**
//  * Handles file downloads by streaming from either GDrive or Telegram.
//  */
// exports.downloadFile = async (req, res, next) => {
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId });
//         if (!file) return res.status(404).json({ message: 'File not found' });

//         res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
//         res.setHeader('Content-Length', file.size);
//         res.setHeader('Content-Type', 'application/octet-stream');


//         if (file.status === 'IN_TELEGRAM') {
//             for (const messageId of file.telegramMessageIds) {
//                 const chunkStream = await telegramService.getFileStream(messageId);
//                 // Pipe each chunk to the response, waiting for it to finish before starting the next.
//                 await new Promise((resolve, reject) => {
//                     chunkStream.pipe(res, { end: false }); // `end: false` is crucial here
//                     chunkStream.on('end', resolve);
//       chunkStream.on('error', reject);
//                 });
//             }
//             res.end(); // Manually end the response after all chunks are sent
//         } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
//             const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
//             gDriveStream.pipe(res);
//         } else {
//             res.status(500).json({ message: 'File is not available for download.' });
//         }
//     } catch (error) {
//         next(error);
//     }
// };

// /**
//  * Fetches the file history for the authenticated user.
//  */
// exports.getMyFiles = async (req, res, next) => {
//     try {
//         const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 });
//         res.json(files);
//     } catch (error) {
//         next(error);
//     }
// };


// const File = require('../models/File');
// const gDriveService = require('../services/googleDrive.service');
// const telegramService = require('../services/telegram.service');
// const { PassThrough } = require('stream');
// const axios = require('axios');

// /**
//  * The streaming upload controller.
//  */
// exports.uploadFile = async (req, res, next) => {
//     let fileDoc; 
//     try {
//         const fileName = req.headers['x-file-name'];
//         const fileMimeType = req.headers['content-type'] || 'application/octet-stream';
//         const fileSize = parseInt(req.headers['content-length'], 10);

//         if (!fileSize || !fileName) {
//             return res.status(400).json({ message: 'File metadata headers (Content-Length, X-File-Name) are required.' });
//         }

//         fileDoc = await File.create({
//             originalName: decodeURIComponent(fileName),
//             size: fileSize,
//             owner: req.user ? req.user._id : null,
//         });

//         const passThrough = new PassThrough();
//         req.pipe(passThrough);

//         const gDriveFile = await gDriveService.createFile(
//             decodeURIComponent(fileName),
//             fileMimeType,
//             passThrough
//         );

//         fileDoc.gDriveFileId = gDriveFile.id;
//         fileDoc.status = 'IN_DRIVE';
//         await fileDoc.save();

//         // ==========================================================
//         //  THE ONLY CHANGE IS HERE
//         //  We now send a relative path instead of a full backend URL.
//         // ==========================================================
//         res.status(201).json({
//             message: 'File uploaded successfully!',
//             downloadLink: `/download/${fileDoc.uniqueId}` 
//         });

//         transferToTelegram(fileDoc._id);

//     } catch (error) {
//         console.error('Upload failed:', error);
//         if (fileDoc) {
//             await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' });
//         }
//         next(error);
//     }
// };

// /**
//  * Helper for the background transfer from Google Drive to Telegram.
//  */
// async function transferToTelegram(fileId) {
//     const CHUNK_SIZE = 15 * 1024 * 1024; // 15MB
//     try {
//         const fileDoc = await File.findById(fileId);
//         if (!fileDoc || fileDoc.status !== 'IN_DRIVE') return;

//         fileDoc.status = 'ARCHIVING';
//         await fileDoc.save();

//         const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
//         const fileBuffer = await streamToBuffer(gDriveStream);

//         const messageIds = [];
//         let chunkIndex = 0;

//         for (let i = 0; i < fileBuffer.length; i += CHUNK_SIZE) {
//             const chunk = fileBuffer.slice(i, i + CHUNK_SIZE);
//             const chunkFileName = `${fileDoc.originalName}.part${chunkIndex++}`;
//             const messageId = await telegramService.uploadChunk(chunk, chunkFileName);
//             messageIds.push(messageId);
//         }

//         fileDoc.telegramMessageIds = messageIds;
//         fileDoc.status = 'IN_TELEGRAM';
//         await fileDoc.save();

//         await gDriveService.deleteFile(fileDoc.gDriveFileId);
//         console.log(`File ${fileDoc.originalName} transferred to Telegram and deleted from Drive.`);

//     } catch (error) {
//         console.error(`Failed to transfer file ${fileId} to Telegram:`, error);
//         await File.findByIdAndUpdate(fileId, { status: 'ERROR' });
//     }
// }

// function streamToBuffer(stream) {
//     return new Promise((resolve, reject) => {
//         const chunks = [];
//         stream.on('data', (chunk) => chunks.push(chunk));
//         stream.on('error', reject);
//         stream.on('end', () => resolve(Buffer.concat(chunks)));
//     });
// }

// /**
//  * Handles file downloads by streaming from either GDrive or Telegram.
//  */
// exports.downloadFile = async (req, res, next) => {
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId });
//         if (!file) return res.status(404).json({ message: 'File not found' });

//         res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
//         res.setHeader('Content-Length', file.size);
//         res.setHeader('Content-Type', 'application/octet-stream');

//         if (file.status === 'IN_TELEGRAM') {
//             for (const messageId of file.telegramMessageIds) {
//                 const chunkStream = await telegramService.getFileStream(messageId);
//                 await new Promise((resolve, reject) => {
//                     chunkStream.pipe(res, { end: false });
//                     chunkStream.on('end', resolve);
//                     chunkStream.on('error', reject);
//                 });
//             }
//             res.end();
//         } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
//             const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
//             gDriveStream.pipe(res);
//         } else {
//             res.status(500).json({ message: 'File is not available for download.' });
//         }
//     } catch (error) {
//         next(error);
//     }
// };

// /**
//  * Fetches the file history for the authenticated user.
//  */
// exports.getMyFiles = async (req, res, next) => {
//     try {
//         const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 });
//         res.json(files);
//     } catch (error) {
//         next(error);
//     }
// };

// // server/src/controllers/file.controller.js
// const File = require('../models/File');
// const gDriveService = require('../services/googleDrive.service');
// const telegramService = require('../services/telegram.service');
// const { PassThrough } = require('stream');

// /**
//  * Handles the initial file upload from the user.
//  * This function uses a streaming approach to pass data directly to Google Drive,
//  * avoiding buffering large files in server memory.
//  */
// exports.uploadFile = async (req, res, next) => {
//     let fileDoc; // Define here to access in the catch block
//     try {
//         const fileName = req.headers['x-file-name'];
//         const fileMimeType = req.headers['content-type'] || 'application/octet-stream';
//         const fileSize = parseInt(req.headers['content-length'], 10);

//         if (!fileSize || !fileName) {
//             return res.status(400).json({ message: 'File metadata headers (Content-Length, X-File-Name) are required.' });
//         }

//         // 1. Create a database record for the file.
//         fileDoc = await File.create({
//             originalName: decodeURIComponent(fileName),
//             size: fileSize,
//             owner: req.user ? req.user._id : null,
//         });

//         // 2. Pipe the incoming request stream directly to the Google Drive service.
//         const passThrough = new PassThrough();
//         req.pipe(passThrough);

//         const gDriveFile = await gDriveService.createFile(
//             decodeURIComponent(fileName),
//             fileMimeType,
//             passThrough
//         );

//         // 3. Update the database record with the Google Drive file ID.
//         fileDoc.gDriveFileId = gDriveFile.id;
//         fileDoc.status = 'IN_DRIVE';
//         await fileDoc.save();

//         // 4. Respond to the user with a shareable frontend link.
//         res.status(201).json({
//             message: 'File uploaded successfully!',
//             downloadLink: `/download/${fileDoc.uniqueId}`
//         });

//         // 5. Trigger the background transfer process (fire and forget).
//         transferToTelegram(fileDoc._id);

//     } catch (error) {
//         console.error('Upload failed:', error);
//         if (fileDoc) {
//             await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' });
//         }
//         next(error);
//     }
// };

// /**
//  * Transfers a file from Google Drive to Telegram using an efficient streaming pipeline.
//  * - Low Memory Usage: Chunks the file on-the-fly without loading it all into memory.
//  * - Faster Start: Begins uploading the first chunk as soon as it's downloaded.
//  * - Parallel Uploads: Uploads multiple chunks to Telegram concurrently for speed.
//  */
// async function transferToTelegram(fileId) {
//     const CHUNK_SIZE = 15 * 1024 * 1024; // 15MB
//     let fileDoc;

//     try {
//         fileDoc = await File.findById(fileId);
//         if (!fileDoc || fileDoc.status !== 'IN_DRIVE') {
//             console.log(`Transfer skipped: File ${fileId} not in a valid state.`);
//             return;
//         }

//         fileDoc.status = 'ARCHIVING';
//         await fileDoc.save();

//         const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);

//         let chunkBuffer = Buffer.alloc(0);
//         const uploadPromises = [];
//         let chunkIndex = 0;

//         // Process the stream from Google Drive as data arrives.
//         for await (const data of gDriveStream) {
//             chunkBuffer = Buffer.concat([chunkBuffer, data]);

//             // When we have enough data for a full 15MB chunk, slice and upload it.
//             while (chunkBuffer.length >= CHUNK_SIZE) {
//                 const chunkToUpload = chunkBuffer.slice(0, CHUNK_SIZE);
//                 chunkBuffer = chunkBuffer.slice(CHUNK_SIZE); // Keep the remainder.

//                 const chunkFileName = `${fileDoc.originalName}.part${chunkIndex++}`;
//                 // Add the upload promise to an array to run in parallel.
//                 uploadPromises.push(telegramService.uploadChunk(chunkToUpload, chunkFileName));
//             }
//         }

//         // Upload the final, remaining part of the file.
//         if (chunkBuffer.length > 0) {
//             const chunkFileName = `${fileDoc.originalName}.part${chunkIndex++}`;
//             uploadPromises.push(telegramService.uploadChunk(chunkBuffer, chunkFileName));
//         }

//         // Wait for all the parallel uploads to complete successfully.
//         const messageIds = await Promise.all(uploadPromises);

//         // Update the document with all the Telegram message IDs.
//         fileDoc.telegramMessageIds = messageIds;
//         fileDoc.status = 'IN_TELEGRAM';
//         await fileDoc.save();

//         // Finally, clean up by deleting the file from Google Drive.
//         await gDriveService.deleteFile(fileDoc.gDriveFileId);
//         console.log(`File ${fileDoc.originalName} transferred to Telegram and deleted from Drive.`);

//     } catch (error) {
//         console.error(`Failed to transfer file ${fileId} to Telegram:`, error);
//         if (fileDoc) {
//             await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' });
//         }
//     }
// }


// /**
//  * Handles file downloads for the end-user.
//  * It streams from Telegram (merging chunks) or Google Drive depending on file status.
//  */
// exports.downloadFile = async (req, res, next) => {
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId });
//         if (!file) {
//             return res.status(404).json({ message: 'File not found.' });
//         }

//         res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
//         res.setHeader('Content-Length', file.size);
//         res.setHeader('Content-Type', 'application/octet-stream');

//         if (file.status === 'IN_TELEGRAM') {
//             for (const messageId of file.telegramMessageIds) {
//                 const chunkStream = await telegramService.getFileStream(messageId);
//                 // Pipe each chunk to the response, waiting for it to finish before starting the next.
//                 await new Promise((resolve, reject) => {
//                     chunkStream.pipe(res, { end: false }); // `end: false` is crucial
//                     chunkStream.on('end', resolve);
//                     chunkStream.on('error', reject);
//                 });
//             }
//             res.end(); // Manually end the response after all chunks are sent.
//         } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
//             const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
//             gDriveStream.pipe(res);
//         } else {
//             res.status(500).json({ message: 'File is not available for download or is in an error state.' });
//         }
//     } catch (error) {
//         console.error(`Download failed for file ${req.params.uniqueId}:`, error);
//         next(error);
//     }
// };


// exports.getMyFiles = async (req, res, next) => {
//     try {
//         // Find all files where the owner matches the authenticated user's ID
//         // Sort by creation date to show the newest files first.
//         const files = await File.find({ owner: req.user._id })
//                                 .sort({ createdAt: -1 })
//                                 .select('originalName size uniqueId createdAt'); // Select only needed fields

//         res.json(files);
//     } catch (error) {
//         console.error('Failed to get user files:', error);
//         next(error);
//     }
// };

// /**
//  * Fetches and returns only the metadata for a specific file.
//  * This is used to display file info on the download page without downloading the content.
//  */
// exports.getFileMetadata = async (req, res, next) => {
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId })
//                                 .select('originalName size'); // Only get the fields we need

//         if (!file) {
//             return res.status(404).json({ message: 'File not found.' });
//         }

//         res.json(file);
//     } catch (error) {
//         next(error);
//     }
// };


// // server/src/controllers/file.controller.js

// const File = require('../models/File');
// const gDriveService = require('../services/googleDrive.service');
// const telegramService = require('../services/telegram.service');
// const { PassThrough } = require('stream');
// const archiver = require('archiver');
// const fs = require('fs');
// const os = require('os');
// const path = require('path');

// // --- UPLOAD AND BACKGROUND ARCHIVAL LOGIC (Correct and Unchanged) ---
// // This part remains the same as our previous correct version.
// exports.uploadFile = async (req, res, next) => {
//     let fileDoc;
//     try {
//         const fileName = decodeURIComponent(req.headers['x-file-name']);
//         const fileSize = parseInt(req.headers['content-length'], 10);
//         const groupId = req.headers['x-group-id'];
//         const groupTotal = parseInt(req.headers['x-group-total'], 10);

//         if (!fileName || !fileSize || !groupId || !groupTotal) {
//             return res.status(400).json({ message: 'Missing required file metadata headers.' });
//         }

//         fileDoc = new File({
//             originalName: fileName, size: fileSize, owner: req.user ? req.user._id : null, groupId: groupId, groupTotal: groupTotal,
//         });

//         const passThrough = new PassThrough();
//         req.pipe(passThrough);
//         const gDriveFile = await gDriveService.createFile(fileName, req.headers['content-type'], passThrough);

//         fileDoc.gDriveFileId = gDriveFile.id;
//         fileDoc.status = 'IN_DRIVE';
//         fileDoc.driveUploadTimestamp = new Date();
//         await fileDoc.save();

//         res.status(201).json({ message: 'File uploaded to Drive successfully.' });
//     } catch (error) {
//         console.error(`Upload failed for ${fileDoc?.originalName || 'unknown file'}:`, error);
//         if (fileDoc && fileDoc._id) { await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' }); }
//         next(error);
//     }
// };

// // --- DOWNLOAD LOGIC ---

// // This function for single file downloads is correct.
// exports.downloadFile = async (req, res, next) => {
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId });
//         if (!file) { return res.status(404).json({ message: 'File not found.' }); }
//         res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
//         res.setHeader('Content-Length', file.size);
//         res.setHeader('Content-Type', 'application/octet-stream');
//         if (file.status === 'IN_TELEGRAM') {
//             const mergedStream = await getMergedTelegramStream(file.telegramMessageIds);
//             mergedStream.pipe(res);
//         } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
//             const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
//             gDriveStream.pipe(res);
//         } else {
//             res.status(500).json({ message: 'File is not available for download.' });
//         }
//     } catch (error) { next(error); }
// };

// // --- NEW, BULLETPROOF ZIP DOWNLOAD LOGIC ---
// exports.downloadGroupAsZip = async (req, res, next) => {
//     const { groupId } = req.params;
//     // Create a unique temporary directory for this download request
//     const tempDir = path.join(os.tmpdir(), `zip-${groupId}-${Date.now()}`);

//     try {
//         await fs.promises.mkdir(tempDir, { recursive: true });

//         const files = await File.find({ groupId }).sort({ createdAt: 1 });
//         if (!files || files.length === 0) {
//             return res.status(404).json({ message: 'No files found.' });
//         }

//         console.log(`[ZIP ${groupId}] Starting download of ${files.length} files to temporary storage.`);

//         // 1. DOWNLOAD ALL FILES TO THE SERVER'S TEMPORARY FOLDER
//         for (const file of files) {
//             const localFilePath = path.join(tempDir, file.originalName);
//             const writer = fs.createWriteStream(localFilePath);
//             let sourceStream;

//             if (file.status === 'IN_TELEGRAM' && file.telegramMessageIds.length > 0) {
//                 sourceStream = await getMergedTelegramStream(file.telegramMessageIds);
//             } else if ((file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') && file.gDriveFileId) {
//                 sourceStream = await gDriveService.getFileStream(file.gDriveFileId);
//             } else {
//                 console.warn(`[ZIP ${groupId}] Skipping file ${file.originalName} due to invalid status.`);
//                 continue; // Skip this file
//             }

//             sourceStream.pipe(writer);
//             // Wait for the file to be completely written to disk
//             await new Promise((resolve, reject) => {
//                 writer.on('finish', resolve);
//                 writer.on('error', reject);
//                 sourceStream.on('error', reject); // Propagate stream errors
//             });
//         }

//         console.log(`[ZIP ${groupId}] All files downloaded. Starting ZIP creation.`);

//         // 2. CREATE THE ZIP FROM THE LOCALLY STORED FILES
//         const zipFileName = `${files[0].originalName.split('.')[0] || 'batch'}.zip`;
//         const zipFilePath = path.join(tempDir, zipFileName);
//         const output = fs.createWriteStream(zipFilePath);
//         const archive = archiver('zip', { zlib: { level: 9 } }); // Use higher compression

//         archive.pipe(output);
//         // Add all files from the temporary directory into the zip
//         archive.directory(tempDir, false);
//         await archive.finalize();

//         // This promise resolves when the ZIP file is fully written to disk
//         await new Promise((resolve, reject) => {
//           output.on('close', resolve);
//           archive.on('error', reject);
//         });

//         console.log(`[ZIP ${groupId}] ZIP file created successfully.`);

//         // 3. STREAM THE COMPLETED ZIP FILE TO THE USER
//         const zipStats = await fs.promises.stat(zipFilePath);
//         res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
//         res.setHeader('Content-Type', 'application/zip');
//         res.setHeader('Content-Length', zipStats.size);

//         const zipStream = fs.createReadStream(zipFilePath);
//         zipStream.pipe(res);

//     } catch (error) {
//         console.error(`[ZIP ${groupId}] Failed to create zip:`, error);
//         next(error);
//     } finally {
//         // 4. CLEANUP: Delete the temporary directory and its contents
//         fs.promises.rm(tempDir, { recursive: true, force: true }).catch(err => {
//             console.error(`[ZIP ${groupId}] Failed to clean up temporary directory ${tempDir}:`, err);
//         });
//     }
// };


// // --- HELPER AND METADATA FUNCTIONS (Unchanged) ---
// async function getMergedTelegramStream(telegramMessageIds) {
//     const passThrough = new PassThrough();
//     (async () => {
//         for (const messageId of telegramMessageIds) {
//             try {
//                 const chunkStream = await telegramService.getFileStream(messageId);
//                 await new Promise((resolve, reject) => {
//                     chunkStream.pipe(passThrough, { end: false });
//                     chunkStream.on('end', resolve);
//                     chunkStream.on('error', reject);
//                 });
//             } catch (err) { passThrough.emit('error', err); break; }
//         }
//         passThrough.end();
//     })().catch(err => passThrough.emit('error', err));
//     return passThrough;
// }

// exports.getGroupMetadata = async (req, res, next) => {
//   try {
//     const files = await File.find({ groupId: req.params.groupId }).select('originalName size uniqueId');
//     if (!files || files.length === 0) { return res.status(404).json({ message: 'File group not found.' }); }
//     res.json(files);
//   } catch (error) { next(error); }
// };

// exports.getMyFiles = async (req, res, next) => {
//   try {
//     const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 }).select('originalName size uniqueId createdAt groupId');
//     res.json(files);
//   } catch (error) { next(error); }
// };


// // server/src/controllers/file.controller.js

// const File = require('../models/File');
// const gDriveService = require('../services/googleDrive.service');
// const telegramService = require('../services/telegram.service');
// const { PassThrough } = require('stream');
// const archiver = require('archiver');
// const fs = require('fs');
// const os = require('os');
// const path = require('path');

// // --- UPLOAD & IMMEDIATE TRIGGER LOGIC ---
// exports.uploadFile = async (req, res, next) => {
//     let fileDoc;
//     try {
//         const fileName = decodeURIComponent(req.headers['x-file-name']);
//         const fileSize = parseInt(req.headers['content-length'], 10);
//         const groupId = req.headers['x-group-id'];
//         const groupTotal = parseInt(req.headers['x-group-total'], 10);

//         if (!fileName || !fileSize || !groupId || !groupTotal) {
//             return res.status(400).json({ message: 'Missing required file metadata headers.' });
//         }
//         fileDoc = new File({
//             originalName: fileName, size: fileSize, owner: req.user ? req.user._id : null, groupId, groupTotal,
//         });
//         const passThrough = new PassThrough();
//         req.pipe(passThrough);
//         const gDriveFile = await gDriveService.createFile(fileName, req.headers['content-type'], passThrough);
//         fileDoc.gDriveFileId = gDriveFile.id;
//         fileDoc.status = 'IN_DRIVE';
//         await fileDoc.save();
//         const countInDrive = await File.countDocuments({ groupId, status: 'IN_DRIVE' });
//         if (countInDrive === groupTotal) {
//             console.log(`[GROUP ${groupId}] All ${groupTotal} files are in Drive. Starting immediate transfer to Telegram.`);
//             transferGroupToTelegram(groupId);
//         }
//         res.status(201).json({ message: 'File uploaded to Drive successfully.' });
//     } catch (error) {
//         console.error(`Upload failed for ${fileDoc?.originalName || 'unknown file'}:`, error);
//         if (fileDoc && fileDoc._id) { await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' }); }
//         next(error);
//     }
// };

// // --- BULLETPROOF BACKGROUND TRANSFER LOGIC ---
// async function transferGroupToTelegram(groupId) {
//     const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });
//     let allTransfersSucceeded = true;

//     console.log(`[GROUP ${groupId}] Starting transfer phase for ${filesInGroup.length} files.`);

//     // PHASE 1: TRANSFER ALL FILES. Stop if any single file fails.
//     for (const fileDoc of filesInGroup) {
//         try {
//             await fileDoc.updateOne({ status: 'ARCHIVING' });

//             const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
//             const CHUNK_SIZE = 15 * 1024 * 1024;
//             let chunkBuffer = Buffer.alloc(0);
//             const uploadPromises = [];
//             let chunkIndex = 0;

//             for await (const data of gDriveStream) {
//                 chunkBuffer = Buffer.concat([chunkBuffer, data]);
//                 while (chunkBuffer.length >= CHUNK_SIZE) {
//                     const chunkToUpload = chunkBuffer.slice(0, CHUNK_SIZE);
//                     chunkBuffer = chunkBuffer.slice(CHUNK_SIZE);
//                     uploadPromises.push(telegramService.uploadChunk(chunkToUpload, `${fileDoc.originalName}.part${chunkIndex++}`));
//                 }
//             }
//             if (chunkBuffer.length > 0) {
//                 uploadPromises.push(telegramService.uploadChunk(chunkBuffer, `${fileDoc.originalName}.part${chunkIndex++}`));
//             }

//             const messageIds = await Promise.all(uploadPromises);

//             await fileDoc.updateOne({ telegramMessageIds: messageIds, status: 'IN_TELEGRAM' });
//             console.log(`[GROUP ${groupId}] SUCCESS: Transferred ${fileDoc.originalName} to Telegram.`);

//         } catch (error) {
//             console.error(`[GROUP ${groupId}] FATAL ERROR: Failed to transfer ${fileDoc.originalName}. Aborting group transfer.`, error);
//             await fileDoc.updateOne({ status: 'ERROR' });
//             allTransfersSucceeded = false;
//             break;
//         }
//     }

//     // PHASE 2: ATOMIC CLEANUP. Only run if ALL files succeeded.
//     if (allTransfersSucceeded) {
//         console.log(`[GROUP ${groupId}] All transfers successful. Starting cleanup of ${filesInGroup.length} files from Google Drive.`);
//         // NOTE: We refetch the files to ensure we have the correct gDriveFileId for all of them.
//         const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
//         for (const transferredFile of successfullyTransferredFiles) {
//             if (transferredFile.gDriveFileId) {
//                 try {
//                     await gDriveService.deleteFile(transferredFile.gDriveFileId);
//                     console.log(`[GROUP ${groupId}] Deleted ${transferredFile.originalName} from Drive.`);
//                 } catch (error) {
//                     console.error(`[GROUP ${groupId}] FAILED to delete ${transferredFile.gDriveFileId} from Drive during cleanup:`, error);
//                 }
//             }
//         }
//     } else {
//         console.log(`[GROUP ${groupId}] Transfer failed for at least one file. No files will be deleted from Google Drive.`);
//     }

//     console.log(`[GROUP ${groupId}] Finished processing.`);
// }


// // --- DOWNLOAD AND METADATA LOGIC ---
// exports.downloadFile = async (req, res, next) => {
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId });
//         if (!file) { return res.status(404).json({ message: 'File not found.' }); }
//         res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
//         res.setHeader('Content-Length', file.size);
//         res.setHeader('Content-Type', 'application/octet-stream');
//         if (file.status === 'IN_TELEGRAM') {
//             const mergedStream = await getMergedTelegramStream(file.telegramMessageIds);
//             mergedStream.pipe(res);
//         } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
//             const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
//             gDriveStream.pipe(res);
//         } else {
//             res.status(500).json({ message: 'File is not available for download.' });
//         }
//     } catch (error) { next(error); }
// };
// exports.downloadGroupAsZip = async (req, res, next) => {
//     const { groupId } = req.params;
//     const tempDir = path.join(os.tmpdir(), `zip-${groupId}-${Date.now()}`);
//     try {
//         await fs.promises.mkdir(tempDir, { recursive: true });
//         const files = await File.find({ groupId }).sort({ createdAt: 1 });
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'No files found.' }); }
//         for (const file of files) {
//             const localFilePath = path.join(tempDir, file.originalName);
//             const writer = fs.createWriteStream(localFilePath);
//             let sourceStream;
//             if (file.status === 'IN_TELEGRAM' && file.telegramMessageIds.length > 0) {
//                 sourceStream = await getMergedTelegramStream(file.telegramMessageIds);
//             } else if ((file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') && file.gDriveFileId) {
//                 sourceStream = await gDriveService.getFileStream(file.gDriveFileId);
//             } else { continue; }
//             sourceStream.pipe(writer);
//             await new Promise((resolve, reject) => {
//                 writer.on('finish', resolve); writer.on('error', reject); sourceStream.on('error', reject);
//             });
//         }
//         const zipFileName = `${files[0].originalName.split('.')[0] || 'batch'}.zip`;
//         const zipFilePath = path.join(tempDir, zipFileName);
//         const output = fs.createWriteStream(zipFilePath);
//         const archive = archiver('zip', { zlib: { level: 9 } });
//         archive.pipe(output);
//         archive.directory(tempDir, false);
//         await archive.finalize();
//         await new Promise((resolve, reject) => {
//             output.on('close', resolve); archive.on('error', reject);
//         });
//         const zipStats = await fs.promises.stat(zipFilePath);
//         res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
//         res.setHeader('Content-Type', 'application/zip');
//         res.setHeader('Content-Length', zipStats.size);
//         const zipStream = fs.createReadStream(zipFilePath);
//         zipStream.pipe(res);
//     } catch (error) {
//         next(error);
//     } finally { fs.promises.rm(tempDir, { recursive: true, force: true }); }
// };
// async function getMergedTelegramStream(telegramMessageIds) {
//     const passThrough = new PassThrough();
//     (async () => {
//         for (const messageId of telegramMessageIds) {
//             try {
//                 const chunkStream = await telegramService.getFileStream(messageId);
//                 await new Promise((resolve, reject) => {
//                     chunkStream.pipe(passThrough, { end: false });
//                     chunkStream.on('end', resolve);
//                     chunkStream.on('error', reject);
//                 });
//             } catch (err) { passThrough.emit('error', err); break; }
//         }
//         passThrough.end();
//     })().catch(err => passThrough.emit('error', err));
//     return passThrough;
// }
// exports.getGroupMetadata = async (req, res, next) => {
//     try {
//         const files = await File.find({ groupId: req.params.groupId }).select('originalName size uniqueId');
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'File group not found.' }); }
//         res.json(files);
//     } catch (error) { next(error); }
// };
// exports.getMyFiles = async (req, res, next) => {
//     try {
//         const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 }).select('originalName size uniqueId createdAt groupId');
//         res.json(files);
//     } catch (error) { next(error); }
// };






// // server/src/controllers/file.controller.js
// const File = require('../models/File');
// const gDriveService = require('../services/googleDrive.service');
// const telegramService = require('../services/telegram.service');
// const { PassThrough } = require('stream');
// const archiver = require('archiver');
// const fs = require('fs');
// const os = require('os');
// const path = require('path');
// const { v4: uuidv4 } = require('uuid');

// /**
//  * Processes the file upload in the background from a temporary file path.
//  * It handles saving the file to Google Drive and then triggering the archival to Telegram.
//  * @param {string} tempFilePath - The path to the temporary file on disk.
//  * @param {object} headers - The headers from the original request containing metadata.
//  * @param {object} user - The authenticated user object, if any.
//  */
// async function processFileUploadInBackground(tempFilePath, headers, user) {
//     let fileDoc;
//     const fileName = decodeURIComponent(headers['x-file-name']);
//     const groupId = headers['x-group-id'];
//     const groupTotal = parseInt(headers['x-group-total'], 10);
//     const fileSize = parseInt(headers['content-length'], 10);
//     const contentType = headers['content-type'];

//     try {
//         // Create an initial DB record to track the upload.
//         fileDoc = new File({
//             originalName: fileName,
//             size: fileSize,
//             owner: user ? user._id : null,
//             groupId,
//             groupTotal,
//             status: 'UPLOADING_TO_DRIVE',
//         });
//         await fileDoc.save();

//         // Create a read stream from the stable temporary file.
//         const fileStream = fs.createReadStream(tempFilePath);

//         const gDriveFile = await gDriveService.createFile(fileName, contentType, fileStream);

//         // The gDriveService.transferOwnership call has been removed as it is unnecessary
//         // and was causing the "Consent is required" error. As long as your personal
//         // account owns the folder, the file's storage will count against your quota.

//         // Update the file's status in the database to 'IN_DRIVE'.
//         await File.findByIdAndUpdate(fileDoc._id, {
//             gDriveFileId: gDriveFile.id,
//             status: 'IN_DRIVE',
//             driveUploadTimestamp: new Date(),
//         });
        
//         console.log(`[GROUP ${groupId}] Successfully processed ${fileName} to Drive.`);

//         const countInDrive = await File.countDocuments({ groupId, status: 'IN_DRIVE' });
//         if (countInDrive === groupTotal) {
//             console.log(`[GROUP ${groupId}] All ${groupTotal} files are in Drive. Triggering Telegram archival.`);
//             transferGroupToTelegram(groupId); 
//         }

//     } catch (error) {
//         console.error(`BACKGROUND UPLOAD FAILED for ${fileName}:`, error);
//         if (fileDoc && fileDoc._id) {
//             await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' }).catch(err => {
//                 console.error(`Failed to update status to ERROR for doc ${fileDoc._id}:`, err);
//             });
//         }
//     } finally {
//         // CRUCIAL: Clean up the temporary file to prevent disk space issues.
//         fs.promises.unlink(tempFilePath).catch(err => {
//             console.error(`Failed to delete temporary file ${tempFilePath}:`, err);
//         });
//     }
// }

// // --- UPLOAD & IMMEDIATE RESPONSE ENDPOINT ---
// exports.uploadFile = (req, res, next) => {
//     const { 'x-file-name': fileName, 'content-length': fileSize, 'x-group-id': groupId, 'x-group-total': groupTotal } = req.headers;

//     if (!fileName || !fileSize || !groupId || !groupTotal) {
//         return res.status(400).json({ message: 'Missing required file metadata headers.' });
//     }

//     // Create a unique path for the temporary file.
//     const tempFilePath = path.join(os.tmpdir(), `upload_${uuidv4()}`);
//     const writeStream = fs.createWriteStream(tempFilePath);

//     // Pipe the incoming request (file data) to the temporary file.
//     req.pipe(writeStream);

//     writeStream.on('finish', () => {
//         // Once the file is fully saved, respond to the client.
//         res.status(202).json({ message: 'Upload accepted and is being processed.' });

//         // Start the background processing.
//         processFileUploadInBackground(tempFilePath, req.headers, req.user).catch(err => {
//             console.error("CRITICAL ERROR: Failed to start background upload process for temp file.", err);
//         });
//     });

//     writeStream.on('error', (err) => {
//         console.error("Failed to write upload stream to temp file:", err);
//         // If there was an error writing the file, clean up and send an error response.
//         fs.promises.unlink(tempFilePath).catch(unlinkErr => console.error("Could not clean up temp file after stream error:", unlinkErr));
//         if (!res.headersSent) {
//             res.status(500).json({ message: "Failed to process file upload." });
//         }
//     });
// };

// // --- BULLETPROOF BACKGROUND TRANSFER LOGIC ---
// // This function is called by the background upload process once a group is ready.
// async function transferGroupToTelegram(groupId) {
//     const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });
//     let allTransfersSucceeded = true;

//     console.log(`[GROUP ${groupId}] Starting transfer phase for ${filesInGroup.length} files.`);

//     for (const fileDoc of filesInGroup) {
//         try {
//             await fileDoc.updateOne({ status: 'ARCHIVING' });
//             const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
//             const CHUNK_SIZE = 15 * 1024 * 1024;
//             let chunkBuffer = Buffer.alloc(0);
//             const uploadPromises = [];
//             let chunkIndex = 0;

//             for await (const data of gDriveStream) {
//                 chunkBuffer = Buffer.concat([chunkBuffer, data]);
//                 while (chunkBuffer.length >= CHUNK_SIZE) {
//                     const chunkToUpload = chunkBuffer.slice(0, CHUNK_SIZE);
//                     chunkBuffer = chunkBuffer.slice(CHUNK_SIZE);
//                     uploadPromises.push(telegramService.uploadChunk(chunkToUpload, `${fileDoc.originalName}.part${chunkIndex++}`));
//                 }
//             }
//             if (chunkBuffer.length > 0) {
//                 uploadPromises.push(telegramService.uploadChunk(chunkBuffer, `${fileDoc.originalName}.part${chunkIndex++}`));
//             }

//             const messageIds = await Promise.all(uploadPromises);
//             await fileDoc.updateOne({ telegramMessageIds: messageIds, status: 'IN_TELEGRAM' });
//             console.log(`[GROUP ${groupId}] SUCCESS: Transferred ${fileDoc.originalName} to Telegram.`);
//         } catch (error) {
//             console.error(`[GROUP ${groupId}] FATAL ERROR: Failed to transfer ${fileDoc.originalName}. Aborting group transfer.`, error);
//             await fileDoc.updateOne({ status: 'ERROR' });
//             allTransfersSucceeded = false;
//             break;
//         }
//     }

//     if (allTransfersSucceeded) {
//         console.log(`[GROUP ${groupId}] All transfers successful. Cleaning up ${filesInGroup.length} files from Google Drive.`);
//         const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
//         for (const transferredFile of successfullyTransferredFiles) {
//             if (transferredFile.gDriveFileId) {
//                 try {
//                     await gDriveService.deleteFile(transferredFile.gDriveFileId);
//                     console.log(`[GROUP ${groupId}] Deleted ${transferredFile.originalName} from Drive.`);
//                 } catch (error) {
//                     console.error(`[GROUP ${groupId}] FAILED to delete ${transferredFile.gDriveFileId} from Drive during cleanup:`, error);
//                 }
//             }
//         }
//     } else {
//         console.log(`[GROUP ${groupId}] Transfer failed for at least one file. No files will be deleted from Google Drive.`);
//     }
//     console.log(`[GROUP ${groupId}] Finished processing.`);
// }

// // --- DOWNLOAD AND METADATA LOGIC (Unchanged) ---
// exports.downloadFile = async (req, res, next) => {
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId });
//         if (!file) { return res.status(404).json({ message: 'File not found.' }); }
//         res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
//         res.setHeader('Content-Length', file.size);
//         res.setHeader('Content-Type', 'application/octet-stream');
//         if (file.status === 'IN_TELEGRAM') {
//             const mergedStream = await getMergedTelegramStream(file.telegramMessageIds);
//             mergedStream.pipe(res);
//         } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
//             const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
//             gDriveStream.pipe(res);
//         } else {
//             res.status(500).json({ message: 'File is not available for download.' });
//         }
//     } catch (error) { next(error); }
// };

// exports.downloadGroupAsZip = async (req, res, next) => {
//     const { groupId } = req.params;
//     const tempDir = path.join(os.tmpdir(), `zip-${groupId}-${Date.now()}`);
//     try {
//         await fs.promises.mkdir(tempDir, { recursive: true });
//         const files = await File.find({ groupId }).sort({ createdAt: 1 });
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'No files found.' }); }
//         for (const file of files) {
//             const localFilePath = path.join(tempDir, file.originalName);
//             const writer = fs.createWriteStream(localFilePath);
//             let sourceStream;
//             if (file.status === 'IN_TELEGRAM' && file.telegramMessageIds.length > 0) {
//                 sourceStream = await getMergedTelegramStream(file.telegramMessageIds);
//             } else if ((file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') && file.gDriveFileId) {
//                 sourceStream = await gDriveService.getFileStream(file.gDriveFileId);
//             } else { continue; }
//             sourceStream.pipe(writer);
//             await new Promise((resolve, reject) => {
//                 writer.on('finish', resolve); writer.on('error', reject); sourceStream.on('error', reject);
//             });
//         }
//         const zipFileName = `${files[0].originalName.split('.')[0] || 'batch'}.zip`;
//         const zipFilePath = path.join(tempDir, zipFileName);
//         const output = fs.createWriteStream(zipFilePath);
//         const archive = archiver('zip', { zlib: { level: 9 } });
//         archive.pipe(output);
//         archive.directory(tempDir, false);
//         await archive.finalize();
//         await new Promise((resolve, reject) => {
//             output.on('close', resolve); archive.on('error', reject);
//         });
//         const zipStats = await fs.promises.stat(zipFilePath);
//         res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
//         res.setHeader('Content-Type', 'application/zip');
//         res.setHeader('Content-Length', zipStats.size);
//         const zipStream = fs.createReadStream(zipFilePath);
//         zipStream.pipe(res);
//     } catch (error) {
//         next(error);
//     } finally { fs.promises.rm(tempDir, { recursive: true, force: true }).catch(err => console.error("Error cleaning up temp zip dir:", err)); }
// };

// async function getMergedTelegramStream(telegramMessageIds) {
//     const passThrough = new PassThrough();
//     (async () => {
//         for (const messageId of telegramMessageIds) {
//             try {
//                 const chunkStream = await telegramService.getFileStream(messageId);
//                 await new Promise((resolve, reject) => {
//                     chunkStream.pipe(passThrough, { end: false });
//                     chunkStream.on('end', resolve);
//                     chunkStream.on('error', reject);
//                 });
//             } catch (err) { passThrough.emit('error', err); break; }
//         }
//         passThrough.end();
//     })().catch(err => passThrough.emit('error', err));
//     return passThrough;
// }

// exports.getGroupMetadata = async (req, res, next) => {
//     try {
//         const files = await File.find({ groupId: req.params.groupId }).select('originalName size uniqueId');
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'File group not found.' }); }
//         res.json(files);
//     } catch (error) { next(error); }
// };

// exports.getMyFiles = async (req, res, next) => {
//     try {
//         const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 }).select('originalName size uniqueId createdAt groupId');
//         res.json(files);
//     } catch (error) { next(error); }
// };

// // Expose the transfer function for server.js
// exports.transferGroupToTelegram = transferGroupToTelegram;



// // server/src/controllers/file.controller.js
// const File = require('../models/File');
// const gDriveService = require('../services/googleDrive.service');
// const telegramService = require('../services/telegram.service');
// const { PassThrough } = require('stream');
// const archiver = require('archiver');
// const fs = require('fs');
// const os = require('os');
// const path = require('path');

// // --- UPLOAD & IMMEDIATE TRIGGER LOGIC ---
// exports.uploadFile = async (req, res, next) => {
//     let fileDoc;
//     try {
//         const fileName = decodeURIComponent(req.headers['x-file-name']);
//         const fileSize = parseInt(req.headers['content-length'], 10);
//         const groupId = req.headers['x-group-id'];
//         const groupTotal = parseInt(req.headers['x-group-total'], 10);

//         if (!fileName || !fileSize || !groupId || !groupTotal) {
//             return res.status(400).json({ message: 'Missing required file metadata headers.' });
//         }
        
//         fileDoc = new File({
//             originalName: fileName, size: fileSize, owner: req.user ? req.user._id : null, groupId, groupTotal,
//         });

//         const passThrough = new PassThrough();
//         req.pipe(passThrough);

//         // Create the file on Google Drive using the stream
//         const gDriveFile = await gDriveService.createFile(fileName, req.headers['content-type'], passThrough);
        
//         // --- RESILIENT OWNERSHIP TRANSFER ---
//         // This is a "fire-and-forget" call. We trigger the ownership transfer
//         // but DO NOT `await` its completion. If it fails (e.g., due to the
//         // "Consent required" error), it will log the error on the server but
//         // will NOT stop the rest of this function from executing.
//         gDriveService.transferOwnership(gDriveFile.id);
//         // --- END OF FIX ---

//         fileDoc.gDriveFileId = gDriveFile.id;
//         fileDoc.status = 'IN_DRIVE';
//         fileDoc.driveUploadTimestamp = new Date();
//         await fileDoc.save();

//         const countInDrive = await File.countDocuments({ groupId, status: 'IN_DRIVE' });
//         if (countInDrive === groupTotal) {
//             console.log(`[GROUP ${groupId}] All ${groupTotal} files are in Drive. Starting immediate transfer to Telegram.`);
//             transferGroupToTelegram(groupId); 
//         }
        
//         // This response is now sent immediately after the file is received,
//         // making the frontend feel much faster.
//         res.status(201).json({ message: 'File upload to Drive initiated successfully.' });

//     } catch (error) {
//         console.error(`Upload failed for ${fileDoc?.originalName || 'unknown file'}:`, error);
//         if (fileDoc && fileDoc._id) { await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' }); }
//         next(error);
//     }
// };

// // --- BULLETPROOF BACKGROUND TRANSFER LOGIC ---
// async function transferGroupToTelegram(groupId) {
//     const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });
//     let allTransfersSucceeded = true;

//     console.log(`[GROUP ${groupId}] Starting transfer phase for ${filesInGroup.length} files.`);

//     for (const fileDoc of filesInGroup) {
//         try {
//             await fileDoc.updateOne({ status: 'ARCHIVING' });

//             const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
//             const CHUNK_SIZE = 15 * 1024 * 1024;
//             let chunkBuffer = Buffer.alloc(0);
//             const uploadPromises = [];
//             let chunkIndex = 0;

//             for await (const data of gDriveStream) {
//                 chunkBuffer = Buffer.concat([chunkBuffer, data]);
//                 while (chunkBuffer.length >= CHUNK_SIZE) {
//                     const chunkToUpload = chunkBuffer.slice(0, CHUNK_SIZE);
//                     chunkBuffer = chunkBuffer.slice(CHUNK_SIZE);
//                     uploadPromises.push(telegramService.uploadChunk(chunkToUpload, `${fileDoc.originalName}.part${chunkIndex++}`));
//                 }
//             }
//             if (chunkBuffer.length > 0) {
//                 uploadPromises.push(telegramService.uploadChunk(chunkBuffer, `${fileDoc.originalName}.part${chunkIndex++}`));
//             }

//             const messageIds = await Promise.all(uploadPromises);

//             await fileDoc.updateOne({ telegramMessageIds: messageIds, status: 'IN_TELEGRAM' });
//             console.log(`[GROUP ${groupId}] SUCCESS: Transferred ${fileDoc.originalName} to Telegram.`);

//         } catch (error) {
//             console.error(`[GROUP ${groupId}] FATAL ERROR: Failed to transfer ${fileDoc.originalName}. Aborting group transfer.`, error);
//             await fileDoc.updateOne({ status: 'ERROR' });
//             allTransfersSucceeded = false;
//             break;
//         }
//     }

//     if (allTransfersSucceeded) {
//         console.log(`[GROUP ${groupId}] All transfers successful. Starting cleanup of ${filesInGroup.length} files from Google Drive.`);
//         const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
//         for (const transferredFile of successfullyTransferredFiles) {
//             if (transferredFile.gDriveFileId) {
//                 try {
//                     await gDriveService.deleteFile(transferredFile.gDriveFileId);
//                     console.log(`[GROUP ${groupId}] Deleted ${transferredFile.originalName} from Drive.`);
//                 } catch (error) {
//                     console.error(`[GROUP ${groupId}] FAILED to delete ${transferredFile.gDriveFileId} from Drive during cleanup:`, error);
//                 }
//             }
//         }
//     } else {
//         console.log(`[GROUP ${groupId}] Transfer failed for at least one file. No files will be deleted from Google Drive.`);
//     }

//     console.log(`[GROUP ${groupId}] Finished processing.`);
// }

// // --- DOWNLOAD AND METADATA LOGIC ---
// exports.downloadFile = async (req, res, next) => {
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId });
//         if (!file) { return res.status(404).json({ message: 'File not found.' }); }
//         res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
//         res.setHeader('Content-Length', file.size);
//         res.setHeader('Content-Type', 'application/octet-stream');
//         if (file.status === 'IN_TELEGRAM') {
//             const mergedStream = await getMergedTelegramStream(file.telegramMessageIds);
//             mergedStream.pipe(res);
//         } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
//             const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
//             gDriveStream.pipe(res);
//         } else {
//             res.status(500).json({ message: 'File is not available for download.' });
//         }
//     } catch (error) { next(error); }
// };

// exports.downloadGroupAsZip = async (req, res, next) => {
//     const { groupId } = req.params;
//     const tempDir = path.join(os.tmpdir(), `zip-${groupId}-${Date.now()}`);
//     try {
//         await fs.promises.mkdir(tempDir, { recursive: true });
//         const files = await File.find({ groupId }).sort({ createdAt: 1 });
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'No files found.' }); }
//         for (const file of files) {
//             const localFilePath = path.join(tempDir, file.originalName);
//             const writer = fs.createWriteStream(localFilePath);
//             let sourceStream;
//             if (file.status === 'IN_TELEGRAM' && file.telegramMessageIds.length > 0) {
//                 sourceStream = await getMergedTelegramStream(file.telegramMessageIds);
//             } else if ((file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') && file.gDriveFileId) {
//                 sourceStream = await gDriveService.getFileStream(file.gDriveFileId);
//             } else { continue; }
//             sourceStream.pipe(writer);
//             await new Promise((resolve, reject) => {
//                 writer.on('finish', resolve); writer.on('error', reject); sourceStream.on('error', reject);
//             });
//         }
//         const zipFileName = `${files[0].originalName.split('.')[0] || 'batch'}.zip`;
//         const zipFilePath = path.join(tempDir, zipFileName);
//         const output = fs.createWriteStream(zipFilePath);
//         const archive = archiver('zip', { zlib: { level: 9 } });
//         archive.pipe(output);
//         archive.directory(tempDir, false);
//         await archive.finalize();
//         await new Promise((resolve, reject) => {
//             output.on('close', resolve); archive.on('error', reject);
//         });
//         const zipStats = await fs.promises.stat(zipFilePath);
//         res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
//         res.setHeader('Content-Type', 'application/zip');
//         res.setHeader('Content-Length', zipStats.size);
//         const zipStream = fs.createReadStream(zipFilePath);
//         zipStream.pipe(res);
//     } catch (error) {
//         next(error);
//     } finally { fs.promises.rm(tempDir, { recursive: true, force: true }).catch(err => console.error("Error cleaning temp zip dir:", err)); }
// };

// async function getMergedTelegramStream(telegramMessageIds) {
//     const passThrough = new PassThrough();
//     (async () => {
//         for (const messageId of telegramMessageIds) {
//             try {
//                 const chunkStream = await telegramService.getFileStream(messageId);
//                 await new Promise((resolve, reject) => {
//                     chunkStream.pipe(passThrough, { end: false });
//                     chunkStream.on('end', resolve);
//                     chunkStream.on('error', reject);
//                 });
//             } catch (err) { passThrough.emit('error', err); break; }
//         }
//         passThrough.end();
//     })().catch(err => passThrough.emit('error', err));
//     return passThrough;
// }

// exports.getGroupMetadata = async (req, res, next) => {
//     try {
//         const files = await File.find({ groupId: req.params.groupId }).select('originalName size uniqueId');
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'File group not found.' }); }
//         res.json(files);
//     } catch (error) { next(error); }
// };

// exports.getMyFiles = async (req, res, next) => {
//     try {
//         const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 }).select('originalName size uniqueId createdAt groupId');
//         res.json(files);
//     } catch (error) { next(error); }
// };

// // This is crucial for server.js to be able to call the archival function.
// exports.transferGroupToTelegram = transferGroupToTelegram;

// // server/src/controllers/file.controller.js
// const File = require('../models/File');
// const gDriveService = require('../services/googleDrive.service');
// const telegramService = require('../services/telegram.service');
// const { PassThrough } = require('stream');
// const archiver = require('archiver');
// const fs = require('fs');
// const os = require('os');
// const path = require('path');

// // This function is now exported so it can be called by the archival janitor in server.js
// exports.transferGroupToTelegram = transferGroupToTelegram;

// // --- UPLOAD & IMMEDIATE TRIGGER LOGIC ---

// /**
//  * Handles the streaming upload of a single file.
//  * 1. Receives file as a raw stream from the request body.
//  * 2. Creates a file document in MongoDB with status 'UPLOADING_TO_DRIVE'.
//  * 3. Streams the file directly to Google Drive.
//  * 4. On successful Drive upload, updates the file's status to 'IN_DRIVE'.
//  * 5. Checks if all files in the group have been uploaded.
//  * 6. If the group is complete, it immediately triggers the background transfer to Telegram.
//  */
// exports.uploadFile = async (req, res, next) => {
//     let fileDoc; // Keep a reference to the file document for error handling

//     try {
//         // Extract metadata from custom headers
//         const fileName = decodeURIComponent(req.headers['x-file-name']);
//         const fileSize = parseInt(req.headers['content-length'], 10);
//         const groupId = req.headers['x-group-id'];
//         const groupTotal = parseInt(req.headers['x-group-total'], 10);

//         if (!fileName || !fileSize || !groupId || !groupTotal) {
//             console.error('[UPLOAD] Failed: Missing required file metadata headers.');
//             return res.status(400).json({ message: 'Missing required file metadata headers.' });
//         }
        
//         console.log(`[UPLOAD][GROUP ${groupId}] Receiving file: ${fileName}`);

//         // Create the initial file record in the database
//         fileDoc = new File({
//             originalName: fileName,
//             size: fileSize,
//             owner: req.user ? req.user._id : null, // Handle anonymous uploads
//             groupId,
//             groupTotal,
//             status: 'UPLOADING_TO_DRIVE', // Initial status
//         });
//         await fileDoc.save();

//         // Use a PassThrough stream to pipe the incoming request to Google Drive
//         const passThrough = new PassThrough();
//         req.pipe(passThrough);

//         // Start the upload to Google Drive. The service uses OAuth2, so ownership is correct.
//         const gDriveFile = await gDriveService.createFile(fileName, req.headers['content-type'], passThrough);
        
//         console.log(`[UPLOAD][GROUP ${groupId}] Successfully uploaded ${fileName} to Drive. File ID: ${gDriveFile.id}`);

//         // Update the file document with the Google Drive ID and set status to 'IN_DRIVE'
//         fileDoc.gDriveFileId = gDriveFile.id;
//         fileDoc.status = 'IN_DRIVE';
//         fileDoc.driveUploadTimestamp = new Date();
//         await fileDoc.save();

//         // Check if this was the last file of the group
//         const countInDrive = await File.countDocuments({ groupId, status: 'IN_DRIVE' });
//         if (countInDrive === groupTotal) {
//             console.log(`[GROUP_COMPLETE][GROUP ${groupId}] All ${groupTotal} files are in Drive. Triggering immediate transfer to Telegram.`);
//             // This is a "fire-and-forget" call. We don't wait for it to finish.
//             // It runs in the background.
//             transferGroupToTelegram(groupId); 
//         }
        
//         res.status(201).json({ 
//             message: 'File uploaded to Drive successfully.',
//             uniqueId: fileDoc.uniqueId,
//             groupId: fileDoc.groupId,
//         });

//     } catch (error) {
//         console.error(`[UPLOAD_FAILED][GROUP ${fileDoc?.groupId}] Error during upload for ${fileDoc?.originalName || 'unknown file'}:`, error);
//         // If an error occurs, mark the file as 'ERROR' in the database
//         if (fileDoc && fileDoc._id) {
//             await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' });
//         }
//         next(error); // Pass error to the global error handler
//     }
// };

// // --- BULLETPROOF BACKGROUND TRANSFER LOGIC ---

// /**
//  * Transfers a complete group of files from Google Drive to Telegram.
//  * This function is designed to be run in the background and is resilient to failure.
//  * 1. Finds all files in a group that are ready for transfer ('IN_DRIVE').
//  * 2. Iterates through each file, updating its status to 'ARCHIVING'.
//  * 3. Streams the file from Google Drive, chunks it, and uploads each chunk to Telegram.
//  * 4. If all chunks for a file are uploaded, it saves the Telegram message IDs and marks the file 'IN_TELEGRAM'.
//  * 5. If ANY file in the group fails to transfer, the entire group process stops to prevent data loss.
//  * 6. ONLY if all files in the group are successfully transferred, it proceeds to delete them from Google Drive.
//  */
// async function transferGroupToTelegram(groupId) {
//     console.log(`[TRANSFER_START][GROUP ${groupId}] Looking for files to transfer from Drive to Telegram.`);
//     const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });

//     if (filesInGroup.length === 0) {
//         console.log(`[TRANSFER_INFO][GROUP ${groupId}] No files found in 'IN_DRIVE' status. Process may have already run.`);
//         return;
//     }

//     let allTransfersSucceeded = true;
//     console.log(`[TRANSFER_PHASE][GROUP ${groupId}] Starting transfer for ${filesInGroup.length} files.`);

//     for (const fileDoc of filesInGroup) {
//         try {
//             await fileDoc.updateOne({ status: 'ARCHIVING' });

//             const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
            
//             // Telegram has a 50MB upload limit via the bot API, we use 15MB chunks for safety.
//             const CHUNK_SIZE = 15 * 1024 * 1024; 
//             let chunkBuffer = Buffer.alloc(0);
//             const uploadPromises = [];
//             let chunkIndex = 0;

//             console.log(`[TRANSFER_CHUNKING][GROUP ${groupId}] Streaming and chunking ${fileDoc.originalName}...`);

//             for await (const data of gDriveStream) {
//                 chunkBuffer = Buffer.concat([chunkBuffer, data]);
//                 while (chunkBuffer.length >= CHUNK_SIZE) {
//                     const chunkToUpload = chunkBuffer.slice(0, CHUNK_SIZE);
//                     chunkBuffer = chunkBuffer.slice(CHUNK_SIZE);
//                     // Suffix chunks to keep them in order.
//                     uploadPromises.push(telegramService.uploadChunk(chunkToUpload, `${fileDoc.originalName}.part${chunkIndex++}`));
//                 }
//             }
//             // Upload any remaining data that is smaller than a full chunk
//             if (chunkBuffer.length > 0) {
//                 uploadPromises.push(telegramService.uploadChunk(chunkBuffer, `${fileDoc.originalName}.part${chunkIndex++}`));
//             }

//             const messageIds = await Promise.all(uploadPromises);

//             await fileDoc.updateOne({ telegramMessageIds: messageIds, status: 'IN_TELEGRAM' });
//             console.log(`[TRANSFER_SUCCESS][GROUP ${groupId}] Transferred ${fileDoc.originalName} to Telegram in ${messageIds.length} chunks.`);

//         } catch (error) {
//             console.error(`[TRANSFER_FATAL][GROUP ${groupId}] Failed to transfer ${fileDoc.originalName}. Aborting group transfer.`, error);
//             await fileDoc.updateOne({ status: 'ERROR' });
//             allTransfersSucceeded = false;
//             break; // Stop processing this group immediately on failure
//         }
//     }

//     // --- CLEANUP PHASE ---
//     if (allTransfersSucceeded) {
//         console.log(`[CLEANUP_START][GROUP ${groupId}] All transfers successful. Cleaning up ${filesInGroup.length} files from Google Drive.`);
//         // We re-fetch the files to ensure we have the latest state before deleting.
//         const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
//         for (const transferredFile of successfullyTransferredFiles) {
//             if (transferredFile.gDriveFileId) {
//                 try {
//                     await gDriveService.deleteFile(transferredFile.gDriveFileId);
//                     console.log(`[CLEANUP_SUCCESS][GROUP ${groupId}] Deleted ${transferredFile.originalName} (Drive ID: ${transferredFile.gDriveFileId}) from Drive.`);
//                 } catch (error) {
//                     // This is a non-fatal error for the user, but should be logged for admin attention.
//                     console.error(`[CLEANUP_FAILED][GROUP ${groupId}] Could not delete ${transferredFile.originalName} (Drive ID: ${transferredFile.gDriveFileId}) from Drive during cleanup:`, error);
//                 }
//             }
//         }
//     } else {
//         console.log(`[CLEANUP_SKIPPED][GROUP ${groupId}] Transfer failed for at least one file. No files will be deleted from Google Drive to ensure data safety.`);
//     }
//     console.log(`[TRANSFER_END][GROUP ${groupId}] Finished processing.`);
// }


// // --- DOWNLOAD AND METADATA LOGIC ---

// /**
//  * Streams a single file to the client from its current storage location (Telegram or Drive).
//  */
// exports.downloadFile = async (req, res, next) => {
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId });
//         if (!file) { return res.status(404).json({ message: 'File not found.' }); }

//         res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
//         res.setHeader('Content-Length', file.size);
//         res.setHeader('Content-Type', 'application/octet-stream');

//         if (file.status === 'IN_TELEGRAM') {
//             console.log(`[DOWNLOAD][TELEGRAM] Streaming ${file.originalName} for uniqueId ${file.uniqueId}`);
//             const mergedStream = await getMergedTelegramStream(file.telegramMessageIds);
//             mergedStream.pipe(res);
//         } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
//             console.log(`[DOWNLOAD][DRIVE] Streaming ${file.originalName} for uniqueId ${file.uniqueId}`);
//             const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
//             gDriveStream.pipe(res);
//         } else {
//             res.status(400).json({ message: 'File is not in a downloadable state. It may have encountered an error.' });
//         }
//     } catch (error) { next(error); }
// };

// /**
//  * Downloads all files in a group, zips them on the fly, and streams the ZIP to the client.
//  */
// exports.downloadGroupAsZip = async (req, res, next) => {
//     const { groupId } = req.params;
//     // Create a unique temporary directory for this request to avoid collisions
//     const tempDir = path.join(os.tmpdir(), `zip-${groupId}-${Date.now()}`);
    
//     try {
//         await fs.promises.mkdir(tempDir, { recursive: true });
//         const files = await File.find({ groupId }).sort({ createdAt: 1 });
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'No files found for this group.' }); }
        
//         console.log(`[ZIP_START][GROUP ${groupId}] Starting ZIP creation for ${files.length} files.`);

//         // Download all files from their respective storage to the temporary directory
//         for (const file of files) {
//             const localFilePath = path.join(tempDir, file.originalName);
//             const writer = fs.createWriteStream(localFilePath);
//             let sourceStream;

//             if (file.status === 'IN_TELEGRAM' && file.telegramMessageIds.length > 0) {
//                 sourceStream = await getMergedTelegramStream(file.telegramMessageIds);
//             } else if ((file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') && file.gDriveFileId) {
//                 sourceStream = await gDriveService.getFileStream(file.gDriveFileId);
//             } else {
//                 console.warn(`[ZIP_SKIP][GROUP ${groupId}] Skipping file ${file.originalName} because it's not in a downloadable state.`);
//                 continue; // Skip files that are in an error state or still uploading
//             }
            
//             sourceStream.pipe(writer);
//             // Wait for the file to be fully written to disk
//             await new Promise((resolve, reject) => {
//                 writer.on('finish', resolve);
//                 writer.on('error', reject);
//                 sourceStream.on('error', reject);
//             });
//         }

//         const zipFileName = `${files[0].originalName.split('.')[0] || 'batch'}.zip`;
//         const output = res; // We will stream the zip directly to the response

//         output.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
//         output.setHeader('Content-Type', 'application/zip');
        
//         const archive = archiver('zip', { zlib: { level: 9 } }); // Max compression
//         archive.pipe(output);
//         archive.directory(tempDir, false); // Add all files from tempDir to the zip root
        
//         console.log(`[ZIP_FINALIZE][GROUP ${groupId}] Finalizing and streaming ZIP file.`);
//         await archive.finalize();

//     } catch (error) {
//         next(error);
//     } finally {
//         // Crucial cleanup step: remove the temporary directory and its contents
//         fs.promises.rm(tempDir, { recursive: true, force: true })
//             .catch(err => console.error(`[ZIP_CLEANUP_ERROR] Error cleaning temp zip dir ${tempDir}:`, err));
//     }
// };

// /**
//  * Helper function to fetch multiple chunks from Telegram and merge them into a single readable stream.
//  */
// async function getMergedTelegramStream(telegramMessageIds) {
//     const passThrough = new PassThrough();
//     (async () => {
//         for (const messageId of telegramMessageIds) {
//             try {
//                 const chunkStream = await telegramService.getFileStream(messageId);
//                 // Pipe each chunk stream into the main PassThrough stream
//                 // 'end: false' prevents the PassThrough stream from closing after the first chunk
//                 await new Promise((resolve, reject) => {
//                     chunkStream.pipe(passThrough, { end: false });
//                     chunkStream.on('end', resolve);
//                     chunkStream.on('error', reject);
//                 });
//             } catch (err) {
//                 passThrough.emit('error', err); // Propagate errors to the consumer
//                 break;
//             }
//         }
//         passThrough.end(); // Manually end the stream after all chunks are piped
//     })().catch(err => passThrough.emit('error', err));
//     return passThrough;
// }

// /**
//  * Fetches metadata for all files within a specific group.
//  */
// exports.getGroupMetadata = async (req, res, next) => {
//     try {
//         const files = await File.find({ groupId: req.params.groupId }).select('originalName size uniqueId');
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'File group not found.' }); }
//         res.json(files);
//     } catch (error) { next(error); }
// };

// /**
//  * Fetches the upload history for the currently authenticated user.
//  */
// exports.getMyFiles = async (req, res, next) => {
//     try {
//         const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 }).select('originalName size uniqueId createdAt groupId');
//         res.json(files);
//     } catch (error) { next(error); }
// };



// // server/src/controllers/file.controller.js
// const File = require('../models/File');
// const gDriveService = require('../services/googleDrive.service');
// const telegramService = require('../services/telegram.service');
// const { PassThrough } = require('stream');
// const archiver = require('archiver');
// const fs = require('fs');
// const os = require('os');
// const path = require('path');

// // This function is now exported so it can be called by the archival janitor in server.js
// exports.transferGroupToTelegram = transferGroupToTelegram;

// // --- UPLOAD & IMMEDIATE TRIGGER LOGIC ---

// /**
//  * Handles the streaming upload of a single file.
//  * 1. Receives file as a raw stream from the request body.
//  * 2. Creates a file document in MongoDB with status 'UPLOADING_TO_DRIVE'.
//  * 3. Streams the file directly to Google Drive.
//  * 4. On successful Drive upload, updates the file's status to 'IN_DRIVE'.
//  * 5. Checks if all files in the group have been uploaded.
//  * 6. If the group is complete, it immediately triggers the background transfer to Telegram.
//  */
// exports.uploadFile = async (req, res, next) => {
//     let fileDoc; // Keep a reference to the file document for error handling

//     try {
//         // Extract metadata from custom headers
//         const fileName = decodeURIComponent(req.headers['x-file-name']);
//         const fileSize = parseInt(req.headers['content-length'], 10);
//         const groupId = req.headers['x-group-id'];
//         const groupTotal = parseInt(req.headers['x-group-total'], 10);

//         if (!fileName || !fileSize || !groupId || !groupTotal) {
//             console.error('[UPLOAD] Failed: Missing required file metadata headers.');
//             return res.status(400).json({ message: 'Missing required file metadata headers.' });
//         }
        
//         console.log(`[UPLOAD][GROUP ${groupId}] Receiving file: ${fileName}`);

//         // Create the initial file record in the database
//         fileDoc = new File({
//             originalName: fileName,
//             size: fileSize,
//             owner: req.user ? req.user._id : null, // Handle anonymous uploads
//             groupId,
//             groupTotal,
//             status: 'UPLOADING_TO_DRIVE', // Initial status
//         });
//         await fileDoc.save();

//         // Use a PassThrough stream to pipe the incoming request to Google Drive
//         const passThrough = new PassThrough();
//         req.pipe(passThrough);

//         // Start the upload to Google Drive. The service uses OAuth2, so ownership is correct.
//         const gDriveFile = await gDriveService.createFile(fileName, req.headers['content-type'], passThrough);
        
//         console.log(`[UPLOAD][GROUP ${groupId}] Successfully uploaded ${fileName} to Drive. File ID: ${gDriveFile.id}`);

//         // Update the file document with the Google Drive ID and set status to 'IN_DRIVE'
//         fileDoc.gDriveFileId = gDriveFile.id;
//         fileDoc.status = 'IN_DRIVE';
//         fileDoc.driveUploadTimestamp = new Date();
//         await fileDoc.save();

//         // Check if this was the last file of the group
//         const countInDrive = await File.countDocuments({ groupId, status: 'IN_DRIVE' });
//         if (countInDrive === groupTotal) {
//             console.log(`[GROUP_COMPLETE][GROUP ${groupId}] All ${groupTotal} files are in Drive. Triggering immediate transfer to Telegram.`);
//             // This is a "fire-and-forget" call. We don't wait for it to finish.
//             // It runs in the background.
//             transferGroupToTelegram(groupId); 
//         }
        
//         res.status(201).json({ 
//             message: 'File uploaded to Drive successfully.',
//             uniqueId: fileDoc.uniqueId,
//             groupId: fileDoc.groupId,
//         });

//     } catch (error) {
//         console.error(`[UPLOAD_FAILED][GROUP ${fileDoc?.groupId}] Error during upload for ${fileDoc?.originalName || 'unknown file'}:`, error);
//         // If an error occurs, mark the file as 'ERROR' in the database
//         if (fileDoc && fileDoc._id) {
//             await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' });
//         }
//         next(error); // Pass error to the global error handler
//     }
// };

// // --- BULLETPROOF BACKGROUND TRANSFER LOGIC ---

// /**
//  * Transfers a complete group of files from Google Drive to Telegram.
//  * This function is designed to be run in the background and is resilient to failure.
//  * 1. Finds all files in a group that are ready for transfer ('IN_DRIVE').
//  * 2. Iterates through each file, updating its status to 'ARCHIVING'.
//  * 3. Streams the file from Google Drive, chunks it, and uploads each chunk to Telegram.
//  * 4. If all chunks for a file are uploaded, it saves the Telegram message IDs and marks the file 'IN_TELEGRAM'.
//  * 5. If ANY file in the group fails to transfer, the entire group process stops to prevent data loss.
//  * 6. ONLY if all files in the group are successfully transferred, it proceeds to delete them from Google Drive.
//  */
// async function transferGroupToTelegram(groupId) {
//     console.log(`[TRANSFER_START][GROUP ${groupId}] Looking for files to transfer from Drive to Telegram.`);
//     const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });

//     if (filesInGroup.length === 0) {
//         console.log(`[TRANSFER_INFO][GROUP ${groupId}] No files found in 'IN_DRIVE' status. Process may have already run.`);
//         return;
//     }

//     let allTransfersSucceeded = true;
//     console.log(`[TRANSFER_PHASE][GROUP ${groupId}] Starting transfer for ${filesInGroup.length} files.`);

//     for (const fileDoc of filesInGroup) {
//         try {
//             await fileDoc.updateOne({ status: 'ARCHIVING' });

//             const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
            
//             // Telegram has a 50MB upload limit via the bot API, we use 15MB chunks for safety.
//             const CHUNK_SIZE = 15 * 1024 * 1024; 
//             let chunkBuffer = Buffer.alloc(0);
//             const uploadPromises = [];
//             let chunkIndex = 0;

//             console.log(`[TRANSFER_CHUNKING][GROUP ${groupId}] Streaming and chunking ${fileDoc.originalName}...`);

//             for await (const data of gDriveStream) {
//                 chunkBuffer = Buffer.concat([chunkBuffer, data]);
//                 while (chunkBuffer.length >= CHUNK_SIZE) {
//                     const chunkToUpload = chunkBuffer.slice(0, CHUNK_SIZE);
//                     chunkBuffer = chunkBuffer.slice(CHUNK_SIZE);
//                     // Suffix chunks to keep them in order.
//                     uploadPromises.push(telegramService.uploadChunk(chunkToUpload, `${fileDoc.originalName}.part${chunkIndex++}`));
//                 }
//             }
//             // Upload any remaining data that is smaller than a full chunk
//             if (chunkBuffer.length > 0) {
//                 uploadPromises.push(telegramService.uploadChunk(chunkBuffer, `${fileDoc.originalName}.part${chunkIndex++}`));
//             }

//             const messageIds = await Promise.all(uploadPromises);

//             await fileDoc.updateOne({ telegramMessageIds: messageIds, status: 'IN_TELEGRAM' });
//             console.log(`[TRANSFER_SUCCESS][GROUP ${groupId}] Transferred ${fileDoc.originalName} to Telegram in ${messageIds.length} chunks.`);

//         } catch (error) {
//             console.error(`[TRANSFER_FATAL][GROUP ${groupId}] Failed to transfer ${fileDoc.originalName}. Aborting group transfer.`, error);
//             await fileDoc.updateOne({ status: 'ERROR' });
//             allTransfersSucceeded = false;
//             break; // Stop processing this group immediately on failure
//         }
//     }

//     // --- CLEANUP PHASE ---
//     if (allTransfersSucceeded) {
//         console.log(`[CLEANUP_START][GROUP ${groupId}] All transfers successful. Cleaning up ${filesInGroup.length} files from Google Drive.`);
//         // We re-fetch the files to ensure we have the latest state before deleting.
//         const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
//         for (const transferredFile of successfullyTransferredFiles) {
//             if (transferredFile.gDriveFileId) {
//                 try {
//                     await gDriveService.deleteFile(transferredFile.gDriveFileId);
//                     console.log(`[CLEANUP_SUCCESS][GROUP ${groupId}] Deleted ${transferredFile.originalName} (Drive ID: ${transferredFile.gDriveFileId}) from Drive.`);
//                 } catch (error) {
//                     // This is a non-fatal error for the user, but should be logged for admin attention.
//                     console.error(`[CLEANUP_FAILED][GROUP ${groupId}] Could not delete ${transferredFile.originalName} (Drive ID: ${transferredFile.gDriveFileId}) from Drive during cleanup:`, error);
//                 }
//             }
//         }
//     } else {
//         console.log(`[CLEANUP_SKIPPED][GROUP ${groupId}] Transfer failed for at least one file. No files will be deleted from Google Drive to ensure data safety.`);
//     }
//     console.log(`[TRANSFER_END][GROUP ${groupId}] Finished processing.`);
// }


// // --- DOWNLOAD AND METADATA LOGIC ---

// /**
//  * Streams a single file to the client from its current storage location (Telegram or Drive).
//  */
// exports.downloadFile = async (req, res, next) => {
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId });
//         if (!file) { return res.status(404).json({ message: 'File not found.' }); }

//         res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
//         res.setHeader('Content-Length', file.size);
//         res.setHeader('Content-Type', 'application/octet-stream');

//         if (file.status === 'IN_TELEGRAM') {
//             console.log(`[DOWNLOAD][TELEGRAM] Streaming ${file.originalName} for uniqueId ${file.uniqueId}`);
//             const mergedStream = await getMergedTelegramStream(file.telegramMessageIds);
//             mergedStream.pipe(res);
//         } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
//             console.log(`[DOWNLOAD][DRIVE] Streaming ${file.originalName} for uniqueId ${file.uniqueId}`);
//             const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
//             gDriveStream.pipe(res);
//         } else {
//             res.status(400).json({ message: 'File is not in a downloadable state. It may have encountered an error.' });
//         }
//     } catch (error) { next(error); }
// };

// /**
//  * Downloads all files in a group, zips them on the fly, and streams the ZIP to the client.
//  */
// exports.downloadGroupAsZip = async (req, res, next) => {
//     const { groupId } = req.params;
//     // Create a unique temporary directory for this request to avoid collisions
//     const tempDir = path.join(os.tmpdir(), `zip-${groupId}-${Date.now()}`);
    
//     try {
//         await fs.promises.mkdir(tempDir, { recursive: true });
//         const files = await File.find({ groupId }).sort({ createdAt: 1 });
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'No files found for this group.' }); }
        
//         console.log(`[ZIP_START][GROUP ${groupId}] Starting ZIP creation for ${files.length} files.`);

//         // Download all files from their respective storage to the temporary directory
//         for (const file of files) {
//             const localFilePath = path.join(tempDir, file.originalName);
//             const writer = fs.createWriteStream(localFilePath);
//             let sourceStream;

//             if (file.status === 'IN_TELEGRAM' && file.telegramMessageIds.length > 0) {
//                 sourceStream = await getMergedTelegramStream(file.telegramMessageIds);
//             } else if ((file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') && file.gDriveFileId) {
//                 sourceStream = await gDriveService.getFileStream(file.gDriveFileId);
//             } else {
//                 console.warn(`[ZIP_SKIP][GROUP ${groupId}] Skipping file ${file.originalName} because it's not in a downloadable state.`);
//                 continue; // Skip files that are in an error state or still uploading
//             }
            
//             sourceStream.pipe(writer);
//             // Wait for the file to be fully written to disk
//             await new Promise((resolve, reject) => {
//                 writer.on('finish', resolve);
//                 writer.on('error', reject);
//                 sourceStream.on('error', reject);
//             });
//         }

//         const zipFileName = `${files[0].originalName.split('.')[0] || 'batch'}.zip`;
//         const output = res; // We will stream the zip directly to the response

//         output.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
//         output.setHeader('Content-Type', 'application/zip');
        
//         const archive = archiver('zip', { zlib: { level: 9 } }); // Max compression
//         archive.pipe(output);
//         archive.directory(tempDir, false); // Add all files from tempDir to the zip root
        
//         console.log(`[ZIP_FINALIZE][GROUP ${groupId}] Finalizing and streaming ZIP file.`);
//         await archive.finalize();

//     } catch (error) {
//         next(error);
//     } finally {
//         // Crucial cleanup step: remove the temporary directory and its contents
//         fs.promises.rm(tempDir, { recursive: true, force: true })
//             .catch(err => console.error(`[ZIP_CLEANUP_ERROR] Error cleaning temp zip dir ${tempDir}:`, err));
//     }
// };

// /**
//  * Helper function to fetch multiple chunks from Telegram and merge them into a single readable stream.
//  */
// async function getMergedTelegramStream(telegramMessageIds) {
//     const passThrough = new PassThrough();
//     (async () => {
//         for (const messageId of telegramMessageIds) {
//             try {
//                 const chunkStream = await telegramService.getFileStream(messageId);
//                 // Pipe each chunk stream into the main PassThrough stream
//                 // 'end: false' prevents the PassThrough stream from closing after the first chunk
//                 await new Promise((resolve, reject) => {
//                     chunkStream.pipe(passThrough, { end: false });
//                     chunkStream.on('end', resolve);
//                     chunkStream.on('error', reject);
//                 });
//             } catch (err) {
//                 passThrough.emit('error', err); // Propagate errors to the consumer
//                 break;
//             }
//         }
//         passThrough.end(); // Manually end the stream after all chunks are piped
//     })().catch(err => passThrough.emit('error', err));
//     return passThrough;
// }

// /**
//  * Fetches metadata for all files within a specific group.
//  */
// exports.getGroupMetadata = async (req, res, next) => {
//     try {
//         const files = await File.find({ groupId: req.params.groupId }).select('originalName size uniqueId');
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'File group not found.' }); }
//         res.json(files);
//     } catch (error) { next(error); }
// };

// /**
//  * Fetches the upload history for the currently authenticated user.
//  */
// exports.getMyFiles = async (req, res, next) => {
//     try {
//         const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 }).select('originalName size uniqueId createdAt groupId');
//         res.json(files);
//     } catch (error) { next(error); }
// };


// // server/src/controllers/file.controller.js
// const File = require('../models/File');
// const gDriveService = require('../services/googleDrive.service');
// const telegramService = require('../services/telegram.service');
// const { PassThrough } = require('stream');
// const archiver = require('archiver');
// const fs = require('fs');
// const os = require('os');
// const path = require('path');

// // Set a safe chunk size, just under the 2GB limit (1.9 GB)
// const TELEGRAM_CHUNK_SIZE = 1.9 * 1024 * 1024 * 1024;

// // --- UPLOAD & IMMEDIATE TRIGGER LOGIC (No changes here) ---
// exports.uploadFile = async (req, res, next) => {
//     // This function remains unchanged.
//     let fileDoc;
//     try {
//         const fileName = decodeURIComponent(req.headers['x-file-name']);
//         const fileSize = parseInt(req.headers['content-length'], 10);
//         const groupId = req.headers['x-group-id'];
//         const groupTotal = parseInt(req.headers['x-group-total'], 10);
//         if (!fileName || !fileSize || !groupId || !groupTotal) {
//             return res.status(400).json({ message: 'Missing required file metadata headers.' });
//         }
//         fileDoc = new File({ originalName: fileName, size: fileSize, owner: req.user ? req.user._id : null, groupId, groupTotal });
//         await fileDoc.save();
//         const passThrough = new PassThrough();
//         req.pipe(passThrough);
//         const gDriveFile = await gDriveService.createFile(fileName, req.headers['content-type'], passThrough);
//         fileDoc.gDriveFileId = gDriveFile.id;
//         fileDoc.status = 'IN_DRIVE';
//         fileDoc.driveUploadTimestamp = new Date();
//         await fileDoc.save();
//         const countInDrive = await File.countDocuments({ groupId, status: 'IN_DRIVE' });
//         if (countInDrive === groupTotal) {
//             console.log(`[GROUP ${groupId}] All files are in Drive. Triggering immediate transfer to Telegram.`);
//             transferGroupToTelegram(groupId);
//         }
//         res.status(201).json({ message: 'File upload to Drive initiated successfully.' });
//     } catch (error) {
//         console.error(`Upload failed for ${fileDoc?.originalName || 'unknown file'}:`, error);
//         if (fileDoc && fileDoc._id) { await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' }); }
//         next(error);
//     }
// };


// // --- REWRITTEN BACKGROUND TRANSFER WITH CHUNKING ---
// async function transferGroupToTelegram(groupId) {
//     const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });
//     let allTransfersSucceeded = true;
//     console.log(`[GROUP ${groupId}] Starting MTProto transfer for ${filesInGroup.length} files.`);
    
//     for (const fileDoc of filesInGroup) {
//         const tempFilePath = path.join(os.tmpdir(), `transfer-${fileDoc.uniqueId}-${fileDoc.originalName}`);
//         try {
//             await fileDoc.updateOne({ status: 'ARCHIVING' });
            
//             // 1. Download file from Google Drive to a temporary local file.
//             console.log(`[GROUP ${groupId}] Downloading ${fileDoc.originalName} from Drive to temp storage...`);
//             const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
//             const writer = fs.createWriteStream(tempFilePath);
//             await new Promise((resolve, reject) => {
//                 gDriveStream.pipe(writer);
//                 writer.on('finish', resolve);
//                 writer.on('error', reject);
//             });

//             // 2. Check file size and decide whether to chunk.
//             const fileStats = await fs.promises.stat(tempFilePath);
//             const chunkData = [];

//             if (fileStats.size <= TELEGRAM_CHUNK_SIZE) {
//                 // --- A) FILE IS SMALL ENOUGH, UPLOAD AS ONE PIECE ---
//                 console.log(`[GROUP ${groupId}] File ${fileDoc.originalName} is small enough. Uploading as single part.`);
//                 const messageId = await telegramService.uploadFile(tempFilePath, fileDoc.originalName);
//                 chunkData.push({ order: 0, messageId: messageId, size: fileStats.size });
//             } else {
//                 // --- B) FILE IS TOO LARGE, MUST BE CHUNKED ---
//                 console.log(`[GROUP ${groupId}] File ${fileDoc.originalName} is too large (${(fileStats.size / 1e9).toFixed(2)} GB). Starting chunking process.`);
//                 const fileHandle = await fs.promises.open(tempFilePath, 'r');
//                 let chunkIndex = 0;
//                 for (let offset = 0; offset < fileStats.size; offset += TELEGRAM_CHUNK_SIZE) {
//                     const bytesToRead = Math.min(TELEGRAM_CHUNK_SIZE, fileStats.size - offset);
//                     const chunkBuffer = Buffer.alloc(bytesToRead);
//                     await fileHandle.read(chunkBuffer, 0, bytesToRead, offset);

//                     // Create a temporary file for this specific chunk
//                     const chunkFilePath = `${tempFilePath}.part${chunkIndex}`;
//                     await fs.promises.writeFile(chunkFilePath, chunkBuffer);

//                     console.log(`[GROUP ${groupId}] Uploading chunk ${chunkIndex + 1}...`);
//                     const chunkFileName = `${fileDoc.originalName}.part${String(chunkIndex).padStart(3, '0')}`;
//                     const messageId = await telegramService.uploadFile(chunkFilePath, chunkFileName);
                    
//                     chunkData.push({ order: chunkIndex, messageId, size: bytesToRead });
                    
//                     // Clean up the temporary chunk file
//                     await fs.promises.unlink(chunkFilePath);
//                     chunkIndex++;
//                 }
//                 await fileHandle.close();
//             }

//             // 3. Update database with the new chunk information.
//             await fileDoc.updateOne({ telegramChunks: chunkData, status: 'IN_TELEGRAM' });
//             console.log(`[GROUP ${groupId}] SUCCESS: Transferred ${fileDoc.originalName} to Telegram in ${chunkData.length} chunk(s).`);

//         } catch (error) {
//             console.error(`[GROUP ${groupId}] FATAL MTProto ERROR for ${fileDoc.originalName}. Aborting group transfer.`, error);
//             await fileDoc.updateOne({ status: 'ERROR' });
//             allTransfersSucceeded = false;
//             break;
//         } finally {
//             // 4. Clean up the main temporary file.
//             if (fs.existsSync(tempFilePath)) {
//                 await fs.promises.unlink(tempFilePath);
//             }
//         }
//     }

//     // This cleanup logic for Google Drive remains unchanged.
//     if (allTransfersSucceeded) {
//         console.log(`[GROUP ${groupId}] All transfers successful. Cleaning up from Google Drive.`);
//         const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
//         for (const transferredFile of successfullyTransferredFiles) {
//             if (transferredFile.gDriveFileId) {
//                 try {
//                     await gDriveService.deleteFile(transferredFile.gDriveFileId);
//                     console.log(`[GROUP ${groupId}] Deleted ${transferredFile.originalName} from Drive.`);
//                 } catch (error) {
//                     console.error(`[GROUP ${groupId}] FAILED to delete ${transferredFile.gDriveFileId} from Drive:`, error);
//                 }
//             }
//         }
//     } else {
//         console.log(`[GROUP ${groupId}] Transfer failed. Files will remain in Google Drive for a retry.`);
//     }
//     console.log(`[GROUP ${groupId}] Finished MTProto processing.`);
// }
// exports.transferGroupToTelegram = transferGroupToTelegram;


// // --- HELPER FUNCTION TO MERGE TELEGRAM CHUNKS INTO A SINGLE STREAM ---
// async function getMergedTelegramStream(telegramChunks) {
//     // Sort chunks by order just in case they are not stored correctly
//     const sortedChunks = telegramChunks.sort((a, b) => a.order - b.order);
//     const passThrough = new PassThrough();

//     // Use an async IIFE to handle the sequential fetching and piping
//     (async () => {
//         for (const chunk of sortedChunks) {
//             try {
//                 const chunkStream = await telegramService.getFileStream(chunk.messageId);
//                 // Pipe the chunk stream into the main passThrough stream
//                 // 'end: false' prevents the main stream from closing after the first chunk
//                 await new Promise((resolve, reject) => {
//                     chunkStream.pipe(passThrough, { end: false });
//                     chunkStream.on('end', resolve);
//                     chunkStream.on('error', reject); // Propagate errors
//                 });
//             } catch (err) {
//                 // If any chunk fails, emit an error on the main stream and stop.
//                 passThrough.emit('error', new Error(`Failed to fetch chunk ${chunk.order}: ${err.message}`));
//                 return;
//             }
//         }
//         // After all chunks are successfully piped, end the main stream.
//         passThrough.end();
//     })().catch(err => passThrough.emit('error', err));

//     return passThrough;
// }


// // --- UPDATED DOWNLOAD LOGIC WITH MERGING ---
// exports.downloadFile = async (req, res, next) => {
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId });
//         if (!file) { return res.status(404).json({ message: 'File not found.' }); }
        
//         res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
//         res.setHeader('Content-Length', file.size);
//         res.setHeader('Content-Type', 'application/octet-stream');

//         if (file.status === 'IN_TELEGRAM') {
//             if (!file.telegramChunks || file.telegramChunks.length === 0) {
//                  return res.status(500).json({ message: 'File is in Telegram but has no chunk data.' });
//             }
            
//             // This function now handles both single-chunk and multi-chunk files.
//             console.log(`[DOWNLOAD] Streaming ${file.originalName} from Telegram in ${file.telegramChunks.length} chunk(s).`);
//             const mergedStream = await getMergedTelegramStream(file.telegramChunks);
//             mergedStream.pipe(res);

//         } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
//             const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
//             gDriveStream.pipe(res);
//         } else {
//             res.status(500).json({ message: 'File is not available for download.' });
//         }
//     } catch (error) { next(error); }
// };

// // // --- UPDATED ZIP DOWNLOAD LOGIC ---
// // exports.downloadGroupAsZip = async (req, res, next) => {
// //     const { groupId } = req.params;
// //     const tempDir = path.join(os.tmpdir(), `zip-${groupId}-${Date.now()}`);
// //     try {
// //         await fs.promises.mkdir(tempDir, { recursive: true });
// //         const files = await File.find({ groupId }).sort({ createdAt: 1 });
// //         if (!files || files.length === 0) { return res.status(404).json({ message: 'No files found.' }); }

// //         for (const file of files) {
// //             const localFilePath = path.join(tempDir, file.originalName);
// //             const writer = fs.createWriteStream(localFilePath);
// //             let sourceStream;

// //             if (file.status === 'IN_TELEGRAM' && file.telegramChunks && file.telegramChunks.length > 0) {
// //                 // Use the new merging helper function
// //                 sourceStream = await getMergedTelegramStream(file.telegramChunks);
// //             } else if ((file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') && file.gDriveFileId) {
// //                 sourceStream = await gDriveService.getFileStream(file.gDriveFileId);
// //             } else { continue; }

// //             await new Promise((resolve, reject) => {
// //                 sourceStream.pipe(writer);
// //                 writer.on('finish', resolve);
// //                 writer.on('error', reject);
// //             });
// //         }

// //         const zipFileName = `${files[0].originalName.split('.')[0] || 'batch'}.zip`;
// //         res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
// //         res.setHeader('Content-Type', 'application/zip');
// //         const archive = archiver('zip', { zlib: { level: 9 } });
// //         archive.pipe(res);
// //         archive.directory(tempDir, false);
// //         await archive.finalize();
// //     } catch (error) {
// //         next(error);
// //     } finally {
// //         fs.promises.rm(tempDir, { recursive: true, force: true }).catch(err => console.error("Error cleaning temp zip dir:", err));
// //     }
// // };

// // server/src/controllers/file.controller.js

// // ... (keep all other functions the same)

// // --- REWRITTEN ZIP DOWNLOAD LOGIC (NO TEMP FILES) ---
// exports.downloadGroupAsZip = async (req, res, next) => {
//     const { groupId } = req.params;
//     try {
//         const files = await File.find({ groupId }).sort({ createdAt: 1 });
//         if (!files || files.length === 0) {
//             return res.status(404).json({ message: 'No files found.' });
//         }

//         const zipFileName = `${files[0].originalName.split('.')[0] || 'batch'}.zip`;
//         res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
//         res.setHeader('Content-Type', 'application/zip');

//         const archive = archiver('zip', { zlib: { level: 9 } });

//         // If archive creation fails, forward the error to the client.
//         archive.on('error', (err) => {
//             throw err;
//         });

//         // Pipe the archive stream directly to the response.
//         archive.pipe(res);

//         // This loop processes files sequentially to avoid overwhelming the server.
//         for (const file of files) {
//             let sourceStream;

//             if (file.status === 'IN_TELEGRAM' && file.telegramChunks?.length > 0) {
//                 console.log(`[ZIP] Appending ${file.originalName} from Telegram.`);
//                 sourceStream = await getMergedTelegramStream(file.telegramChunks);
//             } else if ((file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') && file.gDriveFileId) {
//                 console.log(`[ZIP] Appending ${file.originalName} from Drive.`);
//                 sourceStream = await gDriveService.getFileStream(file.gDriveFileId);
//             } else {
//                 // Skip files that are in an error state or not available.
//                 console.warn(`[ZIP] Skipping unavailable file: ${file.originalName}`);
//                 continue;
//             }

//             // Append the file stream directly to the archive.
//             // The archiver will handle consuming the stream.
//             archive.append(sourceStream, { name: file.originalName });
//         }

//         // Finalize the archive, which tells it no more files will be added.
//         // The response will automatically end when the archive stream is fully piped.
//         await archive.finalize();

//     } catch (error) {
//         next(error);
//     }
//     // No 'finally' block needed to clean up files, because none were created!
// };


// // --- UNCHANGED ENDPOINTS ---
// exports.getGroupMetadata = async (req, res, next) => {
//     try {
//         const files = await File.find({ groupId: req.params.groupId }).select('originalName size uniqueId');
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'File group not found.' }); }
//         res.json(files);
//     } catch (error) { next(error); }
// };

// exports.getMyFiles = async (req, res, next) => {
//     try {
//         const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 }).select('originalName size uniqueId createdAt groupId');
//         res.json(files);
//     } catch (error) { next(error); }
// };



// const File = require('../models/File');
// const gDriveService = require('../services/googleDrive.service');
// const telegramService = require('../services/telegram.service');
// const { PassThrough } = require('stream');
// const archiver = require('archiver');
// const fs = require('fs');
// const path = require('path');

// const TEMP_UPLOAD_DIR = path.join(__dirname, '..', '..', 'tmp-uploads');
// fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });

// // --- NEW CHUNK AND MAX FILE SIZE ---
// const TELEGRAM_CHUNK_SIZE = 15 * 1024 * 1024; // 15 MB
// const BOT_API_MAX_SIZE = 50 * 1024 * 1024; // 50 MB

// // Only the transferGroupToTelegram function is changed significantly.
// // We are providing the full file for completeness.
// exports.uploadFile = async (req, res, next) => {
//     let fileDoc;
//     try {
//         const fileName = decodeURIComponent(req.headers['x-file-name']);
//         const fileSize = parseInt(req.headers['content-length'], 10);
//         const groupId = req.headers['x-group-id'];
//         const groupTotal = parseInt(req.headers['x-group-total'], 10);
//         if (!fileName || !fileSize || !groupId || !groupTotal) {
//             return res.status(400).json({ message: 'Missing required file metadata headers.' });
//         }
//         fileDoc = new File({ originalName: fileName, size: fileSize, owner: req.user ? req.user._id : null, groupId, groupTotal });
//         await fileDoc.save();
//         const passThrough = new PassThrough();
//         req.pipe(passThrough);
//         const gDriveFile = await gDriveService.createFile(fileName, req.headers['content-type'], passThrough);
//         fileDoc.gDriveFileId = gDriveFile.id;
//         fileDoc.status = 'IN_DRIVE';
//         fileDoc.driveUploadTimestamp = new Date();
//         await fileDoc.save();
//         const countInDrive = await File.countDocuments({ groupId, status: 'IN_DRIVE' });
//         if (countInDrive === groupTotal) {
//             console.log(`[GROUP ${groupId}] All files are in Drive. Triggering immediate transfer to Telegram.`);
//             transferGroupToTelegram(groupId);
//         }
//         res.status(201).json({ message: 'File upload to Drive initiated successfully.' });
//     } catch (error) {
//         console.error(`Upload failed for ${fileDoc?.originalName || 'unknown file'}:`, error);
//         if (fileDoc && fileDoc._id) { await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' }); }
//         next(error);
//     }
// };

// async function transferGroupToTelegram(groupId) {
//     const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });
//     let allTransfersSucceeded = true;
//     console.log(`[GROUP ${groupId}] Starting Bot API transfer for ${filesInGroup.length} files.`);
//     for (const fileDoc of filesInGroup) {
//         const tempFilePath = path.join(TEMP_UPLOAD_DIR, `transfer-${fileDoc.uniqueId}-${fileDoc.originalName}`);
//         try {
//             await fileDoc.updateOne({ status: 'ARCHIVING' });
//             console.log(`[GROUP ${groupId}] Downloading ${fileDoc.originalName} from Drive to temp storage...`);
//             const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
//             const writer = fs.createWriteStream(tempFilePath);
//             await new Promise((resolve, reject) => { gDriveStream.pipe(writer); writer.on('finish', resolve); writer.on('error', reject); });
            
//             const fileStats = await fs.promises.stat(tempFilePath);
            
//             // --- NEW: Validate file size for Bot API limit ---
//             if (fileStats.size > BOT_API_MAX_SIZE) {
//                 throw new Error(`File size (${(fileStats.size / 1e6).toFixed(2)} MB) exceeds the 50 MB limit for the Telegram Bot API.`);
//             }

//             const chunkData = [];
//             let firstThumbnail = null;

//             // Note: The chunking logic is now mostly for structure, as files are limited to 50MB.
//             // A 50MB file will be sent as 3x 15MB chunks and 1x 5MB chunk.
//             console.log(`[GROUP ${groupId}] File size is ${(fileStats.size / 1e6).toFixed(2)} MB. Starting chunking process.`);
//             let chunkIndex = 0;
//             for (let offset = 0; offset < fileStats.size; offset += TELEGRAM_CHUNK_SIZE) {
//                 const bytesToRead = Math.min(TELEGRAM_CHUNK_SIZE, fileStats.size - offset);
//                 const chunkFileName = `${fileDoc.originalName}.part${String(chunkIndex).padStart(3, '0')}`;
//                 const chunkFilePath = `${tempFilePath}.part${chunkIndex}`;

//                 const readStream = fs.createReadStream(tempFilePath, { start: offset, end: offset + bytesToRead - 1 });
//                 const writeStream = fs.createWriteStream(chunkFilePath);
//                 await new Promise((resolve, reject) => { readStream.pipe(writeStream); writeStream.on('finish', resolve); writeStream.on('error', reject); });
                
//                 console.log(`[GROUP ${groupId}] Uploading chunk ${chunkIndex + 1} (${(bytesToRead / 1e6).toFixed(2)} MB)...`);
//                 const { messageId, thumbnailBytes } = await telegramService.uploadFile(chunkFilePath, chunkFileName);
//                 await fs.promises.unlink(chunkFilePath);

//                 if (chunkIndex === 0 && thumbnailBytes) firstThumbnail = thumbnailBytes;
//                 chunkData.push({ order: chunkIndex, messageId, size: bytesToRead });
//                 chunkIndex++;
//             }

//             await fileDoc.updateOne({
//                 telegramChunks: chunkData,
//                 status: 'IN_TELEGRAM',
//                 thumbnail: firstThumbnail,
//             });
//             console.log(`[GROUP ${groupId}] SUCCESS: Transferred ${fileDoc.originalName} to Telegram in ${chunkData.length} chunk(s).`);
//         } catch (error) {
//             console.error(`[GROUP ${groupId}] FATAL BOT API ERROR for ${fileDoc.originalName}. Aborting group transfer.`, error);
//             await fileDoc.updateOne({ status: 'ERROR' });
//             allTransfersSucceeded = false;
//             break;
//         } finally {
//             if (fs.existsSync(tempFilePath)) { await fs.promises.unlink(tempFilePath); }
//         }
//     }
//     if (allTransfersSucceeded) {
//         console.log(`[GROUP ${groupId}] All transfers successful. Cleaning up from Google Drive.`);
//         const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
//         for (const transferredFile of successfullyTransferredFiles) {
//             if (transferredFile.gDriveFileId) {
//                 try {
//                     await gDriveService.deleteFile(transferredFile.gDriveFileId);
//                     console.log(`[GROUP ${groupId}] Deleted ${transferredFile.originalName} from Drive.`);
//                 } catch (error) {
//                     console.error(`[GROUP ${groupId}] FAILED to delete ${transferredFile.gDriveFileId} from Drive:`, error);
//                 }
//             }
//         }
//     } else {
//         console.log(`[GROUP ${groupId}] Transfer failed. Files will remain in Google Drive for a retry.`);
//     }
//     console.log(`[GROUP ${groupId}] Finished Bot API processing.`);
// }
// // The rest of the file (download functions, metadata) remains the same, but note the download will not work without further changes.

// async function transferGroupToTelegram(groupId) {
//     const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });
//     let allTransfersSucceeded = true;
//     console.log(`[GROUP ${groupId}] Starting MTProto transfer for ${filesInGroup.length} files.`);
//     for (const fileDoc of filesInGroup) {
//         const tempFilePath = path.join(TEMP_UPLOAD_DIR, `transfer-${fileDoc.uniqueId}-${fileDoc.originalName}`);
//         try {
//             await fileDoc.updateOne({ status: 'ARCHIVING' });
//             console.log(`[GROUP ${groupId}] Downloading ${fileDoc.originalName} from Drive to temp storage...`);
//             const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
//             const writer = fs.createWriteStream(tempFilePath);
//             await new Promise((resolve, reject) => { gDriveStream.pipe(writer); writer.on('finish', resolve); writer.on('error', reject); });
            
//             const fileStats = await fs.promises.stat(tempFilePath);
//             const chunkData = [];
//             let firstThumbnail = null;

//             if (fileStats.size <= TELEGRAM_CHUNK_SIZE) {
//                 console.log(`[GROUP ${groupId}] File ${fileDoc.originalName} is small enough. Uploading as single part.`);
//                 const { messageId, thumbnailBytes } = await telegramService.uploadFile(tempFilePath, fileDoc.originalName);
//                 chunkData.push({ order: 0, messageId, size: fileStats.size });
//                 if (thumbnailBytes) firstThumbnail = thumbnailBytes;
//             } else {
//                 console.log(`[GROUP ${groupId}] File ${fileDoc.originalName} is too large (${(fileStats.size / 1e9).toFixed(2)} GB). Starting chunking process.`);
//                 let chunkIndex = 0;
//                 for (let offset = 0; offset < fileStats.size; offset += TELEGRAM_CHUNK_SIZE) {
//                     const bytesToRead = Math.min(TELEGRAM_CHUNK_SIZE, fileStats.size - offset);
//                     const chunkFileName = `${fileDoc.originalName}.part${String(chunkIndex).padStart(3, '0')}`;
//                     const chunkFilePath = `${tempFilePath}.part${chunkIndex}`;

//                     // --- THE FIX: Stream chunk to a temporary file on disk ---
//                     const readStream = fs.createReadStream(tempFilePath, { start: offset, end: offset + bytesToRead - 1 });
//                     const writeStream = fs.createWriteStream(chunkFilePath);
//                     await new Promise((resolve, reject) => {
//                         readStream.pipe(writeStream);
//                         writeStream.on('finish', resolve);
//                         writeStream.on('error', reject);
//                     });
                    
//                     console.log(`[GROUP ${groupId}] Uploading chunk ${chunkIndex + 1}...`);
//                     // Pass the path to the new chunk file to the service
//                     const { messageId, thumbnailBytes } = await telegramService.uploadFile(chunkFilePath, chunkFileName);
                    
//                     // Clean up the temporary chunk file
//                     await fs.promises.unlink(chunkFilePath);

//                     if (chunkIndex === 0 && thumbnailBytes) firstThumbnail = thumbnailBytes;
//                     chunkData.push({ order: chunkIndex, messageId, size: bytesToRead });
//                     chunkIndex++;
//                 }
//             }
//             await fileDoc.updateOne({
//                 telegramChunks: chunkData,
//                 status: 'IN_TELEGRAM',
//                 thumbnail: firstThumbnail,
//             });
//             console.log(`[GROUP ${groupId}] SUCCESS: Transferred ${fileDoc.originalName} to Telegram in ${chunkData.length} chunk(s).`);
//         } catch (error) {
//             console.error(`[GROUP ${groupId}] FATAL MTProto ERROR for ${fileDoc.originalName}. Aborting group transfer.`, error);
//             await fileDoc.updateOne({ status: 'ERROR' });
//             allTransfersSucceeded = false;
//             break;
//         } finally {
//             if (fs.existsSync(tempFilePath)) { await fs.promises.unlink(tempFilePath); }
//         }
//     }
//     if (allTransfersSucceeded) {
//         console.log(`[GROUP ${groupId}] All transfers successful. Cleaning up from Google Drive.`);
//         const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
//         for (const transferredFile of successfullyTransferredFiles) {
//             if (transferredFile.gDriveFileId) {
//                 try {
//                     await gDriveService.deleteFile(transferredFile.gDriveFileId);
//                     console.log(`[GROUP ${groupId}] Deleted ${transferredFile.originalName} from Drive.`);
//                 } catch (error) {
//                     console.error(`[GROUP ${groupId}] FAILED to delete ${transferredFile.gDriveFileId} from Drive:`, error);
//                 }
//             }
//         }
//     } else {
//         console.log(`[GROUP ${groupId}] Transfer failed. Files will remain in Google Drive for a retry.`);
//     }
//     console.log(`[GROUP ${groupId}] Finished MTProto processing.`);
// }
// exports.transferGroupToTelegram = transferGroupToTelegram;

// async function getMergedTelegramStream(telegramChunks) {
//     const sortedChunks = telegramChunks.sort((a, b) => a.order - b.order);
//     const passThrough = new PassThrough();
//     (async () => {
//         for (const chunk of sortedChunks) {
//             try {
//                 const chunkStream = await telegramService.getFileStream(chunk.messageId);
//                 await new Promise((resolve, reject) => { chunkStream.pipe(passThrough, { end: false }); chunkStream.on('end', resolve); chunkStream.on('error', reject); });
//             } catch (err) {
//                 passThrough.emit('error', new Error(`Failed to fetch chunk ${chunk.order}: ${err.message}`));
//                 return;
//             }
//         }
//         passThrough.end();
//     })().catch(err => passThrough.emit('error', err));
//     return passThrough;
// }

// exports.downloadFile = async (req, res, next) => {
//     res.setTimeout(0);
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId });
//         if (!file) { return res.status(404).json({ message: 'File not found.' }); }
//         res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
//         res.setHeader('Content-Length', file.size);
//         res.setHeader('Content-Type', 'application/octet-stream');
//         if (file.status === 'IN_TELEGRAM') {
//             if (!file.telegramChunks || file.telegramChunks.length === 0) { return res.status(500).json({ message: 'File is in Telegram but has no chunk data.' }); }
//             console.log(`[DOWNLOAD] Streaming ${file.originalName} from Telegram in ${file.telegramChunks.length} chunk(s).`);
//             const mergedStream = await getMergedTelegramStream(file.telegramChunks);
//             mergedStream.pipe(res);
//         } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
//             const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
//             gDriveStream.pipe(res);
//         } else {
//             res.status(500).json({ message: 'File is not available for download.' });
//         }
//     } catch (error) { next(error); }
// };

// exports.downloadGroupAsZip = async (req, res, next) => {
//     res.setTimeout(0);
//     const { groupId } = req.params;
//     const tempDir = path.join(TEMP_UPLOAD_DIR, `zip-${groupId}-${Date.now()}`);
//     try {
//         await fs.promises.mkdir(tempDir, { recursive: true });
//         const files = await File.find({ groupId }).sort({ createdAt: 1 });
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'No files found.' }); }
//         for (const file of files) {
//             const localFilePath = path.join(tempDir, file.originalName);
//             const writer = fs.createWriteStream(localFilePath);
//             let sourceStream;
//             if (file.status === 'IN_TELEGRAM' && file.telegramChunks && file.telegramChunks.length > 0) {
//                 sourceStream = await getMergedTelegramStream(file.telegramChunks);
//             } else if ((file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') && file.gDriveFileId) {
//                 sourceStream = await gDriveService.getFileStream(file.gDriveFileId);
//             } else { continue; }
//             await new Promise((resolve, reject) => { sourceStream.pipe(writer); writer.on('finish', resolve); writer.on('error', reject); });
//         }
//         const zipFileName = `${files[0].originalName.split('.')[0] || 'batch'}.zip`;
//         res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
//         res.setHeader('Content-Type', 'application/zip');
//         const archive = archiver('zip', { zlib: { level: 9 } });
//         archive.pipe(res);
//         archive.directory(tempDir, false);
//         await archive.finalize();
//     } catch (error) {
//         next(error);
//     } finally {
//         fs.promises.rm(tempDir, { recursive: true, force: true }).catch(err => console.error("Error cleaning temp zip dir:", err));
//     }
// };

// exports.getGroupMetadata = async (req, res, next) => {
//     try {
//         const files = await File.find({ groupId: req.params.groupId }).select('originalName size uniqueId thumbnail');
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'File group not found.' }); }
//         const filesWithThumbnails = files.map(file => ({
//             originalName: file.originalName,
//             size: file.size,
//             uniqueId: file.uniqueId,
//             thumbnail: file.thumbnail ? file.thumbnail.toString('base64') : null,
//         }));
//         res.json(filesWithThumbnails);
//     } catch (error) { next(error); }
// };

// exports.getMyFiles = async (req, res, next) => {
//     try {
//         const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 }).select('originalName size uniqueId createdAt groupId');
//         res.json(files);
//     } catch (error) { next(error); }
// };



// // server/src/controllers/file.controller.js
// const File = require('../models/File');
// const gDriveService = require('../services/googleDrive.service');
// const telegramService = require('../services/telegram.service');
// const { PassThrough } = require('stream');
// const archiver = require('archiver');
// const fs = require('fs');
// const path = require('path');

// // Use a dedicated directory in your project for temporary files
// const TEMP_UPLOAD_DIR = path.join(__dirname, '..', '..', 'tmp-uploads');
// fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });

// // Use an integer for the chunk size to prevent errors
// const TELEGRAM_CHUNK_SIZE = Math.floor(1.9 * 1024 * 1024 * 1024);

// exports.uploadFile = async (req, res, next) => {
//     let fileDoc;
//     try {
//         const fileName = decodeURIComponent(req.headers['x-file-name']);
//         const fileSize = parseInt(req.headers['content-length'], 10);
//         const groupId = req.headers['x-group-id'];
//         const groupTotal = parseInt(req.headers['x-group-total'], 10);
//         if (!fileName || !fileSize || !groupId || !groupTotal) {
//             return res.status(400).json({ message: 'Missing required file metadata headers.' });
//         }
//         fileDoc = new File({ originalName: fileName, size: fileSize, owner: req.user ? req.user._id : null, groupId, groupTotal });
//         await fileDoc.save();
//         const passThrough = new PassThrough();
//         req.pipe(passThrough);
//         const gDriveFile = await gDriveService.createFile(fileName, req.headers['content-type'], passThrough);
//         fileDoc.gDriveFileId = gDriveFile.id;
//         fileDoc.status = 'IN_DRIVE';
//         fileDoc.driveUploadTimestamp = new Date();
//         await fileDoc.save();
//         const countInDrive = await File.countDocuments({ groupId, status: 'IN_DRIVE' });
//         if (countInDrive === groupTotal) {
//             console.log(`[GROUP ${groupId}] All files are in Drive. Triggering immediate transfer to Telegram.`);
//             transferGroupToTelegram(groupId);
//         }
//         res.status(201).json({ message: 'File upload to Drive initiated successfully.' });
//     } catch (error) {
//         console.error(`Upload failed for ${fileDoc?.originalName || 'unknown file'}:`, error);
//         if (fileDoc && fileDoc._id) { await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' }); }
//         next(error);
//     }
// };

// async function transferGroupToTelegram(groupId) {
//     const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });
//     let allTransfersSucceeded = true;
//     console.log(`[GROUP ${groupId}] Starting MTProto transfer for ${filesInGroup.length} files.`);
//     for (const fileDoc of filesInGroup) {
//         // This is the full path to the large temporary file downloaded from Google Drive
//         const tempFilePath = path.join(TEMP_UPLOAD_DIR, `transfer-${fileDoc.uniqueId}-${fileDoc.originalName}`);
//         try {
//             await fileDoc.updateOne({ status: 'ARCHIVING' });

//             // 1. Download the entire file from Google Drive to the temporary path
//             console.log(`[GROUP ${groupId}] Downloading ${fileDoc.originalName} from Drive to temp storage...`);
//             const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
//             const writer = fs.createWriteStream(tempFilePath);
//             await new Promise((resolve, reject) => { gDriveStream.pipe(writer); writer.on('finish', resolve); writer.on('error', reject); });
            
//             const fileStats = await fs.promises.stat(tempFilePath);
//             const chunkData = [];
//             let firstThumbnail = null;

//             // 2. Process the temporary file
//             if (fileStats.size <= TELEGRAM_CHUNK_SIZE) {
//                 // If the file is small enough, upload it directly
//                 console.log(`[GROUP ${groupId}] File ${fileDoc.originalName} is small enough. Uploading as single part.`);
//                 const { messageId, thumbnailBytes } = await telegramService.uploadFile(tempFilePath, fileDoc.originalName);
//                 chunkData.push({ order: 0, messageId, size: fileStats.size });
//                 if (thumbnailBytes) firstThumbnail = thumbnailBytes;
//             } else {
//                 // If the file is large, process it in chunks from the temporary file
//                 console.log(`[GROUP ${groupId}] File ${fileDoc.originalName} is too large (${(fileStats.size / 1e9).toFixed(2)} GB). Starting chunking process.`);
//                 let chunkIndex = 0;
//                 for (let offset = 0; offset < fileStats.size; offset += TELEGRAM_CHUNK_SIZE) {
//                     const bytesToRead = Math.min(TELEGRAM_CHUNK_SIZE, fileStats.size - offset);
//                     const chunkFileName = `${fileDoc.originalName}.part${String(chunkIndex).padStart(3, '0')}`;
//                     const chunkFilePath = `${tempFilePath}.part${chunkIndex}`;

//                     // Create a small, temporary chunk file on disk
//                     const readStream = fs.createReadStream(tempFilePath, { start: offset, end: offset + bytesToRead - 1 });
//                     const writeStream = fs.createWriteStream(chunkFilePath);
//                     await new Promise((resolve, reject) => {
//                         readStream.pipe(writeStream);
//                         writeStream.on('finish', resolve);
//                         writeStream.on('error', reject);
//                     });
                    
//                     console.log(`[GROUP ${groupId}] Uploading chunk ${chunkIndex + 1}...`);
//                     const { messageId, thumbnailBytes } = await telegramService.uploadFile(chunkFilePath, chunkFileName);
                    
//                     // Immediately delete the small chunk file
//                     await fs.promises.unlink(chunkFilePath);

//                     if (chunkIndex === 0 && thumbnailBytes) firstThumbnail = thumbnailBytes;
//                     chunkData.push({ order: chunkIndex, messageId, size: bytesToRead });
//                     chunkIndex++;
//                 }
//             }
//             // 3. Update the database
//             await fileDoc.updateOne({
//                 telegramChunks: chunkData,
//                 status: 'IN_TELEGRAM',
//                 thumbnail: firstThumbnail,
//             });
//             console.log(`[GROUP ${groupId}] SUCCESS: Transferred ${fileDoc.originalName} to Telegram in ${chunkData.length} chunk(s).`);
//         } catch (error) {
//             console.error(`[GROUP ${groupId}] FATAL MTProto ERROR for ${fileDoc.originalName}. Aborting group transfer.`, error);
//             await fileDoc.updateOne({ status: 'ERROR' });
//             allTransfersSucceeded = false;
//             break;
//         } finally {
//             // 4. Clean up the large temporary file from Google Drive
//             if (fs.existsSync(tempFilePath)) { await fs.promises.unlink(tempFilePath); }
//         }
//     }
//     // 5. Clean up from Google Drive if all transfers were successful
//     if (allTransfersSucceeded) {
//         console.log(`[GROUP ${groupId}] All transfers successful. Cleaning up from Google Drive.`);
//         const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
//         for (const transferredFile of successfullyTransferredFiles) {
//             if (transferredFile.gDriveFileId) {
//                 try {
//                     await gDriveService.deleteFile(transferredFile.gDriveFileId);
//                     console.log(`[GROUP ${groupId}] Deleted ${transferredFile.originalName} from Drive.`);
//                 } catch (error) {
//                     console.error(`[GROUP ${groupId}] FAILED to delete ${transferredFile.gDriveFileId} from Drive:`, error);
//                 }
//             }
//         }
//     } else {
//         console.log(`[GROUP ${groupId}] Transfer failed. Files will remain in Google Drive for a retry.`);
//     }
//     console.log(`[GROUP ${groupId}] Finished MTProto processing.`);
// }
// exports.transferGroupToTelegram = transferGroupToTelegram;

// async function getMergedTelegramStream(telegramChunks) {
//     const sortedChunks = telegramChunks.sort((a, b) => a.order - b.order);
//     const passThrough = new PassThrough();
//     (async () => {
//         for (const chunk of sortedChunks) {
//             try {
//                 const chunkStream = await telegramService.getFileStream(chunk.messageId);
//                 await new Promise((resolve, reject) => { chunkStream.pipe(passThrough, { end: false }); chunkStream.on('end', resolve); chunkStream.on('error', reject); });
//             } catch (err) {
//                 passThrough.emit('error', new Error(`Failed to fetch chunk ${chunk.order}: ${err.message}`));
//                 return;
//             }
//         }
//         passThrough.end();
//     })().catch(err => passThrough.emit('error', err));
//     return passThrough;
// }

// exports.downloadFile = async (req, res, next) => {
//     res.setTimeout(0);
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId });
//         if (!file) { return res.status(404).json({ message: 'File not found.' }); }
//         res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
//         res.setHeader('Content-Length', file.size);
//         res.setHeader('Content-Type', 'application/octet-stream');
//         if (file.status === 'IN_TELEGRAM') {
//             if (!file.telegramChunks || file.telegramChunks.length === 0) { return res.status(500).json({ message: 'File is in Telegram but has no chunk data.' }); }
//             console.log(`[DOWNLOAD] Streaming ${file.originalName} from Telegram in ${file.telegramChunks.length} chunk(s).`);
//             const mergedStream = await getMergedTelegramStream(file.telegramChunks);
//             mergedStream.pipe(res);
//         } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
//             const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
//             gDriveStream.pipe(res);
//         } else {
//             res.status(500).json({ message: 'File is not available for download.' });
//         }
//     } catch (error) { next(error); }
// };

// exports.downloadGroupAsZip = async (req, res, next) => {
//     res.setTimeout(0);
//     const { groupId } = req.params;
//     const tempDir = path.join(TEMP_UPLOAD_DIR, `zip-${groupId}-${Date.now()}`);
//     try {
//         await fs.promises.mkdir(tempDir, { recursive: true });
//         const files = await File.find({ groupId }).sort({ createdAt: 1 });
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'No files found.' }); }
//         for (const file of files) {
//             const localFilePath = path.join(tempDir, file.originalName);
//             const writer = fs.createWriteStream(localFilePath);
//             let sourceStream;
//             if (file.status === 'IN_TELEGRAM' && file.telegramChunks && file.telegramChunks.length > 0) {
//                 sourceStream = await getMergedTelegramStream(file.telegramChunks);
//             } else if ((file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') && file.gDriveFileId) {
//                 sourceStream = await gDriveService.getFileStream(file.gDriveFileId);
//             } else { continue; }
//             await new Promise((resolve, reject) => { sourceStream.pipe(writer); writer.on('finish', resolve); writer.on('error', reject); });
//         }
//         const zipFileName = `${files[0].originalName.split('.')[0] || 'batch'}.zip`;
//         res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
//         res.setHeader('Content-Type', 'application/zip');
//         const archive = archiver('zip', { zlib: { level: 9 } });
//         archive.pipe(res);
//         archive.directory(tempDir, false);
//         await archive.finalize();
//     } catch (error) {
//         next(error);
//     } finally {
//         fs.promises.rm(tempDir, { recursive: true, force: true }).catch(err => console.error("Error cleaning temp zip dir:", err));
//     }
// };

// exports.getGroupMetadata = async (req, res, next) => {
//     try {
//         const files = await File.find({ groupId: req.params.groupId }).select('originalName size uniqueId thumbnail');
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'File group not found.' }); }
//         const filesWithThumbnails = files.map(file => ({
//             originalName: file.originalName,
//             size: file.size,
//             uniqueId: file.uniqueId,
//             thumbnail: file.thumbnail ? file.thumbnail.toString('base64') : null,
//         }));
//         res.json(filesWithThumbnails);
//     } catch (error) { next(error); }
// };

// exports.getMyFiles = async (req, res, next) => {
//     try {
//         const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 }).select('originalName size uniqueId createdAt groupId');
//         res.json(files);
//     } catch (error) { next(error); }
// };


// const File = require('../models/File');
// const gDriveService = require('../services/googleDrive.service');
// const telegramService = require('../services/telegram.service');
// const archiver = require('archiver');
// const fs = require('fs');
// const path = require('path');
// const { PassThrough } = require('stream');

// // The temporary upload directory is still needed for the Google Drive to Telegram transfer.
// const TEMP_UPLOAD_DIR = path.join(__dirname, '..', '..', 'tmp-uploads');
// fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });


// // --- Updated UploadFile Controller ---
// // This version streams the user's upload directly to Google Drive without saving to disk first.
// exports.uploadFile = async (req, res, next) => {
//     let fileDoc;
//     try {
//         // Metadata is sent via headers in this model
//         const fileName = decodeURIComponent(req.headers['x-file-name']);
//         const fileSize = parseInt(req.headers['content-length'], 10);
//         const groupId = req.headers['x-group-id'];
//         const groupTotal = parseInt(req.headers['x-group-total'], 10);

//         if (!fileName || !fileSize || !groupId || !groupTotal) {
//             return res.status(400).json({ message: 'Missing required file metadata headers.' });
//         }

//         // Create the database record first
//         fileDoc = new File({
//             originalName: fileName,
//             size: fileSize,
//             owner: req.user ? req.user._id : null,
//             groupId: groupId,
//             groupTotal: parseInt(groupTotal, 10),
//             status: 'UPLOADING_TO_DRIVE', // Initial status
//         });
//         await fileDoc.save();

//         // Create a PassThrough stream to pipe the request body
//         const passThrough = new PassThrough();
//         req.pipe(passThrough);

//         // Stream the file directly to Google Drive
//         const gDriveFile = await gDriveService.createFile(fileName, req.headers['content-type'], passThrough);

//         // Once the upload to Drive is complete, update the database record
//         fileDoc.gDriveFileId = gDriveFile.id;
//         fileDoc.status = 'IN_DRIVE';
//         fileDoc.driveUploadTimestamp = new Date();
//         await fileDoc.save();

//         // Respond to the user *after* the Google Drive upload is finished
//         res.status(201).json({
//             message: 'File successfully uploaded to cloud storage.'
//         });

//         // Check if the group is complete to trigger the Telegram transfer
//         const countInDrive = await File.countDocuments({ groupId, status: 'IN_DRIVE' });
//         if (countInDrive === fileDoc.groupTotal) {
//             console.log(`[GROUP ${groupId}] All files are in Drive. Triggering immediate transfer to Telegram.`);
//             transferGroupToTelegram(groupId);
//         }

//     } catch (error) {
//         console.error(`Upload failed for a file in group ${fileDoc?.groupId || 'unknown'}:`, error);
//         if (fileDoc && fileDoc._id) {
//             await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' });
//         }
//         next(error);
//     }
// };


// // =========================================================================
// // The rest of the file (transferGroupToTelegram, downloads, etc.) remains the same.
// // =========================================================================


// // Using a smaller 15MB chunk size for increased reliability with large files
// const CHUNK_SIZE = 15 * 1024 * 1024;

// async function transferGroupToTelegram(groupId) {
//     const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });
//     let allTransfersSucceeded = true;
//     console.log(`[GROUP ${groupId}] Starting MTProto transfer for ${filesInGroup.length} files.`);

//     for (const fileDoc of filesInGroup) {
//         const tempFilePath = path.join(TEMP_UPLOAD_DIR, `transfer-${fileDoc.uniqueId}-${fileDoc.originalName}`);
//         try {
//             await fileDoc.updateOne({ status: 'ARCHIVING' });

//             console.log(`[GROUP ${groupId}] Downloading ${fileDoc.originalName} from Drive to temp storage...`);
//             const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
//             const writer = fs.createWriteStream(tempFilePath);
//             await new Promise((resolve, reject) => { gDriveStream.pipe(writer); writer.on('finish', resolve); writer.on('error', reject); });
            
//             const fileStats = await fs.promises.stat(tempFilePath);
//             const chunkData = [];
//             let firstThumbnail = null;

//             if (fileStats.size <= CHUNK_SIZE) {
//                 console.log(`[GROUP ${groupId}] File ${fileDoc.originalName} is small enough. Uploading as single part.`);
//                 const { messageId, thumbnailBytes } = await telegramService.uploadFile(tempFilePath, fileDoc.originalName);
//                 chunkData.push({ order: 0, messageId, size: fileStats.size });
//                 if (thumbnailBytes) firstThumbnail = thumbnailBytes;
//             } else {
//                 console.log(`[GROUP ${groupId}] File is large. Uploading in ${Math.ceil(fileStats.size / CHUNK_SIZE)} chunks of ~15MB.`);
//                 let chunkIndex = 0;
//                 for (let offset = 0; offset < fileStats.size; offset += CHUNK_SIZE) {
//                     const chunkFileName = `${fileDoc.originalName}.part${String(chunkIndex).padStart(4, '0')}`;
//                     const chunkFilePath = `${tempFilePath}.part${chunkIndex}`;
                    
//                     const readStream = fs.createReadStream(tempFilePath, { start: offset, end: offset + CHUNK_SIZE - 1 });
//                     const writeStream = fs.createWriteStream(chunkFilePath);
//                     await new Promise((resolve, reject) => { readStream.pipe(writeStream); writeStream.on('finish', resolve); writeStream.on('error', reject); });
                    
//                     const chunkStats = await fs.promises.stat(chunkFilePath);
//                     console.log(`[GROUP ${groupId}] Uploading chunk ${chunkIndex + 1}...`);
//                     const { messageId, thumbnailBytes } = await telegramService.uploadFile(chunkFilePath, chunkFileName);
                    
//                     await fs.promises.unlink(chunkFilePath);

//                     if (chunkIndex === 0 && thumbnailBytes) firstThumbnail = thumbnailBytes;
//                     chunkData.push({ order: chunkIndex, messageId, size: chunkStats.size });
//                     chunkIndex++;
//                 }
//             }
            
//             await fileDoc.updateOne({
//                 telegramChunks: chunkData,
//                 status: 'IN_TELEGRAM',
//                 thumbnail: firstThumbnail,
//             });
//             console.log(`[GROUP ${groupId}] SUCCESS: Transferred ${fileDoc.originalName} to Telegram in ${chunkData.length} chunk(s).`);
//         } catch (error) {
//             console.error(`[GROUP ${groupId}] FATAL MTProto ERROR for ${fileDoc.originalName}. Aborting group transfer.`, error);
//             await fileDoc.updateOne({ status: 'ERROR' });
//             allTransfersSucceeded = false;
//             break;
//         } finally {
//             if (fs.existsSync(tempFilePath)) {
//                 await fs.promises.unlink(tempFilePath);
//             }
//         }
//     }
    
//     if (allTransfersSucceeded) {
//         console.log(`[GROUP ${groupId}] All transfers successful. Cleaning up from Google Drive.`);
//         const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
//         for (const transferredFile of successfullyTransferredFiles) {
//             if (transferredFile.gDriveFileId) {
//                 try {
//                     await gDriveService.deleteFile(transferredFile.gDriveFileId);
//                     console.log(`[GROUP ${groupId}] Deleted ${transferredFile.originalName} from Drive.`);
//                 } catch (error) {
//                     console.error(`[GROUP ${groupId}] FAILED to delete ${transferredFile.gDriveFileId} from Drive:`, error);
//                 }
//             }
//         }
//     } else {
//         console.log(`[GROUP ${groupId}] Transfer failed. Files will remain in Google Drive for a retry.`);
//     }
//     console.log(`[GROUP ${groupId}] Finished MTProto processing.`);
// }
// exports.transferGroupToTelegram = transferGroupToTelegram;

// async function getMergedTelegramStream(telegramChunks) {
//     const sortedChunks = telegramChunks.sort((a, b) => a.order - b.order);
//     const passThrough = new PassThrough();
//     (async () => {
//         for (const chunk of sortedChunks) {
//             try {
//                 const chunkStream = await telegramService.getFileStream(chunk.messageId);
//                 await new Promise((resolve, reject) => { chunkStream.pipe(passThrough, { end: false }); chunkStream.on('end', resolve); chunkStream.on('error', reject); });
//             } catch (err) {
//                 passThrough.emit('error', new Error(`Failed to fetch chunk ${chunk.order}: ${err.message}`));
//                 return;
//             }
//         }
//         passThrough.end();
//     })().catch(err => passThrough.emit('error', err));
//     return passThrough;
// }

// exports.downloadFile = async (req, res, next) => {
//     res.setTimeout(0);
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId });
//         if (!file) { return res.status(404).json({ message: 'File not found.' }); }
//         res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
//         res.setHeader('Content-Length', file.size);
//         res.setHeader('Content-Type', 'application/octet-stream');
//         if (file.status === 'IN_TELEGRAM') {
//             if (!file.telegramChunks || file.telegramChunks.length === 0) { return res.status(500).json({ message: 'File is in Telegram but has no chunk data.' }); }
//             const mergedStream = await getMergedTelegramStream(file.telegramChunks);
//             mergedStream.pipe(res);
//         } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
//             const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
//             gDriveStream.pipe(res);
//         } else {
//             res.status(500).json({ message: 'File is not available for download.' });
//         }
//     } catch (error) { next(error); }
// };

// exports.downloadGroupAsZip = async (req, res, next) => {
//     res.setTimeout(0);
//     const { groupId } = req.params;
//     const tempDir = path.join(TEMP_UPLOAD_DIR, `zip-${groupId}-${Date.now()}`);
//     try {
//         await fs.promises.mkdir(tempDir, { recursive: true });
//         const files = await File.find({ groupId }).sort({ createdAt: 1 });
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'No files found.' }); }
//         for (const file of files) {
//             const localFilePath = path.join(tempDir, file.originalName);
//             const writer = fs.createWriteStream(localFilePath);
//             let sourceStream;
//             if (file.status === 'IN_TELEGRAM' && file.telegramChunks && file.telegramChunks.length > 0) {
//                 sourceStream = await getMergedTelegramStream(file.telegramChunks);
//             } else if ((file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') && file.gDriveFileId) {
//                 sourceStream = await gDriveService.getFileStream(file.gDriveFileId);
//             } else { continue; }
//             await new Promise((resolve, reject) => { sourceStream.pipe(writer); writer.on('finish', resolve); writer.on('error', reject); });
//         }
//         const zipFileName = `${files[0].originalName.split('.')[0] || 'batch'}.zip`;
//         res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
//         res.setHeader('Content-Type', 'application/zip');
//         const archive = require('archiver')('zip', { zlib: { level: 9 } });
//         archive.pipe(res);
//         archive.directory(tempDir, false);
//         await archive.finalize();
//     } catch (error) {
//         next(error);
//     } finally {
//         fs.promises.rm(tempDir, { recursive: true, force: true }).catch(err => console.error("Error cleaning temp zip dir:", err));
//     }
// };

// exports.getGroupMetadata = async (req, res, next) => {
//     try {
//         const files = await File.find({ groupId: req.params.groupId }).select('originalName size uniqueId thumbnail');
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'File group not found.' }); }
//         const filesWithThumbnails = files.map(file => ({
//             originalName: file.originalName,
//             size: file.size,
//             uniqueId: file.uniqueId,
//             thumbnail: file.thumbnail ? file.thumbnail.toString('base64') : null,
//         }));
//         res.json(filesWithThumbnails);
//     } catch (error) { next(error); }
// };

// exports.getMyFiles = async (req, res, next) => {
//     try {
//         const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 }).select('originalName size uniqueId createdAt groupId');
//         res.json(files);
//     } catch (error) { next(error); }
// };

// // server/src/controllers/file.controller.js

// const File = require('../models/File');
// const gDriveService = require('../services/googleDrive.service');
// const telegramService = require('../services/telegram.service');
// const { PassThrough } = require('stream');
// const archiver = require('archiver');
// const fs = require('fs');
// const path = require('path');
// const sanitize = require("sanitize-filename");

// const TEMP_UPLOAD_DIR = path.join(__dirname, '..', '..', 'tmp-uploads');
// fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });

// const CHUNK_SIZE = 18 * 1024 * 1024;

// // =====================================================================================
// // == NEW: Archival Queue and Worker Implementation
// // =====================================================================================

// // This queue will hold the IDs of groups waiting for archival.
// const archivalQueue = [];
// // This flag acts as a lock to ensure only one transfer happens at a time.
// let isArchivalWorkerRunning = false;

// /**
//  * The worker function. It processes one group from the queue at a time.
//  * It's a self-perpetuating loop that runs as long as the queue has items.
//  */
// async function processArchivalQueue() {
//     // If the worker is already busy with a group, do nothing. It will call itself when done.
//     if (isArchivalWorkerRunning) {
//         return;
//     }

//     // If the queue is empty, do nothing.
//     if (archivalQueue.length === 0) {
//         console.log('ARCHIVAL WORKER: Queue is empty. Going to sleep.');
//         return;
//     }

//     // Lock the worker and get the next job from the queue.
//     isArchivalWorkerRunning = true;
//     const groupId = archivalQueue.shift(); // .shift() gets the first item

//     console.log(`ARCHIVAL WORKER: Starting job for group ${groupId}. Queue size is now ${archivalQueue.length}.`);

//     try {
//         // The 'await' is critical. It pauses the worker here until the entire group is transferred.
//         await transferGroupToTelegram(groupId);
//         console.log(`ARCHIVAL WORKER: Successfully finished job for group ${groupId}.`);
//     } catch (error) {
//         // The error is already logged inside transferGroupToTelegram.
//         // We log it here again to show it was a worker failure.
//         console.error(`ARCHIVAL WORKER: Job for group ${groupId} FAILED. See error details above.`);
//     } finally {
//         // IMPORTANT: Unlock the worker so it can pick up the next job.
//         isArchivalWorkerRunning = false;
//         // Call the function again to check for the next item in the queue.
//         processArchivalQueue();
//     }
// }

// /**
//  * This is the function that schedulers will call. It adds a group to the
//  * queue and kicks off the worker if it's not already running.
//  * @param {string} groupId The ID of the group to schedule for archival.
//  */
// exports.scheduleGroupForArchival = (groupId) => {
//     // Prevent adding the same group to the queue multiple times.
//     if (!archivalQueue.includes(groupId)) {
//         archivalQueue.push(groupId);
//         console.log(`ARCHIVAL SCHEDULER: Group ${groupId} added to queue. Queue size: ${archivalQueue.length}`);
//     } else {
//         console.log(`ARCHIVAL SCHEDULER: Group ${groupId} is already in the queue.`);
//     }

//     // Start the worker process. If it's already running, this does nothing.
//     // If it's idle, this wakes it up.
//     processArchivalQueue();
// };


// // =====================================================================================
// // == THE REST OF THE CONTROLLER
// // =====================================================================================

// // This function is now very simple: just get the URL from the service and return it.
// exports.initiateUpload = async (req, res, next) => {
//     try {
//         const { fileName, mimeType, fileSize } = req.body;
//         const origin = req.headers.origin;

//         if (!fileName || !mimeType || fileSize === undefined) {
//             return res.status(400).json({ message: 'fileName, mimeType, and fileSize are required.' });
//         }
//         if (!origin) {
//             return res.status(400).json({ message: 'Request must have an Origin header.' });
//         }
        
//         const { uploadUrl } = await gDriveService.initiateResumableUpload(fileName, mimeType, fileSize, origin);
        
//         res.json({ uploadUrl });

//     } catch (error) {
//         console.error("Controller Error in initiateUpload:", error.message);
//         next(error); 
//     }
// };

// // This is the final confirmation step, where the database record is created.
// exports.uploadFile = async (req, res, next) => {
//     try {
//         const { originalName, size, gDriveFileId, groupId, groupTotal } = req.body;
//         if (!originalName || !size || !gDriveFileId || !groupId || !groupTotal) {
//             return res.status(400).json({ message: 'Missing required file metadata for confirmation.' });
//         }
        
//         const fileDoc = new File({
//             originalName,
//             size,
//             gDriveFileId,
//             groupId,
//             groupTotal,
//             owner: req.user ? req.user._id : null,
//             status: 'IN_DRIVE',
//             driveUploadTimestamp: new Date(),
//         });
//         await fileDoc.save();
        
//         const countInDrive = await File.countDocuments({ groupId, status: 'IN_DRIVE' });
        
//         // --- MODIFIED: Use the new scheduler ---
//         if (countInDrive === groupTotal) {
//             console.log(`[GROUP ${groupId}] All files confirmed in Drive. Scheduling group for transfer.`);
//             exports.scheduleGroupForArchival(groupId);
//         }
        
//         res.status(200).json({ message: 'File upload confirmed successfully.' });

//     } catch (error) {
//         console.error(`Upload confirmation failed:`, error);
//         next(error);
//     }
// };


// // This function is now the "core" transfer logic for a single group.
// // It is only ever called by the sequential worker. It is NOT exported.
// async function transferGroupToTelegram(groupId) {
//     try {
//         await File.updateMany(
//             { groupId, status: 'IN_DRIVE' },
//             { $inc: { archiveAttempts: 1 }, $set: { status: 'ARCHIVING' } }
//         );
//     } catch (dbError) {
//         console.error(`[GROUP ${groupId}] DB_ERROR: Could not mark group for archival. Aborting.`, dbError);
//         // Throw an error to notify the worker that this job failed.
//         throw dbError;
//     }

//     const filesInGroup = await File.find({ groupId, status: 'ARCHIVING' });
//     let allTransfersSucceeded = true;
//     console.log(`[GROUP ${groupId}] Starting direct stream transfer for ${filesInGroup.length} files.`);
    
//     // --- The key logic is here: this for...of loop with 'await' inside ensures
//     // --- that files within a group are also processed one by one.
//     for (const fileDoc of filesInGroup) {
//         console.log(`[GROUP ${groupId}] Processing ${fileDoc.originalName}...`);

//         await new Promise(async (resolve, reject) => {
//             let tempChunkPath = null;
//             try {
//                 const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);

//                 let chunks = [];
//                 let currentChunkSize = 0;
//                 let chunkIndex = 0;
//                 const telegramData = [];

//                 gDriveStream.on('data', async (data) => {
//                     gDriveStream.pause();
//                     chunks.push(data);
//                     currentChunkSize += data.length;

//                     if (currentChunkSize >= CHUNK_SIZE) {
//                         const bufferToUpload = Buffer.concat(chunks);
//                         const safeFileName = sanitize(fileDoc.originalName);
//                         tempChunkPath = path.join(TEMP_UPLOAD_DIR, `${safeFileName}.part${chunkIndex}`);
                        
//                         try {
//                             await fs.promises.writeFile(tempChunkPath, bufferToUpload);
//                             const chunkStats = await fs.promises.stat(tempChunkPath);
//                             const chunkUploadName = `${fileDoc.originalName}.part${String(chunkIndex).padStart(4, '0')}`;
//                             const { messageId, fileId } = await telegramService.uploadFile(tempChunkPath, chunkUploadName);
//                             telegramData.push({ order: chunkIndex, messageId, fileId, size: chunkStats.size });
                            
//                             chunks = [];
//                             currentChunkSize = 0;
//                             chunkIndex++;
//                         } finally {
//                             if (fs.existsSync(tempChunkPath)) {
//                                 await fs.promises.unlink(tempChunkPath);
//                             }
//                             tempChunkPath = null;
//                         }
//                     }
//                     gDriveStream.resume();
//                 });

//                 gDriveStream.on('end', async () => {
//                     try {
//                         if (currentChunkSize > 0) {
//                             const bufferToUpload = Buffer.concat(chunks);
//                             const safeFileName = sanitize(fileDoc.originalName);
//                             tempChunkPath = path.join(TEMP_UPLOAD_DIR, `${safeFileName}.part${chunkIndex}`);
//                             await fs.promises.writeFile(tempChunkPath, bufferToUpload);
//                             const chunkStats = await fs.promises.stat(tempChunkPath);
//                             const chunkUploadName = `${fileDoc.originalName}.part${String(chunkIndex).padStart(4, '0')}`;
//                             const { messageId, fileId } = await telegramService.uploadFile(tempChunkPath, chunkUploadName);
//                             telegramData.push({ order: chunkIndex, messageId, fileId, size: chunkStats.size });

//                             if (fs.existsSync(tempChunkPath)) {
//                                 await fs.promises.unlink(tempChunkPath);
//                             }
//                             tempChunkPath = null;
//                         }

//                         await fileDoc.updateOne({
//                             telegramChunks: telegramData,
//                             status: 'IN_TELEGRAM',
//                             thumbnail: null,
//                         });
                        
//                         console.log(`[GROUP ${groupId}] SUCCESS: Transferred ${fileDoc.originalName} to Telegram in ${telegramData.length} chunk(s).`);
//                         resolve();
//                     } catch (endError) {
//                         reject(endError);
                
//                     }
//                 });

//                 gDriveStream.on('error', (streamError) => {
//                     reject(streamError);
//                 });

//             } catch (error) {
//                 console.error(`[GROUP ${groupId}] FATAL ERROR for ${fileDoc.originalName}. Aborting group transfer.`, error.message);
//                 await fileDoc.updateOne({ status: 'IN_DRIVE' });
//                 allTransfersSucceeded = false;
//                 reject(error);
//             }
//         }).catch(() => {
//             allTransfersSucceeded = false;
//         });

//         if (!allTransfersSucceeded) {
//             console.error(`[GROUP ${groupId}] A file failed to transfer. Stopping group processing.`);
//             // When a file fails, we stop the entire group and throw an error to the worker.
//             throw new Error(`File transfer failed for group ${groupId}.`);
//         }
//     }
    
//     if (allTransfersSucceeded) {
//         console.log(`[GROUP ${groupId}] All transfers successful. Cleaning up from Google Drive.`);
//         const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
//         for (const transferredFile of successfullyTransferredFiles) {
//             if (transferredFile.gDriveFileId) {
//                 try {
//                     await gDriveService.deleteFile(transferredFile.gDriveFileId);
//                     console.log(`[GROUP ${groupId}] Deleted ${transferredFile.originalName} from Drive.`);
//                 } catch (error) {
//                     console.error(`[GROUP ${groupId}] FAILED to delete ${transferredFile.gDriveFileId} from Drive:`, error);
//                 }
//             }
//         }
//     }
//     console.log(`[GROUP ${groupId}] Finished direct stream processing.`);
// }

// // Make the function available for the archival janitor in server.js
// exports.transferGroupToTelegram = transferGroupToTelegram;

// // Helper function used by the UI. Not part of the transfer logic.
// function formatBytes(bytes, decimals = 2) {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const dm = decimals < 0 ? 0 : decimals;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
// }


// async function getMergedTelegramStream(telegramChunks) {
//     // Sort chunks by order to ensure correct assembly
//     const sortedChunks = telegramChunks.sort((a, b) => a.order - b.order);
//     const passThrough = new PassThrough();

//     // Asynchronously pipe each chunk's stream into the final PassThrough stream
//     (async () => {
//         for (const chunk of sortedChunks) {
//             if (!chunk.fileId) {
//                 passThrough.emit('error', new Error(`Chunk ${chunk.order} is missing a fileId.`));
//                 return;
//             }
//             try {
//                 const chunkStream = await telegramService.getFileStream(chunk.fileId);
//                 // Pipe the chunk stream and wait for it to finish before proceeding to the next one
//                 await new Promise((resolve, reject) => {
//                     chunkStream.pipe(passThrough, { end: false }); // end: false prevents the stream from closing early
//                     chunkStream.on('end', resolve);
//                     chunkStream.on('error', reject);
//                 });
//             } catch (err) {
//                 passThrough.emit('error', new Error(`Failed to fetch or pipe chunk ${chunk.order}: ${err.message}`));
//                 return;
//             }
//         }
//         // Once all chunks are piped, end the PassThrough stream
//         passThrough.end();
//     })().catch(err => passThrough.emit('error', err));
    
//     return passThrough;
// }

// exports.downloadFile = async (req, res, next) => {
//     res.setTimeout(0);
//     try {
//         const file = await File.findOne({ uniqueId: req.params.uniqueId });
//         if (!file) { return res.status(404).json({ message: 'File not found.' }); }
//         res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
//         res.setHeader('Content-Length', file.size);
//         res.setHeader('Content-Type', 'application/octet-stream');
//         if (file.status === 'IN_TELEGRAM') {
//             if (!file.telegramChunks || file.telegramChunks.length === 0) { return res.status(500).json({ message: 'File is in Telegram but has no chunk data.' }); }
//             const stream = await getMergedTelegramStream(file.telegramChunks);
//             stream.pipe(res);
//         } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
//             const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
//             gDriveStream.pipe(res);
//         } else {
//             res.status(500).json({ message: 'File is not available for download.' });
//         }
//     } catch (error) { next(error); }
// };

// exports.downloadGroupAsZip = async (req, res, next) => {
//     res.setTimeout(0);
//     const { groupId } = req.params;
//     const tempDir = path.join(TEMP_UPLOAD_DIR, `zip-${groupId}-${Date.now()}`);
//     try {
//         await fs.promises.mkdir(tempDir, { recursive: true });
//         const files = await File.find({ groupId }).sort({ createdAt: 1 });
//         if (!files || files.length === 0) { return res.status(404).json({ message: 'No files found.' }); }
//         for (const file of files) {
//             const localFilePath = path.join(tempDir, file.originalName);
//             const writer = fs.createWriteStream(localFilePath);
//             let sourceStream;
//             if (file.status === 'IN_TELEGRAM' && file.telegramChunks && file.telegramChunks.length > 0) {
//                 sourceStream = await getMergedTelegramStream(file.telegramChunks);
//             } else if ((file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') && file.gDriveFileId) {
//                 sourceStream = await gDriveService.getFileStream(file.gDriveFileId);
//             } else { continue; }
//             await new Promise((resolve, reject) => { sourceStream.pipe(writer); writer.on('finish', resolve); writer.on('error', reject); });
//         }
//         const zipFileName = `${files[0].originalName.split('.')[0] || 'batch'}.zip`;
//         res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
//         res.setHeader('Content-Type', 'application/zip');
//         const archive = require('archiver')('zip', { zlib: { level: 9 } });
//         archive.pipe(res);
//         archive.directory(tempDir, false);
//         await archive.finalize();
//     } catch (error) {
//         next(error);
//     } finally {
//         fs.promises.rm(tempDir, { recursive: true, force: true }).catch(err => console.error("Error cleaning temp zip dir:", err));
//     }
// };


// exports.getGroupMetadata = async (req, res, next) => {
//     try {
//         // <-- THE FIX IS HERE: Add a 10-second timeout to the database query.
//         const files = await File.find({ groupId: req.params.groupId })
//             .select('originalName size uniqueId thumbnail')
//             .maxTimeMS(10000); // Fails if the query takes longer than 10 seconds.

//         if (!files || files.length === 0) {
//             return res.status(404).json({ message: 'File group not found or has expired.' });
//         }
        
//         const filesWithThumbnails = files.map(file => ({
//             originalName: file.originalName,
//             size: file.size,
//             uniqueId: file.uniqueId,
//             thumbnail: file.thumbnail ? file.thumbnail.toString('base64') : null,
//         }));
        
//         res.json(filesWithThumbnails);
//     } catch (error) {
//         // If maxTimeMS is exceeded, this catch block will be triggered.
//         console.error(`Error fetching metadata for group ${req.params.groupId}:`, error.message);
//         next(error);
//     }
// };

// exports.getMyFiles = async (req, res, next) => {
//     try {
//         // Also a good idea to add a timeout here for consistency.
//         const files = await File.find({ owner: req.user._id })
//             .sort({ createdAt: -1 })
//             .select('originalName size uniqueId createdAt groupId')
//             .maxTimeMS(10000);
            
//         res.json(files);
//     } catch (error) {
//         next(error);
//     }
// };

const File = require('../models/File');
const gDriveService = require('../services/googleDrive.service');
const telegramService = require('../services/telegram.service'); 
const { PassThrough } = require('stream');
const fs = require('fs');
const path = require('path');
const sanitize = require("sanitize-filename");

const TEMP_UPLOAD_DIR = path.join(__dirname, '..', '..', 'tmp-uploads');
fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });

const CHUNK_SIZE = 18 * 1024 * 1024;

// --- MODIFIED: Parse the new JSON bot configuration ---
let botConfig;
try {
    botConfig = JSON.parse(process.env.TELEGRAM_BOT_TOKENS || '[]');
} catch (e) {
    throw new Error("FATAL: TELEGRAM_BOT_TOKENS in .env is not valid JSON.");
}
const botTokenMap = new Map(botConfig.map(bot => [bot.id, bot.token]));

const archivalQueue = [];
let isArchivalWorkerRunning = false;

// --- MODIFIED: This function now returns full bot config objects {id, token} ---
function getBotConfigsForChunk(chunkIndex, replicaCount, allBots) {
    const totalBots = allBots.length;
    if (replicaCount > totalBots) {
        console.warn(`Desired replica count (${replicaCount}) is higher than available bots (${totalBots}). Using all available bots.`);
        replicaCount = totalBots;
    }
    const configsToUse = new Map(); // Use a map to prevent duplicate bots
    for (let i = 0; i < replicaCount; i++) {
        const botIndex = (chunkIndex + i) % totalBots;
        const bot = allBots[botIndex];
        configsToUse.set(bot.id, bot);
    }
    let retries = 0;
    while (configsToUse.size < replicaCount && configsToUse.size < totalBots && retries < totalBots * 2) {
       const randomBot = allBots[Math.floor(Math.random() * totalBots)];
       configsToUse.set(randomBot.id, randomBot);
       retries++;
    }
    return Array.from(configsToUse.values());
}

async function transferGroupToTelegram(groupId) {
    try {
        await File.updateMany(
            { groupId, status: 'IN_DRIVE' },
            { $inc: { archiveAttempts: 1 }, $set: { status: 'ARCHIVING' } }
        );
    } catch (dbError) {
        console.error(`[GROUP ${groupId}] DB_ERROR: Could not mark group for archival. Aborting.`, dbError);
        throw dbError;
    }

    const filesInGroup = await File.find({ groupId, status: 'ARCHIVING' });
    let allTransfersSucceeded = true;
    console.log(`[GROUP ${groupId}] Starting transfer for ${filesInGroup.length} files.`);
    
    const desiredReplicaCount = parseInt(process.env.TELEGRAM_REPLICA_COUNT, 10) || 2;

    if (botConfig.length < desiredReplicaCount) {
        console.error(`[GROUP ${groupId}] FATAL: Not enough bot tokens (${botConfig.length}) to satisfy desired replica count of ${desiredReplicaCount}. Aborting.`);
        await File.updateMany({ groupId, status: 'ARCHIVING' }, { $set: { status: 'IN_DRIVE' }});
        return;
    }

    for (const fileDoc of filesInGroup) {
        console.log(`[GROUP ${groupId}] Processing ${fileDoc.originalName}...`);
        await new Promise(async (resolve, reject) => {
            let tempChunkPath = null;
            try {
                const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
                let chunks = [];
                let currentChunkSize = 0;
                let chunkIndex = 0;
                const telegramData = [];

                const processAndUploadChunk = async (buffer) => {
                    const safeFileName = sanitize(fileDoc.originalName);
                    tempChunkPath = path.join(TEMP_UPLOAD_DIR, `${safeFileName}.part${chunkIndex}`);
                    try {
                        await fs.promises.writeFile(tempChunkPath, buffer);
                        const chunkStats = await fs.promises.stat(tempChunkPath);
                        const chunkUploadName = `${fileDoc.originalName}.part${String(chunkIndex).padStart(4, '0')}`;
                        
                        const chunkLocations = [];
                        // --- MODIFIED: Get full bot configs to use ---
                        const botConfigsToUse = getBotConfigsForChunk(chunkIndex, desiredReplicaCount, botConfig);

                        console.log(`[GROUP ${groupId}] Uploading chunk ${chunkIndex} via bots: [${botConfigsToUse.map(b => b.id).join(', ')}]`);

                        for (const bot of botConfigsToUse) {
                            try {
                                // --- MODIFIED: Use bot.token for upload, store bot.id ---
                                const { messageId, fileId } = await telegramService.uploadFile(tempChunkPath, chunkUploadName, bot.token);
                                chunkLocations.push({ botId: bot.id, messageId, fileId });
                            } catch (uploadError) {
                                console.warn(`[GROUP ${groupId}] WARNING: Failed to upload chunk ${chunkIndex} via bot '${bot.id}'.`, uploadError);
                            }
                        }

                        if (chunkLocations.length === 0) {
                            throw new Error(`FATAL: All replica uploads failed for chunk ${chunkIndex} of ${fileDoc.originalName}.`);
                        }
                        
                        telegramData.push({ order: chunkIndex, size: chunkStats.size, locations: chunkLocations });
                        chunkIndex++;
                    } finally {
                        if (fs.existsSync(tempChunkPath)) await fs.promises.unlink(tempChunkPath);
                        tempChunkPath = null;
                    }
                };

                gDriveStream.on('data', async (data) => {
                    gDriveStream.pause();
                    chunks.push(data);
                    currentChunkSize += data.length;
                    if (currentChunkSize >= CHUNK_SIZE) {
                        await processAndUploadChunk(Buffer.concat(chunks));
                        chunks = [];
                        currentChunkSize = 0;
                    }
                    gDriveStream.resume();
                });

                gDriveStream.on('end', async () => {
                    try {
                        if (currentChunkSize > 0) {
                            await processAndUploadChunk(Buffer.concat(chunks));
                        }
                        await fileDoc.updateOne({
                            telegramChunks: telegramData,
                            status: 'IN_TELEGRAM',
                            thumbnail: null,
                        });
                        console.log(`[GROUP ${groupId}] SUCCESS: Transferred & Replicated ${fileDoc.originalName}`);
                        resolve();
                    } catch (endError) {
                        reject(endError);
                    }
                });

                gDriveStream.on('error', (streamError) => reject(streamError));

            } catch (error) {
                console.error(`[GROUP ${groupId}] FATAL ERROR for ${fileDoc.originalName}.`, error.message);
                await fileDoc.updateOne({ status: 'IN_DRIVE' });
                allTransfersSucceeded = false;
                reject(error);
            }
        }).catch(() => {
            allTransfersSucceeded = false;
        });

        if (!allTransfersSucceeded) {
            console.error(`[GROUP ${groupId}] A file failed to transfer. Stopping group processing.`);
            throw new Error(`File transfer failed for group ${groupId}.`);
        }
    }

    if (allTransfersSucceeded) {
        console.log(`[GROUP ${groupId}] All transfers successful. Cleaning up from Google Drive.`);
        const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
        for (const transferredFile of successfullyTransferredFiles) {
            if (transferredFile.gDriveFileId) {
                try {
                    await gDriveService.deleteFile(transferredFile.gDriveFileId);
                    console.log(`[GROUP ${groupId}] Deleted ${transferredFile.originalName} from Drive.`);
                } catch (error) {
                    console.error(`[GROUP ${groupId}] FAILED to delete from Drive:`, error);
                }
            }
        }
    }
}

// --- THE NEW, RANGE-AWARE TELEGRAM STREAMER ---
async function getMergedTelegramStream(telegramChunks, range, fileSize) {
    const sortedChunks = telegramChunks.sort((a, b) => a.order - b.order);
    const passThrough = new PassThrough();

    let startByte = 0;
    let endByte = fileSize - 1;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        startByte = parseInt(parts[0], 10);
        endByte = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    }

    // This async function runs in the background, feeding the stream
    (async () => {
        let bytesSent = 0;
        let totalBytesProcessed = 0;

        for (const chunk of sortedChunks) {
            const chunkStartByte = totalBytesProcessed;
            const chunkEndByte = totalBytesProcessed + chunk.size - 1;

            // --- CORE LOGIC: Check if this chunk is needed at all ---
            // If the chunk is entirely before the requested start range, skip it.
            if (chunkEndByte < startByte) {
                totalBytesProcessed += chunk.size;
                continue;
            }
            // If the chunk is entirely after the requested end range, we are done.
            if (chunkStartByte > endByte) {
                break;
            }

            let chunkStream = null;
            // ... (The failover logic for getting the stream from a healthy bot remains the same) ...
            try {
                // This part is unchanged: find a healthy replica
                let success = false;
                for (const location of chunk.locations) {
                    const token = botTokenMap.get(location.botId);
                    if (token) {
                        try {
                            chunkStream = await telegramService.getFileStream(location.fileId, token);
                            success = true;
                            break;
                        } catch (e) { /* try next replica */ }
                    }
                }
                if (!success) throw new Error(`All replicas failed for chunk ${chunk.order}`);
            } catch (err) {
                passThrough.emit('error', err);
                return;
            }

            // --- CORE LOGIC: Process the downloaded chunk ---
            // We have the full stream for the chunk, now we must slice it if necessary.
            await new Promise((resolve, reject) => {
                let currentChunkBytesProcessed = 0;

                chunkStream.on('data', (data) => {
                    const dataStartByte = chunkStartByte + currentChunkBytesProcessed;
                    const dataEndByte = dataStartByte + data.length - 1;
                    
                    // Determine the slice of data that is within the user's requested range
                    const sliceStart = Math.max(0, startByte - dataStartByte);
                    const sliceEnd = Math.min(data.length, endByte - dataStartByte + 1);

                    if (sliceStart < sliceEnd) {
                        passThrough.write(data.slice(sliceStart, sliceEnd));
                    }
                    
                    currentChunkBytesProcessed += data.length;
                });

                chunkStream.on('end', resolve);
                chunkStream.on('error', reject);
            });

            totalBytesProcessed += chunk.size;
        }
        passThrough.end();
    })().catch(err => passThrough.emit('error', err));
    
    return passThrough;
}



async function processArchivalQueue() {
    if (isArchivalWorkerRunning || archivalQueue.length === 0) {
        return;
    }
    isArchivalWorkerRunning = true;
    const groupId = archivalQueue.shift();
    console.log(`ARCHIVAL WORKER: Starting job for group ${groupId}. Queue size: ${archivalQueue.length}.`);
    try {
        await transferGroupToTelegram(groupId);
        console.log(`ARCHIVAL WORKER: Successfully finished job for group ${groupId}.`);
    } catch (error) {
        console.error(`ARCHIVAL WORKER: Job for group ${groupId} FAILED. Error: ${error.message}`);
    } finally {
        isArchivalWorkerRunning = false;
        process.nextTick(processArchivalQueue);
    }
}

// ... the rest of the file (API handlers) is unchanged and correct ...
// It uses the functions defined above.

const scheduleGroupForArchival = (groupId) => {
    if (!archivalQueue.includes(groupId)) {
        archivalQueue.push(groupId);
        console.log(`ARCHIVAL SCHEDULER: Group ${groupId} added to queue. Queue size: ${archivalQueue.length}`);
    }
    processArchivalQueue();
};

const initiateUpload = async (req, res, next) => {
    try {
        const { fileName, mimeType, fileSize } = req.body;
        const origin = req.headers.origin;
        if (!fileName || !mimeType || fileSize === undefined) {
            return res.status(400).json({ message: 'fileName, mimeType, and fileSize are required.' });
        }
        if (!origin) {
            return res.status(400).json({ message: 'Request must have an Origin header.' });
        }
        const { uploadUrl } = await gDriveService.initiateResumableUpload(fileName, mimeType, fileSize, origin);
        res.json({ uploadUrl });
    } catch (error) {
        console.error("Controller Error in initiateUpload:", error.message);
        next(error); 
    }
};

const uploadFile = async (req, res, next) => {
    try {
        const { originalName, size, gDriveFileId, groupId, groupTotal } = req.body;
        if (!originalName || !size || !gDriveFileId || !groupId || !groupTotal) {
            return res.status(400).json({ message: 'Missing required file metadata for confirmation.' });
        }
        const fileDoc = new File({
            originalName, size, gDriveFileId, groupId, groupTotal,
            owner: req.user ? req.user._id : null,
            status: 'IN_DRIVE', driveUploadTimestamp: new Date(),
        });
        await fileDoc.save();
        const countInDrive = await File.countDocuments({ groupId, status: 'IN_DRIVE' });
        if (countInDrive === groupTotal) {
            console.log(`[GROUP ${groupId}] All files confirmed in Drive. Scheduling group for transfer.`);
            scheduleGroupForArchival(groupId);
        }
        res.status(200).json({ message: 'File upload confirmed successfully.' });
    } catch (error) {
        console.error(`Upload confirmation failed:`, error);
        next(error);
    }
};

// --- THE FINAL, PRODUCTION-READY downloadFile HANDLER ---
const downloadFile = async (req, res, next) => {
    res.setTimeout(0);
    
    try {
        const file = await File.findOne({ uniqueId: req.params.uniqueId });
        if (!file) return res.status(404).json({ message: 'File not found.' });
        if (file.status === 'ERROR') return res.status(500).json({ message: 'This file is corrupted.' });

        const fileSize = file.size;
        const range = req.headers.range;

        // --- NEW, SIMPLIFIED LOGIC ---

        // If a range is requested for a file on Telegram, we cannot fulfill it.
        // The ONLY correct way to handle this is to tell the browser "I can't do that".
        // Sending a 416 "Range Not Satisfiable" tells the browser to stop trying to resume
        // and that it must start a new download if it wants the file.
        // This completely breaks the resume loop.
        if (range && file.status === 'IN_TELEGRAM') {
            console.log(`[DOWNLOAD] Denying range request for Telegram file ${file.uniqueId}. Forcing fresh download.`);
            // This error code is the standard way to reject a range request.
            return res.status(416).send('Range Not Satisfiable for this file type.');
        }

        // If the file is on Google Drive, we fully support range requests.
        if (range && (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING')) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;

            if (start >= fileSize) return res.status(416).send('Requested range not satisfiable');

            res.writeHead(206, { // 206 Partial Content
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${file.originalName}"`,
            });
            
            const fileStream = await gDriveService.getPartialFileStream(file.gDriveFileId, { start, end });
            req.on('close', () => fileStream.destroy());
            fileStream.on('error', (err) => { console.error(`GDRIVE PARTIAL STREAM ERROR:`, err); });
            fileStream.pipe(res);
            return; // End execution
        }

        // --- This part now handles ONLY FULL file downloads ---
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${file.originalName}"`,
            'Accept-Ranges': 'bytes'
        });

        let fileStream;
        if (file.status === 'IN_TELEGRAM') {
            fileStream = await getMergedTelegramStream(file.telegramChunks);
        } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
            fileStream = await gDriveService.getFileStream(file.gDriveFileId);
        } else {
            return res.end();
        }
        
        req.on('close', () => { if(fileStream?.destroy) fileStream.destroy(); });
        fileStream.on('error', (err) => { console.error(`STREAM ERROR:`, err); });
        fileStream.pipe(res);

    } catch (error) {
        next(error);
    }
};

const getGroupMetadata = async (req, res, next) => {
    try {
        const files = await File.find({ groupId: req.params.groupId })
            .select('originalName size uniqueId thumbnail')
            .maxTimeMS(10000);
        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'File group not found or has expired.' });
        }
        const filesWithThumbnails = files.map(file => ({
            originalName: file.originalName,
            size: file.size,
            uniqueId: file.uniqueId,
            thumbnail: file.thumbnail ? file.thumbnail.toString('base64') : null,
        }));
        res.json(filesWithThumbnails);
    } catch (error) {
        console.error(`Error fetching metadata for group ${req.params.groupId}:`, error.message);
        next(error);
    }
};

const getMyFiles = async (req, res, next) => {
    try {
        const files = await File.find({ owner: req.user._id })
            .sort({ createdAt: -1 })
            .select('originalName size uniqueId createdAt groupId')
            .maxTimeMS(10000);
        res.json(files);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    scheduleGroupForArchival,
    initiateUpload,
    uploadFile,
    downloadFile,
    getGroupMetadata,
    getMyFiles
};