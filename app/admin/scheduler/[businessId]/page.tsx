import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../src/db/prisma";
import SchedulerPage from "../../../../src/pageTemplates/SchedulerPage/SchedulerPage";

export default async function Page({ params }: { params: Promise<{ businessId: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { profile: { select: { role: true } } },
  });

  if (dbUser?.profile?.role !== "admin") redirect("/");

  const { businessId } = await params;

  const [business, allBusinesses, technicians, leads, appointments] = await Promise.all([
    prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true },
    }),
    prisma.business.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.technician.findMany({
      where: { businessId, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.lead.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        status: true,
      },
    }),
    prisma.appointment.findMany({
      where: { businessId },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
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
      },
    }),
  ]);

  if (!business) redirect("/admin");

  return (
    <SchedulerPage
      business={business}
      allBusinesses={allBusinesses}
      technicians={technicians.map((technician) => ({
        ...technician,
        phone: technician.phone ?? null,
        email: technician.email ?? null,
        color: technician.color ?? null,
        createdAt: technician.createdAt.toISOString(),
        updatedAt: technician.updatedAt.toISOString(),
      }))}
      leads={leads.map((lead) => ({
        ...lead,
        phone: lead.phone ?? null,
        email: lead.email ?? null,
      }))}
      appointments={appointments.map((appointment) => ({
        ...appointment,
        location: appointment.location ?? null,
        notes: appointment.notes ?? null,
        technicianId: appointment.technicianId ?? null,
        leadId: appointment.leadId ?? null,
        scheduledFor: appointment.scheduledFor.toISOString(),
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      }))}
    />
  );
}
