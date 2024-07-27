# Video-Edit-Pro
Online video editor

I used a combination of several languages and technologies to create the video editing web application. Here’s a breakdown of what was used and how each part works:

### Languages and Technologies

1. **HTML**:
   - **Purpose**: HTML (HyperText Markup Language) is used to create the structure of the web page.
   - **Usage**: Defined the layout of the web page including the video player, input fields, buttons, and PayPal donation form.
   - **Example**:
     ```html
     <input type="file" id="upload" accept="video/*">
     <video id="video" controls></video>
     ```

2. **CSS**:
   - **Purpose**: CSS (Cascading Style Sheets) is used to style the HTML elements.
   - **Usage**: Provided basic styling for the page layout, buttons, and video player.
   - **Example**:
     ```css
     body {
         font-family: Arial, sans-serif;
         display: flex;
         flex-direction: column;
         align-items: center;
         padding: 20px;
     }
     ```

3. **JavaScript**:
   - **Purpose**: JavaScript is used to add interactivity and dynamic behavior to the web page.
   - **Usage**: Handled video file uploads, applying filters, background removal, and making API requests to the server.
   - **Libraries**: 
     - **ffmpeg.js**: A JavaScript port of FFmpeg for video processing.
     - **TensorFlow.js and Body-Pix**: For background removal using machine learning.
   - **Example**:
     ```javascript
     async function removeBackground() {
         const net = await bodyPix.load();
         const segmentation = await net.segmentPerson(videoElement);
         const canvas = document.createElement('canvas');
         const ctx = canvas.getContext('2d');

         canvas.width = videoElement.videoWidth;
         canvas.height = videoElement.videoHeight;
         ctx.drawImage(videoElement, 0, 0);

         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
         const { data: pixels } = imageData;

         for (let i = 0; i < pixels.length; i += 4) {
             if (!segmentation.data[i / 4]) {
                 pixels[i + 3] = 0; // Set alpha to 0
             }
         }

         ctx.putImageData(imageData, 0, 0);
         videoElement.src = canvas.toDataURL();
         alert('Background removed');
     }
     ```

4. **Node.js**:
   - **Purpose**: Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine, used to build the back-end server.
   - **Usage**: Handled video file uploads, processing videos using FFmpeg, and serving the HTML file.
   - **Modules**:
     - **Express**: For setting up the server and handling routes.
     - **Multer**: For handling file uploads.
     - **Fluent-ffmpeg**: For processing videos with FFmpeg.
     - **Body-parser**: For parsing incoming request bodies.
     - **Cors**: For handling Cross-Origin Resource Sharing.
   - **Example**:
     ```javascript
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

     const PORT = process.env.PORT || 3000;
     app.listen(PORT, () => {
         console.log(`Server is running on port ${PORT}`);
     });
     ```

### Explanation

1. **Front-End Setup**:
   - The HTML file (`index.html`) defines the structure of the web page, including input fields for uploading videos or entering URLs, a video element for playback, and buttons for various video processing actions.
   - CSS styles are embedded within the HTML file to style the page.
   - JavaScript functions handle user interactions, such as loading videos, applying filters, and making requests to the back-end server.

2. **Back-End Setup**:
   - The Node.js server (`server.js`) uses Express to handle HTTP requests.
   - Multer is used to handle file uploads, storing uploaded files in the `uploads` directory.
   - Fluent-ffmpeg is used to process videos, converting them to the desired format and storing the processed files in the `processed` directory.
   - The server serves static files from the `public` directory, where the `index.html` file resides.

3. **Video Processing**:
   - When a user uploads a video or enters a URL, the front-end JavaScript functions handle the input and communicate with the back-end server.
   - The server processes the video using FFmpeg, applying any requested transformations or filters.
   - The processed video is sent back to the user for download.

4. **Machine Learning Integration**:
   - TensorFlow.js and the Body-Pix model are used to remove the background from videos.
   - The segmentation is performed on the client-side, modifying the video element's canvas to remove the background.

This combination of technologies allows for a powerful and interactive web application for video editing.
