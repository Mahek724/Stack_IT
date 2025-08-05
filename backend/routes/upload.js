const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const crypto = require('crypto');
const path = require('path');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload an image
router.post('/upload-image', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });

  const filename = crypto.randomBytes(16).toString('hex') + path.extname(req.file.originalname);
  const uploadStream = bucket.openUploadStream(filename, {
    contentType: req.file.mimetype,
    metadata: {
      originalname: req.file.originalname
    }
  });

  uploadStream.end(req.file.buffer);
  uploadStream.on('finish', () => {
  console.log('✅ File saved with ID:', uploadStream.id);

  const host = req.protocol + '://' + req.get('host');
  res.json({ 
    data: { 
      link: `${host}/api/uploads/${uploadStream.id}` 
    } 
  });
});


  uploadStream.on('error', (err) => {
    console.error('GridFS upload error:', err);
    res.status(500).json({ error: 'Error uploading file' });
  });
});

// Get uploaded file by ID
router.get('/uploads/:id', async (req, res) => {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });

  let fileDoc;
  let _id;

  try {
    _id = new mongoose.Types.ObjectId(req.params.id);
    fileDoc = await mongoose.connection.db.collection('uploads.files').findOne({ _id });
  } catch {
    fileDoc = await mongoose.connection.db.collection('uploads.files').findOne({ filename: req.params.id });
  }

  if (!fileDoc) {
    return res.status(404).send('File not found');
  }
  res.set('Content-Type', fileDoc.contentType || 'application/octet-stream');

  const downloadStream = bucket.openDownloadStream(fileDoc._id);
  downloadStream.pipe(res);
});

module.exports = router;