const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect("mongodb://localhost:27017/bookmarks", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const bookmarkSchema = new mongoose.Schema({
  url: String,
  date: String,
  notes: String,
  tags: String,
});

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

app.get("/bookmarks", async (req, res) => {
  const bookmarks = await Bookmark.find();
  res.json(bookmarks);
});

app.post("/bookmarks", async (req, res) => {
  const newBookmark = new Bookmark(req.body);
  await newBookmark.save();
  res.json(newBookmark);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));