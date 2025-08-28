import { Campaign, CampaignParams } from "@/domain/campain";
import { sendMessage } from "@/infrastructure/whatsappClient";

let currentCampaign: Campaign | null = null;

export function startCampaign(
  phones: string[],
  params: CampaignParams,
  instances: string[],
) {
  currentCampaign = {
    id: Date.now().toString(),
    phones,
    params,
    sent: 0,
    status: "Running",
    instances,
  };

  runCampaign();
}

async function runCampaign() {
  if (!currentCampaign) return;
  const { phones, params, instances } = currentCampaign;

  if (!instances || instances.length === 0) {
    console.error("No se recibieron instancias. Campaña cancelada.");
    return;
  }

  let index = 0;
  try {
    while (index < phones.length && currentCampaign.sent < params.dailyLimit) {
      const batch = phones.slice(index, index + params.batchSize);

      for (const phone of batch) {
        for (const instance of instances) {
          await sendMessage(instance, phone, params.message);
        }
        currentCampaign.sent++;
      }

      index += params.batchSize;
      await new Promise((r) => setTimeout(r, params.cooldownMs));
    }

    currentCampaign.status = "finished";
  } catch (err) {
    console.error("Error en campaña:", err);
    currentCampaign.status = "finished";
  }
}

export function getCampaignStatus(): Campaign | null {
  return currentCampaign;
}
