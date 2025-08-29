const BASE_URL = "http://18.206.157.252:3001";

const INSTANCES: Record<string, string> = {
  instancia1: "45344290",
  instancia2: "46476454",
  instancia3: "59763179",
  instancia4: "59763180",
  instancia5: "59520788",
  instancia6: "59449864",
  instancia7: "59763191",
  instancia8: "59449865",
  instancia9: "59578962",
  instancia10: "59578980",
  instancia11: "59596603",
  instancia12: "59596603",
  instancia13: "59596618",
  instancia14: "59596616",
  instancia15: "59596587",
};

export async function sendMessage(
  instanceId: string,
  phone: string,
  message: string,
) {
  try {
    const key = INSTANCES[instanceId];
    if (!key) throw new Error(`No existe instancia con id: ${instanceId}`);

    const url = `${BASE_URL}/message/text?key=${key}`;

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
      throw new Error(`Error en API WhatsApp: ${res.status}`);
    }

    const data = await res.json();
    console.log(`📩 [${instanceId}] Enviado a ${phone}:`, data);
    return data;
  } catch (err) {
    console.error(`Error enviando a ${phone}:`, err);
    throw err;
  }
}
