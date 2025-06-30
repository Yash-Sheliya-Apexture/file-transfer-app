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


// server/src/controllers/file.controller.js

const File = require('../models/File');
const gDriveService = require('../services/googleDrive.service');
const telegramService = require('../services/telegram.service');
const { PassThrough } = require('stream');
const archiver = require('archiver');
const fs = require('fs');
const os = require('os');
const path = require('path');

// --- UPLOAD & IMMEDIATE TRIGGER LOGIC ---
exports.uploadFile = async (req, res, next) => {
    let fileDoc;
    try {
        const fileName = decodeURIComponent(req.headers['x-file-name']);
        const fileSize = parseInt(req.headers['content-length'], 10);
        const groupId = req.headers['x-group-id'];
        const groupTotal = parseInt(req.headers['x-group-total'], 10);

        if (!fileName || !fileSize || !groupId || !groupTotal) {
            return res.status(400).json({ message: 'Missing required file metadata headers.' });
        }
        fileDoc = new File({
            originalName: fileName, size: fileSize, owner: req.user ? req.user._id : null, groupId, groupTotal,
        });
        const passThrough = new PassThrough();
        req.pipe(passThrough);
        const gDriveFile = await gDriveService.createFile(fileName, req.headers['content-type'], passThrough);
        fileDoc.gDriveFileId = gDriveFile.id;
        fileDoc.status = 'IN_DRIVE';
        await fileDoc.save();
        const countInDrive = await File.countDocuments({ groupId, status: 'IN_DRIVE' });
        if (countInDrive === groupTotal) {
            console.log(`[GROUP ${groupId}] All ${groupTotal} files are in Drive. Starting immediate transfer to Telegram.`);
            transferGroupToTelegram(groupId);
        }
        res.status(201).json({ message: 'File uploaded to Drive successfully.' });
    } catch (error) {
        console.error(`Upload failed for ${fileDoc?.originalName || 'unknown file'}:`, error);
        if (fileDoc && fileDoc._id) { await File.findByIdAndUpdate(fileDoc._id, { status: 'ERROR' }); }
        next(error);
    }
};

// --- BULLETPROOF BACKGROUND TRANSFER LOGIC ---
async function transferGroupToTelegram(groupId) {
    const filesInGroup = await File.find({ groupId, status: 'IN_DRIVE' });
    let allTransfersSucceeded = true;

    console.log(`[GROUP ${groupId}] Starting transfer phase for ${filesInGroup.length} files.`);

    // PHASE 1: TRANSFER ALL FILES. Stop if any single file fails.
    for (const fileDoc of filesInGroup) {
        try {
            await fileDoc.updateOne({ status: 'ARCHIVING' });

            const gDriveStream = await gDriveService.getFileStream(fileDoc.gDriveFileId);
            const CHUNK_SIZE = 15 * 1024 * 1024;
            let chunkBuffer = Buffer.alloc(0);
            const uploadPromises = [];
            let chunkIndex = 0;

            for await (const data of gDriveStream) {
                chunkBuffer = Buffer.concat([chunkBuffer, data]);
                while (chunkBuffer.length >= CHUNK_SIZE) {
                    const chunkToUpload = chunkBuffer.slice(0, CHUNK_SIZE);
                    chunkBuffer = chunkBuffer.slice(CHUNK_SIZE);
                    uploadPromises.push(telegramService.uploadChunk(chunkToUpload, `${fileDoc.originalName}.part${chunkIndex++}`));
                }
            }
            if (chunkBuffer.length > 0) {
                uploadPromises.push(telegramService.uploadChunk(chunkBuffer, `${fileDoc.originalName}.part${chunkIndex++}`));
            }

            const messageIds = await Promise.all(uploadPromises);

            await fileDoc.updateOne({ telegramMessageIds: messageIds, status: 'IN_TELEGRAM' });
            console.log(`[GROUP ${groupId}] SUCCESS: Transferred ${fileDoc.originalName} to Telegram.`);

        } catch (error) {
            console.error(`[GROUP ${groupId}] FATAL ERROR: Failed to transfer ${fileDoc.originalName}. Aborting group transfer.`, error);
            await fileDoc.updateOne({ status: 'ERROR' });
            allTransfersSucceeded = false;
            break;
        }
    }

    // PHASE 2: ATOMIC CLEANUP. Only run if ALL files succeeded.
    if (allTransfersSucceeded) {
        console.log(`[GROUP ${groupId}] All transfers successful. Starting cleanup of ${filesInGroup.length} files from Google Drive.`);
        // NOTE: We refetch the files to ensure we have the correct gDriveFileId for all of them.
        const successfullyTransferredFiles = await File.find({ groupId, status: 'IN_TELEGRAM' });
        for (const transferredFile of successfullyTransferredFiles) {
            if (transferredFile.gDriveFileId) {
                try {
                    await gDriveService.deleteFile(transferredFile.gDriveFileId);
                    console.log(`[GROUP ${groupId}] Deleted ${transferredFile.originalName} from Drive.`);
                } catch (error) {
                    console.error(`[GROUP ${groupId}] FAILED to delete ${transferredFile.gDriveFileId} from Drive during cleanup:`, error);
                }
            }
        }
    } else {
        console.log(`[GROUP ${groupId}] Transfer failed for at least one file. No files will be deleted from Google Drive.`);
    }

    console.log(`[GROUP ${groupId}] Finished processing.`);
}


