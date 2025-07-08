// // server/src/models/File.js
// const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid');

// const FileSchema = new mongoose.Schema({
//   originalName: { type: String, required: true },
//   uniqueId: { type: String, default: () => uuidv4().split('-')[0], unique: true }, // Short, unique ID
//   size: { type: Number, required: true },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//   status: {
//     type: String,
//     enum: ['UPLOADING_TO_DRIVE', 'IN_DRIVE', 'ARCHIVING', 'IN_TELEGRAM', 'ERROR'],
//     default: 'UPLOADING_TO_DRIVE',
//   },
//   gDriveFileId: { type: String, default: null },
// // MODIFIED: This will now hold the chunk message IDs
//   telegramMessageIds: [{ type: Number }], 
// }, { timestamps: true });

// module.exports = mongoose.model('File', FileSchema);

// const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid');

// const FileSchema = new mongoose.Schema({
//   originalName: { type: String, required: true },
//   uniqueId: { type: String, default: () => uuidv4().split('-')[0], unique: true },
//   size: { type: Number, required: true },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//   groupId: { type: String, default: null, index: true }, // <-- ADDED
//   status: {
//     type: String,
//     enum: ['UPLOADING_TO_DRIVE', 'IN_DRIVE', 'ARCHIVING', 'IN_TELEGRAM', 'ERROR'],
//     default: 'UPLOADING_TO_DRIVE',
//   },
//   gDriveFileId: { type: String, default: null },
//   telegramMessageIds: [{ type: Number }],
// }, { timestamps: true });

// module.exports = mongoose.model('File', FileSchema);

// // File.js
// const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid');

// const FileSchema = new mongoose.Schema({
//   originalName: { type: String, required: true },
//   uniqueId: { type: String, default: () => uuidv4().split('-')[0], unique: true },
//   size: { type: Number, required: true },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//   groupId: { type: String, required: true, index: true },
//   groupTotal: { type: Number, default: 1 },
//   // ADD a timestamp for when the file was successfully uploaded to Drive
//   driveUploadTimestamp: { type: Date, default: null },
//   status: {
//     type: String,
//     enum: ['UPLOADING_TO_DRIVE', 'IN_DRIVE', 'ARCHIVING', 'IN_TELEGRAM', 'ERROR'],
//     default: 'UPLOADING_TO_DRIVE',
//   },
//   gDriveFileId: { type: String, default: null },
//   telegramMessageIds: [{ type: Number }],
// }, { timestamps: true });

// module.exports = mongoose.model('File', FileSchema);


// // server/src/models/File.js
// const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid');

// const FileSchema = new mongoose.Schema({
//   originalName: { type: String, required: true },
//   uniqueId: { type: String, default: () => uuidv4().split('-')[0], unique: true },
//   size: { type: Number, required: true },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//   groupId: { type: String, required: true, index: true },
//   groupTotal: { type: Number, default: 1 },
//   driveUploadTimestamp: { type: Date, default: null },
//   status: {
//     type: String,
//     enum: ['UPLOADING_TO_DRIVE', 'IN_DRIVE', 'ARCHIVING', 'IN_TELEGRAM', 'ERROR'],
//     default: 'UPLOADING_TO_DRIVE',
//   },
//   gDriveFileId: { type: String, default: null },
//   telegramMessageIds: [{ type: Number }],
// }, { timestamps: true });

// module.exports = mongoose.model('File', FileSchema);

// // server/src/models/File.js
// const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid');

// const FileSchema = new mongoose.Schema({
//     originalName: { type: String, required: true },
//     uniqueId: { type: String, default: () => uuidv4().split('-')[0], unique: true },
//     size: { type: Number, required: true },
//     owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//     groupId: { type: String, required: true, index: true },
//     groupTotal: { type: Number, default: 1 },
//     driveUploadTimestamp: { type: Date, default: null },
//     status: {
//         type: String,
//         enum: ['UPLOADING_TO_DRIVE', 'IN_DRIVE', 'ARCHIVING', 'IN_TELEGRAM', 'ERROR'],
//         default: 'UPLOADING_TO_DRIVE',
//     },
//     gDriveFileId: { type: String, default: null },
    
