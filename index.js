// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const helmet = require("helmet");
// const morgan = require("morgan");
// const multer = require("multer");
// const path = require("path");
// const bodyParser = require("body-parser");
// const chokidar = require("chokidar");
// const fs = require("fs");
// const cloudinary = require("cloudinary").v2;
// const cors = require('cors');

// const messageRoute = require("./routes/messages");
// const conversationRoute = require("./routes/conversations");
// const userRoute = require("./routes/users");
// const authRoute = require("./routes/auth");
// const postRoute = require("./routes/posts");
// const searchRoute = require("./routes/search");




// // Initialize dotenv for environment variables
// dotenv.config();

// // Initialize Express app
// const app = express();
// app.use(express.json());
// app.use(bodyParser.json());

// // Middleware

// app.use(helmet());
// app.use(morgan("common"));
// // Allow requests from your frontend

// const corsOptions = {
//   origin: "https://animecon-frontend.vercel.app", // Allow frontend domain
//   methods: "GET, POST, PUT, DELETE",
//   allowedHeaders: "Content-Type, Authorization, cache-control"
// };

// // Use CORS middleware
// app.use(cors(corsOptions));


// app.use((req, res, next) => {
//   res.set("Cache-Control", "no-cache, no-store, must-revalidate");
//   res.set("Pragma", "no-cache");
//   res.set("Expires", "0");
//   next();
// });

// // MongoDB connection
// async function connectDB() {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log("Connected to MongoDB");
//   } catch (error) {
//     console.error("MongoDB connection failed:", error.message);
//     process.exit(1);
//   }
// }

// // Serve static files from the upload folder
// app.use("/post", express.static(path.join(__dirname, "upload/post")));

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });




// // Automatically upload files to Cloudinary from the upload folder
// const uploadFolder = path.join(__dirname, "upload/post");
// const watcher = chokidar.watch(uploadFolder, { persistent: true });

// const validateFile = (filePath) => {
//   const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".mp4"];
//   const ext = path.extname(filePath).toLowerCase();
//   return allowedExtensions.includes(ext);
// };

// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const retryUpload = async (filePath, retries = 3) => {
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const result = await cloudinary.uploader.upload(filePath, {
//         folder: "animecon",
//       });
//       return result;
//     } catch (error) {
//       console.error(`Retrying upload (${attempt}/${retries})...`, error.message);
//       if (attempt === retries) throw error;
//       await sleep(2000); // Wait for 2 seconds before retrying
//     }
//   }
// };


// watcher.on("add", async (filePath) => {
//   console.log(`New file detected: ${filePath}`);

//   if (!validateFile(filePath)) {
//     console.error("Invalid file format. Skipping upload:", filePath);
//     return;
//   }

//   try {
//     const result = await retryUpload(filePath);
//     console.log("File uploaded to Cloudinary:", result.secure_url);

//     // Delete the file from the local folder
//     fs.unlinkSync(filePath);
//     console.log(`Local file deleted: ${filePath}`);
//   } catch (error) {
//     console.error("Error uploading to Cloudinary:", error);
//   }
// });

// app.use("/api/messages", messageRoute);
// app.use("/api/conversations", conversationRoute);
// app.use("/api/users", userRoute);
// app.use("/api/auth", authRoute);
// app.use("/api/posts", postRoute);
// app.use("/api/search", searchRoute);




// // Start the server
// const PORT = process.env.PORT || 10000;
// app.listen(PORT, async () => {
//   await connectDB();
//   console.log(`Backend Server is running on port ${PORT}`);
// });


const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const chokidar = require("chokidar");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const messageRoute = require("./routes/messages");
const conversationRoute = require("./routes/conversations");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const searchRoute = require("./routes/search");

// Initialize dotenv for environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(bodyParser.json());

// Middleware
app.use(helmet());
app.use(morgan("common"));

// ✅ Proper CORS Configuration
const corsOptions = {
  origin: "https://animecon-frontend.vercel.app", // Allow frontend domain
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization, Cache-Control",
  credentials: true, // Allow cookies/authentication
};
app.use(cors(corsOptions));

// ✅ Handle Preflight Requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://animecon-frontend.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cache-Control");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ✅ Prevent Caching Issues
app.use((req, res, next) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// ✅ MongoDB connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

// ✅ Serve static files from the upload folder
app.use("/post", express.static(path.join(__dirname, "upload/post")));

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Automatically upload files to Cloudinary
const uploadFolder = path.join(__dirname, "upload/post");
const watcher = chokidar.watch(uploadFolder, { persistent: true });

const validateFile = (filePath) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".mp4"];
  const ext = path.extname(filePath).toLowerCase();
  return allowedExtensions.includes(ext);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryUpload = async (filePath, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "animecon",
      });
      return result;
    } catch (error) {
      console.error(`Retrying upload (${attempt}/${retries})...`, error.message);
      if (attempt === retries) throw error;
      await sleep(2000); // Wait for 2 seconds before retrying
    }
  }
};

watcher.on("add", async (filePath) => {
  console.log(`New file detected: ${filePath}`);

  if (!validateFile(filePath)) {
    console.error("Invalid file format. Skipping upload:", filePath);
    return;
  }

  try {
    const result = await retryUpload(filePath);
    console.log("File uploaded to Cloudinary:", result.secure_url);

    // Delete the file from the local folder
    fs.unlinkSync(filePath);
    console.log(`Local file deleted: ${filePath}`);
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
  }
});

// ✅ API Routes
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/search", searchRoute);

// ✅ Start the Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Backend Server is running on port ${PORT}`);
});
