import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '../../../../src/db/prisma';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, profile: { select: { role: true } } },
  });

  if (dbUser?.profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, logoUrl } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
  }

  let slug = slugify(name.trim());
  const existing = await prisma.business.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const business = await prisma.business.create({
    data: {
      name: name.trim(),
      slug,
      logoUrl: logoUrl || null,
      users: {
        create: {
          userId: dbUser.id,
          role: 'owner',
        },
      },
    },
  });

  return NextResponse.json({ success: true, business });
}

export async function GET() {
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

  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, slug: true, logoUrl: true, createdAt: true },
  });

  return NextResponse.json({ businesses });
}
