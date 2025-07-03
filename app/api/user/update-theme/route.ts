import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../src/lib/authOptions';
import { prisma } from '../../../../src/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { themePreference } = await req.json();
  if (themePreference !== 'dark' && themePreference !== 'light') {
    return NextResponse.json({ error: 'Invalid themePreference' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });
    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: user.profile.id },
      data: { themePreference },
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 