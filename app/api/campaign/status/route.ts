import { NextResponse } from "next/server";
import { getCampaignStatus } from "@/application/services/campaignService";
import { Campaign } from "@/domain/campaign";

export async function GET() {
  const status: Campaign | null = getCampaignStatus();

  if (!status) {
    return NextResponse.json({ status: "Waiting" });
  }

  return NextResponse.json(status);
}
