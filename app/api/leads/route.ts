import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../src/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, name, email, phone, message, pagePath } = body;

    if (!businessId || !name?.trim()) {
      return NextResponse.json({ error: "businessId and name are required" }, { status: 400 });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true } });
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const lead = await prisma.lead.create({
      data: {
        businessId,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        message: message?.trim() || null,
        pagePath: pagePath || null,
        source: "web",
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
