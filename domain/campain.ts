export type CampaignParams = {
  batchSize: number;
  cooldownMs: number;
  dailyLimit: number;
  message: string;
};

export type Campaign = {
  id: string;
  phones: string[];
  params: CampaignParams;
  sent: number;
  status: "idle" | "running" | "finished";
  instanceId?: string;
};
