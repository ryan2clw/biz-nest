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
  const { businessId, name, phone, email, color } = body;

  if (!businessId || !name?.trim()) {
    return NextResponse.json({ error: "Business and technician name are required" }, { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const technician = await prisma.technician.create({
    data: {
      businessId,
      name: name.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      color: color?.trim() || null,
    },
  });

  return NextResponse.json({ success: true, technician });
}
