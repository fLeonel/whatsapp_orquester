import { NextResponse } from "next/server";
import { getCampaignStatus } from "@/application/services/campaignService";

export async function GET() {
  const status = getCampaignStatus();
  if (!status) {
    return NextResponse.json({ error: "No campaign running" }, { status: 404 });
  }
  return NextResponse.json(status);
}
