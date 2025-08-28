const BASE_URL = "http://18.206.157.252:3001";
const INSTANCE_KEY = "45344290";

export async function sendMessage(
  instanceId: string,
  phone: string,
  message: string,
) {
  try {
    const url = `${BASE_URL}/message/text?key=${INSTANCE_KEY}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        id: phone,
        message,
      }),
    });

    if (!res.ok) {
      throw new Error(`❌ Error en API WhatsApp: ${res.status}`);
    }

    const data = await res.json();
    console.log(`📩 [${instanceId}] Enviado a ${phone}:`, data);
    return data;
  } catch (err) {
    console.error(`Error enviando a ${phone}:`, err);
    throw err;
  }
}
