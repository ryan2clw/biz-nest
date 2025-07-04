import { getServerSession } from "next-auth";
import { authOptions } from "../../../../src/lib/authOptions";
import UserDetailPage from "../../../../src/pageTemplates/UserDetailPage/UserDetailPage";
import { redirect } from "next/navigation";
import { prisma } from "../../../../src/lib/prisma";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  // Fetch the user's role from the database
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { profile: { select: { role: true } } },
  });
  if (dbUser?.profile?.role !== "admin") {
    redirect("/");
  }

  const { id } = await params;

  return <UserDetailPage id={id} />;
} 