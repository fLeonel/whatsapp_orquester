export type Contact = {
  phone: string;
  message: string;
};

export type CampaignParams = {
  dailyLimit: number;
  messagesPerCycle: number;
  cooldownBetweenMessagesMs: number;
  restAfterCycleMs: number;
};

export type InstanceWorker = {
  id: string;
  queue: Contact[];
  sent: number;
  status: "Idle" | "Running" | "Resting" | "Finished";
};

export type Campaign = {
  id: string;
  contacts: Contact[];
  params: CampaignParams;
  status: "Waiting" | "Running" | "Finished";
  instances: InstanceWorker[];
  startedAt?: Date;
  finishedAt?: Date;
};

export function distributeContacts(
  contacts: Contact[],
  instanceIds: string[],
): InstanceWorker[] {
  if (contacts.length < instanceIds.length) {
    instanceIds = instanceIds.slice(0, contacts.length);
  }

  const queues: Record<string, Contact[]> = {};
  instanceIds.forEach((id) => (queues[id] = []));

  contacts.forEach((c, idx) => {
    const inst = instanceIds[idx % instanceIds.length];
    queues[inst].push(c);
  });

  return instanceIds.map((id) => ({
    id,
    queue: queues[id],
    sent: 0,
    status: "Idle",
  }));
}

export function calculateMessagesPerHour(params: CampaignParams): number {
  const cycleMessages = params.messagesPerCycle;
  const cycleSendTimeMs =
    params.messagesPerCycle * params.cooldownBetweenMessagesMs;
  const fullCycleTimeMs = cycleSendTimeMs + params.restAfterCycleMs;
  const cyclesPerHour = (60 * 60 * 1000) / fullCycleTimeMs;
  return Math.floor(cyclesPerHour * cycleMessages);
}
