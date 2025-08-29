import { NextResponse } from "next/server";
import {
  startCampaign,
  getCampaignStatus,
  stopCampaign,
} from "@/application/services/campaignService";
import { CampaignParams, Contact } from "@/domain/campaign";

export async function POST(req: Request) {
  const body = await req.json();
  const { contacts, params, instances } = body as {
    contacts: Contact[];
    params: CampaignParams;
    instances: string[];
  };

  if (!contacts || contacts.length === 0) {
    return NextResponse.json(
      { error: "No se enviaron contactos" },
      { status: 400 },
    );
  }

  if (!instances || instances.length === 0) {
    return NextResponse.json(
      { error: "Debes seleccionar al menos una instancia" },
      { status: 400 },
    );
  }

  const campaign = startCampaign(contacts, params, instances);

  return NextResponse.json({
    ok: true,
    message: "Campaña iniciada...",
    campaignId: campaign.id,
    instances: campaign.instances.map((i) => ({
      id: i.id,
      total: i.queue.length,
    })),
  });
}

export async function GET() {
  const status = getCampaignStatus();
  return NextResponse.json(status ?? { error: "No hay campaña activa" });
}

export async function DELETE() {
  stopCampaign();
  return NextResponse.json({ ok: true, message: "Campaña detenida." });
}
