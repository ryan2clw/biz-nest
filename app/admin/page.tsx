import { getServerSession } from "next-auth";
import { authOptions } from "../../src/lib/authOptions";
import AdminPage from "../../src/pageTemplates/AdminPage/AdminPage";
import { redirect } from "next/navigation";
import { prisma } from "../../src/lib/prisma";

export default async function Page({ searchParams }: { searchParams: { page?: string } }) {
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

  const page = parseInt(searchParams.page || "1");
  const limit = 25;
  const skip = (page - 1) * limit;

  // Get total count
  const totalUsers = await prisma.user.count();
  const totalPages = Math.ceil(totalUsers / limit);

  // Get users with profiles
  const usersWithProfiles = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      profile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          screenName: true,
          industry: true,
          userId: true,
          role: true,
        },
      },
    },
    orderBy: {
      profile: {
        lastName: 'asc',
      },
    },
    skip,
    take: limit,
  });

  // Transform users to include profile fields at the top level
  const users = usersWithProfiles.map((user) => ({
    ...user,
    emailVerified: user.emailVerified ? String(user.emailVerified) : null,
    firstName: user.profile?.firstName || null,
    lastName: user.profile?.lastName || null,
    screenName: user.profile?.screenName || null,
    industry: user.profile?.industry || null,
    profile: user.profile || null,
  }));

  return <AdminPage initialUsers={users} initialTotalPages={totalPages} />;
} 