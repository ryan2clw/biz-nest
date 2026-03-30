import { getServerSession } from "next-auth";
import { authOptions } from "../../../src/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "../../../src/db/prisma";
import CreateBusinessPage from "../../../src/pageTemplates/CreateBusinessPage/CreateBusinessPage";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { profile: { select: { role: true } } },
  });

  if (dbUser?.profile?.role !== "admin") {
    redirect("/");
  }

  const rawBusinesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, logoUrl: true, createdAt: true },
  });

  const businesses = rawBusinesses.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
  }));

  return <CreateBusinessPage initialBusinesses={businesses} />;
}
