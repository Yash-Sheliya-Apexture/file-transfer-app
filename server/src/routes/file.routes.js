// // server/src/routes/file.routes.js
// const express = require('express');
// const { uploadFile, downloadFile, getMyFiles,getFileMetadata  } = require('../controllers/file.controller');
// const { protect } = require('../middleware/auth.middleware');
// const router = express.Router();

// // Middleware to make 'protect' optional for upload.
// // This allows both guests and logged-in users to upload.
// const optionalProtect = (req, res, next) => {
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     // If a token is provided, verify it.
//     return protect(req, res, next);
//   }
//   // If no token, just proceed.
//   next();
// };

// // POST /api/files/upload - Upload a file (now without multer middleware)
// router.post('/upload', optionalProtect, uploadFile);

// // Add this new route. It should be public, so no `protect` middleware.
// // It's good practice to place it before the main download route.
// router.get('/meta/:uniqueId', getFileMetadata);

// // GET /api/files/download/:uniqueId - Download a file
// router.get('/download/:uniqueId', downloadFile);

// // GET /api/files/my-files - Get history for logged-in user
// router.get('/my-files', protect, getMyFiles);

// module.exports = router;


// // server/src/routes/file.routes.js
// const express = require('express');
// const { 
//     uploadFile, 
//     downloadFile, 
//     getMyFiles, 
//     getGroupMetadata, 
//     downloadGroupAsZip 
// } = require('../controllers/file.controller');
// const { protect } = require('../middleware/auth.middleware');
// const router = express.Router();

// const optionalProtect = (req, res, next) => {
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         return protect(req, res, next);
//     }
//     next();
// };

// // POST /api/files/upload - Upload a file
// router.post('/upload', optionalProtect, uploadFile);

// // GET /api/files/group-meta/:groupId - Get metadata for a whole group of files
// router.get('/group-meta/:groupId', getGroupMetadata);

// // GET /api/files/download/:uniqueId - Download a single file
// router.get('/download/:uniqueId', downloadFile);

// // GET /api/files/download-zip/:groupId - Download a whole group as a ZIP
// router.get('/download-zip/:groupId', downloadGroupAsZip);

// // GET /api/files/my-files - Get history for logged-in user
// router.get('/my-files', protect, getMyFiles);

// // This old metadata route is no longer needed with the new group logic
// // router.get('/meta/:uniqueId', getFileMetadata);

// module.exports = router;

// server/src/routes/file.routes.js
const express = require('express');
const { 
    initiateUpload,
    uploadFile, 
    downloadFile, 
    getMyFiles, 
    getDownloadInfo, // <-- NEW
    getGroupMetadata, 
    // downloadGroupAsZip 
} = require('../controllers/file.controller');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

const optionalProtect = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return protect(req, res, next);
    }
    next();
};

// Step 1: Client gets a direct upload URL.
router.post('/initiate-upload', optionalProtect, express.json(), initiateUpload);

// Step 3: Client confirms the upload is complete.
router.post('/upload', optionalProtect, express.json(), uploadFile);

// The rest of the routes are unchanged
router.get('/group-meta/:groupId', getGroupMetadata);
router.get('/download/:uniqueId', downloadFile);
// router.get('/download-zip/:groupId', downloadGroupAsZip);
router.get('/my-files', protect, getMyFiles);

module.exports = router;