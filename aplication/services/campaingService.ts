import { Campaign, CampaignParams } from "@/domain/campain";
import { sendMessage } from "@/infrastructure/whatsappClient";

let currentCampaign: Campaign | null = null;

export function startCampaign(phones: string[], params: CampaignParams) {
  currentCampaign = {
    id: Date.now().toString(),
    phones,
    params,
    sent: 0,
    status: "running",
  };
  runCampaign();
}

async function runCampaign() {
  if (!currentCampaign) return;
  const { phones, params } = currentCampaign;

  let index = 0;
  try {
    while (index < phones.length && currentCampaign.sent < params.dailyLimit) {
      const batch = phones.slice(index, index + params.batchSize);

      for (const phone of batch) {
        await sendMessage("instancia1", phone, params.message);
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
