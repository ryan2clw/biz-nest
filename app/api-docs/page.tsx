import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../src/db/prisma";
import ApiDocsPage from "../../src/pageTemplates/ApiDocsPage/ApiDocsPage";

export default async function Page() {
  const session = await auth();

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

  return <ApiDocsPage />;
}
