import { prisma } from '../../src/db/prisma';
import LeadForm from '../../src/components/LeadForm/LeadForm';

export const metadata = {
  title: 'Contact Us | Biz Nest',
};

export default async function ContactPage() {
  const business = await prisma.business.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  if (!business) return null;

  return (
    <main style={{ padding: '2rem', minHeight: '100vh' }}>
      <LeadForm businessId={business.id} pagePath="/contact-us" />
    </main>
  );
}
