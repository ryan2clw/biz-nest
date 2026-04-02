import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../../src/db/prisma";
import PageEditorPage from "../../../../src/pageTemplates/PageEditorPage/PageEditorPage";

export default async function Page({ params }: { params: Promise<{ businessId: string }> }) {
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

  const { businessId } = await params;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true, slug: true },
  });

  if (!business) redirect("/admin");

  const page = await prisma.page.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageEditorPage
      business={business}
      page={page ? {
        ...page,
        content: page.content as Parameters<typeof PageEditorPage>[0]["page"] extends { content: infer C } | null ? C : never,
      } : null}
    />
  );
}
