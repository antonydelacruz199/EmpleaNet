import { createApp } from "./app.js";
import { env } from "./config/env.js";

const port = env.PORT;

createApp().listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
