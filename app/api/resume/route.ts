import { NextResponse } from "next/server";
import { getFinishedCampaigns } from "../../../application/services/campaignService";

export async function GET() {
  const campaigns = getFinishedCampaigns();
  return NextResponse.json(campaigns);
}
