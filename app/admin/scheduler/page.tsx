import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../src/db/prisma";

export default async function Page() {
  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { profile: { select: { role: true } } },
  });

  if (dbUser?.profile?.role !== "admin") redirect("/");

  const business = await prisma.business.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!business) redirect("/admin");

  redirect(`/admin/scheduler/${business.id}`);
}
