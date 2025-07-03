import { prisma } from "../src/lib/prisma";

// Example industry-based order item templates
const industryOrderTemplates: Record<string, { description: string; type: string; unitPrice: number; quantity: number }[]> = {
  Education: [
    { description: "Introduction to Algorithms", type: "book", unitPrice: 20, quantity: 1 },
    { description: "Mathematics Workbook", type: "book", unitPrice: 15, quantity: 2 },
  ],
  Technology: [
    { description: "Wireless Mouse", type: "hardware", unitPrice: 25, quantity: 1 },
    { description: "Cloud Hosting Subscription", type: "service", unitPrice: 100, quantity: 1 },
  ],
  Healthcare: [
    { description: "Stethoscope", type: "equipment", unitPrice: 50, quantity: 1 },
    { description: "Medical Textbook", type: "book", unitPrice: 30, quantity: 1 },
  ],
  Finance: [
    { description: "Financial Analysis Software", type: "software", unitPrice: 200, quantity: 1 },
    { description: "Accounting Book", type: "book", unitPrice: 25, quantity: 1 },
  ],
  Retail: [
    { description: "Point of Sale Terminal", type: "hardware", unitPrice: 150, quantity: 1 },
    { description: "Barcode Scanner", type: "hardware", unitPrice: 40, quantity: 1 },
  ],
  Manufacturing: [
    { description: "Safety Gloves", type: "equipment", unitPrice: 10, quantity: 5 },
    { description: "Assembly Manual", type: "book", unitPrice: 18, quantity: 1 },
  ],
  "Real Estate": [
    { description: "Property Listing Service", type: "service", unitPrice: 120, quantity: 1 },
    { description: "Market Analysis Report", type: "report", unitPrice: 60, quantity: 1 },
  ],
  Entertainment: [
    { description: "Concert Ticket", type: "ticket", unitPrice: 75, quantity: 2 },
    { description: "Streaming Subscription", type: "service", unitPrice: 15, quantity: 1 },
  ],
  Other: [
    { description: "Miscellaneous Item", type: "misc", unitPrice: 30, quantity: 1 },
  ],
};

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Seeding orders for customers...");
  // Find all customer profiles
  const customers = await prisma.profile.findMany({
    where: { role: "customer" },
  });

  for (const customer of customers) {
    // Pick a random template for the customer's industry
    const templates = industryOrderTemplates[customer.industry || "Other"] || industryOrderTemplates["Other"];
    // Each customer gets 1-2 orders
    const numOrders = Math.floor(Math.random() * 2) + 1;
    for (let o = 0; o < numOrders; o++) {
      // Each order gets 1-2 items from the template
      const numItems = Math.floor(Math.random() * templates.length) + 1;
      const items = [];
      let orderTotal = 0;
      for (let i = 0; i < numItems; i++) {
        const template = getRandom(templates);
        const total = template.unitPrice * template.quantity;
        items.push({
          description: template.description,
          type: template.type,
          unitPrice: template.unitPrice,
          quantity: template.quantity,
          total,
        });
        orderTotal += total;
      }
      // Create the order and its items
      const order = await prisma.order.create({
        data: {
          profileId: customer.id,
          orderDate: new Date(),
          total: orderTotal,
          items: {
            create: items,
          },
        },
      });
      console.log(`Created order ${order.id} for customer ${customer.id} (${customer.industry}) with total $${orderTotal}`);
    }
  }
  console.log("Order seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 