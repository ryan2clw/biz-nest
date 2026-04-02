import { prisma } from '../src/db/prisma';
import HomePage from '../src/pageTemplates/HomePage/HomePage';

export const metadata = {
  title: 'Biz Nest | Build Your Business Nest Egg',
  description: 'Empower your entrepreneurial journey with Biz Nest. Create, manage, and grow your business apps to build your financial future and business nest egg.'
};

export default async function Home() {
  const page = await prisma.page.findFirst({
    where: { published: true },
    orderBy: { updatedAt: 'desc' },
    select: {
      content: true,
      business: { select: { id: true } },
    },
  });

  const content = page?.content as {
    carouselItems?: string[];
    ctaText?: string;
    ctaUrl?: string;
    heroImageUrl?: string;
  } | null;

  return (
    <HomePage
      carouselItems={content?.carouselItems}
      ctaText={content?.ctaText}
      ctaUrl={content?.ctaUrl}
      heroImageUrl={content?.heroImageUrl}
      businessId={page?.business?.id}
    />
  );
} 