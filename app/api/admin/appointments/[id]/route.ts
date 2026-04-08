import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "../../../../../src/db/prisma";

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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      technician: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      lead: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  return NextResponse.json({
    appointment: {
      ...appointment,
      location: appointment.location ?? null,
      notes: appointment.notes ?? null,
      technicianId: appointment.technicianId ?? null,
      leadId: appointment.leadId ?? null,
      scheduledStart: appointment.scheduledStart.toISOString(),
      scheduledEnd: appointment.scheduledEnd.toISOString(),
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    },
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const {
    technicianId,
    leadId,
    title,
    customerName,
    location,
    status,
    scheduledStart,
    scheduledEnd,
    notes,
  } = body;

  if (!title?.trim() || !customerName?.trim() || !scheduledStart || !scheduledEnd) {
    return NextResponse.json(
      { error: "Title, customer name, start time, and end time are required" },
      { status: 400 }
    );
  }

  const existingAppointment = await prisma.appointment.findUnique({
    where: { id },
    select: { id: true, businessId: true },
  });

  if (!existingAppointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const startDate = new Date(scheduledStart);
  const endDate = new Date(scheduledEnd);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "Invalid schedule time" }, { status: 400 });
  }

  if (endDate <= startDate) {
    return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
  }

  if (technicianId) {
    const technician = await prisma.technician.findFirst({
      where: { id: technicianId, businessId: existingAppointment.businessId },
      select: { id: true },
    });

    if (!technician) {
      return NextResponse.json({ error: "Technician not found for this business" }, { status: 404 });
    }
  }

  if (leadId) {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, businessId: existingAppointment.businessId },
      select: { id: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found for this business" }, { status: 404 });
    }
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      technicianId: technicianId || null,
      leadId: leadId || null,
      title: title.trim(),
      customerName: customerName.trim(),
      location: location?.trim() || null,
      status: status?.trim() || "scheduled",
      scheduledStart: startDate,
      scheduledEnd: endDate,
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json({
    success: true,
    appointment: {
      ...appointment,
      location: appointment.location ?? null,
      notes: appointment.notes ?? null,
      technicianId: appointment.technicianId ?? null,
      leadId: appointment.leadId ?? null,
      scheduledStart: appointment.scheduledStart.toISOString(),
      scheduledEnd: appointment.scheduledEnd.toISOString(),
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    },
  });
}
