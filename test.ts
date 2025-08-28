import { sendMessage } from "./infrastructure/whatsappClient.js";

(async () => {
  const res = await sendMessage(
    "instancia1",
    "50230391940",
    "Hola desde Node 🚀",
  );
  console.log(res);
})();