//     // --- NEW SCHEMA FIELD FOR LARGE FILE CHUNKING ---
//     // This structured array will hold the ordered chunks for each file.
//     telegramChunks: [{
//         order: { type: Number, required: true },
//         messageId: { type: Number, required: true },
//         size: { type: Number, required: true },
//     }],
    
//     // --- OLD FIELD (REMOVED) ---
//     // telegramMessageIds: [{ type: Number }],

// }, { timestamps: true });

// module.exports = mongoose.model('File', FileSchema);


// // server/src/models/File.js
// const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid');

// const FileSchema = new mongoose.Schema({
//     originalName: { type: String, required: true },
//     uniqueId: { type: String, default: () => uuidv4().split('-')[0], unique: true },
//     size: { type: Number, required: true },
//     owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//     groupId: { type: String, required: true, index: true },
//     groupTotal: { type: Number, default: 1 },
//     driveUploadTimestamp: { type: Date, default: null },
//     status: {
//         type: String,
//         enum: ['UPLOADING_TO_DRIVE', 'IN_DRIVE', 'ARCHIVING', 'IN_TELEGRAM', 'ERROR'],
//         default: 'UPLOADING_TO_DRIVE',
//     },
//     gDriveFileId: { type: String, default: null },
    
//     telegramChunks: [{
//         order: { type: Number, required: true },
//         messageId: { type: Number, required: true },
//         size: { type: Number, required: true },
//     }],
    
//     // --- NEW FIELD FOR THUMBNAILS ---
//     thumbnail: { type: Buffer, default: null },

// }, { timestamps: true });

// module.exports = mongoose.model('File', FileSchema);


// // server/src/models/File.js
// const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid');

// const FileSchema = new mongoose.Schema({
//     originalName: { type: String, required: true },
//     uniqueId: { type: String, default: () => uuidv4().split('-')[0], unique: true },
//     size: { type: Number, required: true },
//     owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//     groupId: { type: String, required: true, index: true },
//     groupTotal: { type: Number, default: 1 },
//     driveUploadTimestamp: { type: Date, default: null },
//     status: {
//         type: String,
//         // --- FIX: Reverted to the original, simpler list of statuses ---
//         enum: ['IN_DRIVE', 'ARCHIVING', 'IN_TELEGRAM', 'ERROR'],
//         default: 'IN_DRIVE',
//     },
//     gDriveFileId: { type: String, default: null },
//     archiveAttempts: { type: Number, default: 0 },
//     telegramChunks: [{
//         order: { type: Number, required: true },
//         messageId: { type: Number, required: true },
//         size: { type: Number, required: true },
//         fileId: { type: String, required: true },
//     }],
//     thumbnail: { type: Buffer, default: null },
// }, { timestamps: true });

// module.exports = mongoose.model('File', FileSchema);


// server/src/models/File.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const FileSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    uniqueId: { type: String, default: () => uuidv4().split('-')[0], unique: true },
    size: { type: Number, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    groupId: { type: String, required: true, index: true },
    groupTotal: { type: Number, default: 1 },
    driveUploadTimestamp: { type: Date, default: null },
    status: {
        type: String,
        enum: ['IN_DRIVE', 'ARCHIVING', 'IN_TELEGRAM', 'ERROR'],
        default: 'IN_DRIVE',
    },
    gDriveFileId: { type: String, default: null },
    archiveAttempts: { type: Number, default: 0 },
    telegramChunks: [{
        order: { type: Number, required: true },
        messageId: { type: Number, required: true },
        size: { type: Number, required: true },
        fileId: { type: String, required: true },
        // --- NEW FIELD ---
        // Stores the index from the TELEGRAM_BOT_TOKENS array.
        botTokenIndex: { type: Number, required: true },
    }],
    thumbnail: { type: Buffer, default: null },
}, { timestamps: true });

module.exports = mongoose.model('File', FileSchema);