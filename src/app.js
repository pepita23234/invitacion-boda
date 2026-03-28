const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");

const { connectDB } = require("./config/db");
const apiRoutes = require("./routes/apiRoutes");
const viewRoutes = require("./routes/viewRoutes");

const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  express.static(path.join(__dirname, "..", "public"), {
    etag: true,
    maxAge: "30d",
    immutable: true,
    setHeaders: (res, filePath) => {
      const isAudio = /\.(mp3|wav|ogg|m4a)$/i.test(filePath);
      if (isAudio) {
        res.setHeader("Cache-Control", "public, max-age=604800");
      }
    },
  })
);
app.use(apiRoutes);
app.use(viewRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Error interno del servidor" });
});

module.exports = { app, connectDB };
