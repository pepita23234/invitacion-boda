require("dotenv").config();

const { app, connectDB } = require("./src/app");

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
}

bootstrap();
