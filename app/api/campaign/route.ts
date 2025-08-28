import { NextResponse } from "next/server";
import { startCampaign } from "@/aplication/services/campaingService";
import { CampaignParams } from "@/domain/campain";

export async function POST(req: Request) {
  const body = await req.json();
  const { phones, params } = body as {
    phones: string[];
    params: CampaignParams;
  };

  if (!phones || phones.length === 0) {
    return NextResponse.json(
      { error: "No se enviaron teléfonos" },
      { status: 400 },
    );
  }

  startCampaign(phones, params);

  return NextResponse.json({ ok: true, message: "Campaña iniciada..." });
}
