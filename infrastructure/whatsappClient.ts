// Que onda Hector, aca vamos a configurar la conexion con tu API
export async function sendMessage(
  instanceId: string,
  phone: string,
  message: string,
) {
  console.log(`📩 [${instanceId}] Enviando a ${phone}: ${message}`);
  await new Promise((r) => setTimeout(r, 500));
  return { success: true };
}
