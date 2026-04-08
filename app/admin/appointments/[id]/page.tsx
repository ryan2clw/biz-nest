import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../src/db/prisma";
import EditAppointmentPage from "../../../../src/pageTemplates/EditAppointmentPage/EditAppointmentPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { profile: { select: { role: true } } },
  });

  if (dbUser?.profile?.role !== "admin") redirect("/");

  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      business: {
        select: {
          id: true,
          name: true,
        },
      },
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
  });

  if (!appointment) redirect("/admin");

  const [technicians, leads] = await Promise.all([
    prisma.technician.findMany({
      where: { businessId: appointment.businessId, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.lead.findMany({
      where: { businessId: appointment.businessId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        status: true,
      },
    }),
  ]);

  return (
    <EditAppointmentPage
      business={{
        id: appointment.business.id,
        name: appointment.business.name,
      }}
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
      appointment={{
        ...appointment,
        location: appointment.location ?? null,
        notes: appointment.notes ?? null,
        technicianId: appointment.technicianId ?? null,
        leadId: appointment.leadId ?? null,
        scheduledStart: appointment.scheduledStart.toISOString(),
        scheduledEnd: appointment.scheduledEnd.toISOString(),
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      }}
    />
  );
}
