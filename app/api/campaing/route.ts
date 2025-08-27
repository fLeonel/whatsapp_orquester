import { NextResponse } from "next/server";
import { startCampaign } from "@/application/services/campaignService";

export async function POST(req: Request) {
  try {
    const { phones, params } = await req.json();

    if (!phones || !params) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    startCampaign(phones, params);

    return NextResponse.json({ status: "campaign started" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
