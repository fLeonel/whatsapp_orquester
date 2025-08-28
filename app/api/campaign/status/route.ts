import { NextResponse } from "next/server";
import { getCampaignStatus } from "@/aplication/services/campaingService";
import { Campaign } from "@/domain/campain";

export async function GET() {
  const status: Campaign | null = getCampaignStatus();

  if (!status) {
    return NextResponse.json({ status: "Waiting" });
  }

  return NextResponse.json(status);
}
