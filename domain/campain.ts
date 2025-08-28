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
  status: "Waiting" | "Running" | "finished";
  instanceId?: string[];
};
