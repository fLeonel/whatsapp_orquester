import { NextResponse } from "next/server";
import {
  startCampaign,
  getCampaignStatus,
} from "@/aplication/services/campaingService";
import { CampaignParams } from "@/domain/campain";

export async function POST(req: Request) {
  const body = await req.json();
  const { phones, params, instances } = body as {
    phones: string[];
    params: CampaignParams;
    instances: string[];
  };

  if (!phones || phones.length === 0) {
    return NextResponse.json(
      { error: "No se enviaron teléfonos" },
      { status: 400 },
    );
  }

  if (!instances || instances.length === 0) {
    return NextResponse.json(
      { error: "Debes seleccionar al menos una instancia" },
      { status: 400 },
    );
  }

  startCampaign(phones, params, instances);

  return NextResponse.json({ ok: true, message: "Campaña iniciada..." });
}

export async function GET() {
  const status = getCampaignStatus();
  return NextResponse.json(status ?? { error: "No hay campaña activa" });
}
