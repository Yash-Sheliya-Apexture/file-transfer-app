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


const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const FileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  uniqueId: { type: String, default: () => uuidv4().split('-')[0], unique: true },
  size: { type: Number, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  groupId: { type: String, required: true, index: true },
  groupTotal: { type: Number, default: 1 },
  // ADD a timestamp for when the file was successfully uploaded to Drive
  driveUploadTimestamp: { type: Date, default: null },
  status: {
    type: String,
    enum: ['UPLOADING_TO_DRIVE', 'IN_DRIVE', 'ARCHIVING', 'IN_TELEGRAM', 'ERROR'],
    default: 'UPLOADING_TO_DRIVE',
  },
  gDriveFileId: { type: String, default: null },
  telegramMessageIds: [{ type: Number }],
}, { timestamps: true });

module.exports = mongoose.model('File', FileSchema);