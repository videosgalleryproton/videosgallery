require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error MongoDB:", err));

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  thumbnail: String,
  category: String,
  active: Boolean,
  createdAt: { type: Date, default: Date.now },
});
const Video = mongoose.model("Video", videoSchema);

app.get("/api/videos", async (req, res) => {
  const videos = await Video.find().sort({ createdAt: -1 });
  res.json(videos);
});

app.post("/api/videos", async (req, res) => {
  const { title, description, url, thumbnail, category, active } = req.body;
  try {
    const video = new Video({ title, description, url, thumbnail, category, active });
    await video.save();
    res.status(201).json(video);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/videos/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, url, thumbnail, category, active } = req.body;

  try {
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: "Video no encontrado" });
    }

    // Actualiza solo los campos que llegan en el body
    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (url !== undefined) video.url = url;
    if (thumbnail !== undefined) video.thumbnail = thumbnail;
    if (category !== undefined) video.category = category;
    if (active !== undefined) video.active = active;

    await video.save();
    res.json(video);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
