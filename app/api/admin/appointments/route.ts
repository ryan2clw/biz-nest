import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "../../../../src/db/prisma";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { profile: { select: { role: true } } },
  });

  if (dbUser?.profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { error: null };
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const {
    businessId,
    technicianId,
    leadId,
    title,
    customerName,
    location,
    status,
    scheduledFor,
    durationMinutes,
    notes,
  } = body;

  if (!businessId || !title?.trim() || !customerName?.trim() || !scheduledFor) {
    return NextResponse.json(
      { error: "Business, title, customer name, and schedule time are required" },
      { status: 400 }
    );
  }

  const scheduledDate = new Date(scheduledFor);
  if (Number.isNaN(scheduledDate.getTime())) {
    return NextResponse.json({ error: "Invalid schedule time" }, { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  if (technicianId) {
    const technician = await prisma.technician.findFirst({
      where: { id: technicianId, businessId },
      select: { id: true },
    });

    if (!technician) {
      return NextResponse.json({ error: "Technician not found for this business" }, { status: 404 });
    }
  }

  if (leadId) {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, businessId },
      select: { id: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found for this business" }, { status: 404 });
    }
  }

  const appointment = await prisma.appointment.create({
    data: {
      businessId,
      technicianId: technicianId || null,
      leadId: leadId || null,
      title: title.trim(),
      customerName: customerName.trim(),
      location: location?.trim() || null,
      status: status?.trim() || "scheduled",
      scheduledFor: scheduledDate,
      durationMinutes: Math.max(15, Number(durationMinutes) || 120),
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json({ success: true, appointment });
}
