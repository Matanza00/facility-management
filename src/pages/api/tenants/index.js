import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET': // Fetch all tenants
    try {
      const tenants = await prisma.tenants.findMany({
        include: { area: true }, // Ensure this matches your schema
      });
  
      // Fetch user names for tenantName (user ID)
      const userIds = tenants.map((tenant) => parseInt(tenant.tenantName)); // Extract all tenantName IDs
      console.log(userIds)
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } }, // Query all users by IDs
        select: { id: true, name: true }, // Select only necessary fields
      });
  
      // Create a map for quick user lookup
      const userMap = users.reduce((acc, user) => {
        acc[user.id] = user.name; // Map user ID to user name
        return acc;
      }, {});
  
      const response = tenants.map((tenant) => ({
        ...tenant,
        tenantName: userMap[tenant.tenantName] || tenant.tenantName, // Replace ID with name or keep ID if not found
        createdAt: tenant.createdAt.toISOString(),
        updatedAt: tenant.updatedAt.toISOString(),
        area: tenant.area.map((area) => ({
          ...area,
          createdAt: area.createdAt.toISOString(),
          updatedAt: area.updatedAt.toISOString(),
        })),
      }));
  
      res.status(200).json({ data: response });
    } catch (error) {
      console.error('Error fetching tenants:', error.message);
      res.status(500).json({ error: 'Failed to fetch tenants' });
    }
    break;
  
    case 'POST': // Add a new tenant
      try {
        const { tenantName, totalAreaSq, areas } = req.body;
        console.log(req.body)

        // Validation
        if (!tenantName || totalAreaSq === undefined || !Array.isArray(areas)) {
          return res.status(400).json({ error: 'Invalid input' });
        }

        // Validate individual area entries
        for (const area of areas) {
          if (!area.floor || area.occupiedArea === undefined) {
            return res.status(400).json({ error: 'Invalid area data' });
          }
        }

        const newTenant = await prisma.tenants.create({
          data: {
            tenantName,
            totalAreaSq,
            area: {
              create: areas.map((area) => ({
                floor: area.floor,
                occupiedArea: parseFloat(area.occupiedArea),
                location: area.location,
              })),
            },
          },
          include: { area: true },
        });

        res.status(201).json({
          ...newTenant,
          createdAt: newTenant.createdAt.toISOString(),
          updatedAt: newTenant.updatedAt.toISOString(),
          area: newTenant.area.map((area) => ({
            ...area,
            createdAt: area.createdAt.toISOString(),
            updatedAt: area.updatedAt.toISOString(),
          })),
        });
      } catch (error) {
        console.error('Error adding tenant:', error.message);
        res.status(500).json({ error: 'Failed to add tenant' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}
