import fs from "fs";
import path from "path";
import {
  Campaign,
  CampaignParams,
  Contact,
  distributeContacts,
  InstanceWorker,
} from "@/domain/campaign";
import { sendMessage } from "@/infrastructure/whatsappClient";

let currentCampaign: Campaign | null = null;
let finishedCampaigns: Campaign[] = [];

// 📂 Ruta para guardar campañas en disco
const STORAGE_PATH = path.join(process.cwd(), "storage", "campaigns.json");

function saveCampaigns() {
  fs.mkdirSync(path.dirname(STORAGE_PATH), { recursive: true });
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(finishedCampaigns, null, 2));
}

function loadCampaigns() {
  if (fs.existsSync(STORAGE_PATH)) {
    finishedCampaigns = JSON.parse(fs.readFileSync(STORAGE_PATH, "utf-8"));
  }
}
loadCampaigns();

export function startCampaign(
  contacts: Contact[],
  params: CampaignParams,
  instanceIds: string[],
): Campaign {
  const workers = distributeContacts(contacts, instanceIds);

  currentCampaign = {
    id: Date.now().toString(),
    contacts,
    params,
    status: "Running",
    instances: workers,
    startedAt: new Date(),
  };

  workers.forEach((w) => runWorker(w, params));
  return currentCampaign;
}

async function runWorker(worker: InstanceWorker, params: CampaignParams) {
  let index = 0;

  while (index < worker.queue.length) {
    worker.status = "Running";

    for (let i = 0; i < params.messagesPerCycle; i++) {
      if (index >= worker.queue.length) break;

      const { phone, message } = worker.queue[index];

      try {
        await sendMessage(worker.id, phone, message);
        worker.sent++;
      } catch (err) {
        console.error(
          `Error enviando con instancia ${worker.id} -> ${phone}`,
          err,
        );
      }

      index++;
      await delay(params.cooldownBetweenMessagesMs);
    }

    if (index < worker.queue.length) {
      worker.status = "Resting";
      await delay(params.restAfterCycleMs);
    }
  }

  worker.status = "Finished";

  // 📌 Cuando todos terminan → marcamos campaña como Finished y la guardamos
  if (currentCampaign?.instances.every((w) => w.status === "Finished")) {
    currentCampaign.status = "Finished";
    currentCampaign.finishedAt = new Date();

    finishedCampaigns.push(currentCampaign);
    saveCampaigns();
  }
}

export function getCampaignStatus(): Campaign | null {
  return currentCampaign;
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export function stopCampaign() {
  if (currentCampaign) {
    currentCampaign.status = "Finished";
    currentCampaign.finishedAt = new Date();
    finishedCampaigns.push(currentCampaign);
    saveCampaigns();
  }
  currentCampaign = null;
}

// 📌 Nuevas funciones para /resume
export function getFinishedCampaigns(): Campaign[] {
  return finishedCampaigns;
}

export function getFinishedCampaignById(id: string): Campaign | undefined {
  return finishedCampaigns.find((c) => c.id === id);
}
