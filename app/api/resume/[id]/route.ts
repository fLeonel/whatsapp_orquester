import { NextResponse } from "next/server";
import { getFinishedCampaignById } from "@/application/services/campaignService";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params; // 👈 ahora se hace await
  const campaign = getFinishedCampaignById(id);

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(campaign);
}
