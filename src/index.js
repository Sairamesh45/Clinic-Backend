import config from "./config/index.js";
import app from "./app.js";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Clinic backend up at http://localhost:${PORT}`);
});
