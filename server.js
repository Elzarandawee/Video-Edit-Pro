const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(bodyParser.json());

app.use(express.static('public'));

// Upload endpoint
app.post('/upload', upload.single('video'), (req, res) => {
    const inputFilePath = req.file.path;
    const outputFilePath = `processed/${req.file.filename}.mp4`;

    ffmpeg(inputFilePath)
        .output(outputFilePath)
        .on('end', () => {
            res.download(outputFilePath, (err) => {
                if (err) throw err;
                // Clean up files
                fs.unlink(inputFilePath, () => {});
                fs.unlink(outputFilePath, () => {});
            });
        })
        .on('error', (err) => {
            console.error(err);
            res.status(500).send('Error processing video');
        })
        .run();
});

// Process video endpoint
app.post('/process-video', (req, res) => {
    const { url, format } = req.body;
    const outputFilePath = `processed/video.${format}`;

    ffmpeg(url)
        .output(outputFilePath)
        .on('end', () => {
            res.download(outputFilePath, (err) => {
                if (err) throw err;
                // Clean up files
                fs.unlink(outputFilePath, () =>
