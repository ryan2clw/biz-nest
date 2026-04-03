import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../src/db/prisma";
import LeadsPage from "../../../../src/pageTemplates/LeadsPage/LeadsPage";

export default async function Page({ params }: { params: Promise<{ businessId: string }> }) {
  const session = await auth();

  if (!session?.user?.email) redirect("/");

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { profile: { select: { role: true } } },
  });

  if (dbUser?.profile?.role !== "admin") redirect("/");

  const { businessId } = await params;

  const [business, allBusinesses, leads] = await Promise.all([
    prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true },
    }),
    prisma.business.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.lead.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!business) redirect("/admin");

  return <LeadsPage business={business!} allBusinesses={allBusinesses} leads={leads} />;
}
