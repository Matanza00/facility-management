import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: 'Invalid tenant ID' });
  }

  const tenantId = parseInt(id, 10);

  switch (method) {
    case 'GET':
      try {
        // Fetch tenant details, including areas
        const tenant = await prisma.tenants.findUnique({
          where: { id: tenantId },
          include: { area: true },
        });
    
        if (!tenant) {
          return res.status(404).json({ error: 'Tenant not found' });
        }
    
        // Fetch the user associated with the tenantName (user ID)
        const user = await prisma.user.findUnique({
          where: { id: parseInt(tenant.tenantName) }, // tenantName is the user ID
        });
    
        if (!user) {
          return res.status(404).json({ error: 'Associated user not found' });
        }
    
        // Replace tenantName (user ID) with the user's name
        res.status(200).json({
          ...tenant,
          tenantName: user.name, // Replace tenantName with the user's name
          createdAt: tenant.createdAt.toISOString(),
          updatedAt: tenant.updatedAt.toISOString(),
          area: tenant.area.map((area) => ({
            ...area,
            createdAt: area.createdAt.toISOString(),
            updatedAt: area.updatedAt.toISOString(),
          })),
        });
      } catch (error) {
        console.error('Error fetching tenant:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching tenant' });
      }
      break;
    
    case 'PUT':
      try {
        const { tenantName, totalAreaSq, areas } = req.body;

        if (!tenantName || !totalAreaSq || !Array.isArray(areas)) {
          return res.status(400).json({ error: 'Invalid input. Ensure all required fields are provided.' });
        }

        const updatedTenant = await prisma.tenants.update({
          where: { id: tenantId },
          data: {
            tenantName,
            totalAreaSq,
            area: {
              deleteMany: {}, // Delete existing areas
              create: areas.map((area) => ({
                floor: area.floor,
                occupiedArea: parseFloat(area.occupiedArea),
                location: area.location,
              })),
            },
          },
          include: { area: true },
        });

        res.status(200).json(updatedTenant);
      } catch (error) {
        console.error('Error updating tenant:', error.message);
        res.status(500).json({ error: 'An error occurred while updating tenant' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method Not Allowed' });
      break;
  }
}
