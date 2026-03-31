import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '../../../../../src/db/prisma';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { profile: { select: { role: true } } },
  });

  if (dbUser?.profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const business = await prisma.business.findUnique({ where: { id } });
  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  await prisma.business.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