// --- DOWNLOAD AND METADATA LOGIC ---
exports.downloadFile = async (req, res, next) => {
    try {
        const file = await File.findOne({ uniqueId: req.params.uniqueId });
        if (!file) { return res.status(404).json({ message: 'File not found.' }); }
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Length', file.size);
        res.setHeader('Content-Type', 'application/octet-stream');
        if (file.status === 'IN_TELEGRAM') {
            const mergedStream = await getMergedTelegramStream(file.telegramMessageIds);
            mergedStream.pipe(res);
        } else if (file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') {
            const gDriveStream = await gDriveService.getFileStream(file.gDriveFileId);
            gDriveStream.pipe(res);
        } else {
            res.status(500).json({ message: 'File is not available for download.' });
        }
    } catch (error) { next(error); }
};
exports.downloadGroupAsZip = async (req, res, next) => {
    const { groupId } = req.params;
    const tempDir = path.join(os.tmpdir(), `zip-${groupId}-${Date.now()}`);
    try {
        await fs.promises.mkdir(tempDir, { recursive: true });
        const files = await File.find({ groupId }).sort({ createdAt: 1 });
        if (!files || files.length === 0) { return res.status(404).json({ message: 'No files found.' }); }
        for (const file of files) {
            const localFilePath = path.join(tempDir, file.originalName);
            const writer = fs.createWriteStream(localFilePath);
            let sourceStream;
            if (file.status === 'IN_TELEGRAM' && file.telegramMessageIds.length > 0) {
                sourceStream = await getMergedTelegramStream(file.telegramMessageIds);
            } else if ((file.status === 'IN_DRIVE' || file.status === 'ARCHIVING') && file.gDriveFileId) {
                sourceStream = await gDriveService.getFileStream(file.gDriveFileId);
            } else { continue; }
            sourceStream.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve); writer.on('error', reject); sourceStream.on('error', reject);
            });
        }
        const zipFileName = `${files[0].originalName.split('.')[0] || 'batch'}.zip`;
        const zipFilePath = path.join(tempDir, zipFileName);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(output);
        archive.directory(tempDir, false);
        await archive.finalize();
        await new Promise((resolve, reject) => {
            output.on('close', resolve); archive.on('error', reject);
        });
        const zipStats = await fs.promises.stat(zipFilePath);
        res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Length', zipStats.size);
        const zipStream = fs.createReadStream(zipFilePath);
        zipStream.pipe(res);
    } catch (error) {
        next(error);
    } finally { fs.promises.rm(tempDir, { recursive: true, force: true }); }
};
async function getMergedTelegramStream(telegramMessageIds) {
    const passThrough = new PassThrough();
    (async () => {
        for (const messageId of telegramMessageIds) {
            try {
                const chunkStream = await telegramService.getFileStream(messageId);
                await new Promise((resolve, reject) => {
                    chunkStream.pipe(passThrough, { end: false });
                    chunkStream.on('end', resolve);
                    chunkStream.on('error', reject);
                });
            } catch (err) { passThrough.emit('error', err); break; }
        }
        passThrough.end();
    })().catch(err => passThrough.emit('error', err));
    return passThrough;
}
exports.getGroupMetadata = async (req, res, next) => {
    try {
        const files = await File.find({ groupId: req.params.groupId }).select('originalName size uniqueId');
        if (!files || files.length === 0) { return res.status(404).json({ message: 'File group not found.' }); }
        res.json(files);
    } catch (error) { next(error); }
};
exports.getMyFiles = async (req, res, next) => {
    try {
        const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 }).select('originalName size uniqueId createdAt groupId');
        res.json(files);
    } catch (error) { next(error); }
};