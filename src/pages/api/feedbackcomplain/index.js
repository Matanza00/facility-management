import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method, query } = req;

  if (method === 'GET') {
    if (query.type === 'tenants') {
      try {
        const tenants = await prisma.tenants.findMany({
          select: {
            id: true,
            tenantName: true, // Use the correct field name
          },
        });
        res.status(200).json(tenants);
      } catch (error) {
        console.error('Error fetching tenants:', error);
        res.status(500).json({ error: 'An error occurred while fetching tenants' });
      }
    }
    else {
      // Fetch feedback complaints with pagination
      const page = parseInt(query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      try {
        const feedbackComplain = await prisma.feedbackComplain.findMany({
          skip: offset,
          take: limit,
          orderBy: { date: 'desc' },
        });

        const serializedData = feedbackComplain.map((item) => ({
          ...item,
          date: item.date.toISOString(),
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        }));

        const nextPage = serializedData.length === limit;

        res.status(200).json({ data: serializedData, nextPage });
      } catch (error) {
        console.error('Error fetching feedback complaints:', error);
        res.status(500).json({ error: 'An error occurred while fetching data' });
      }
    }
  } else if (method === 'POST') {
    try {
      const {
        complain,
        complainBy,
        floorNo,
        area,
        location,
        locations,
        listServices,
        materialReq,
        actionTaken,
        attendedBy,
        remarks,
        status,
        tenantId, // Include tenant ID from the request body
      } = req.body;

      // Generate a unique `complainNo`
      const uniqueComplainNo = `CMP-${Date.now()}`;

      // Create a new feedback complaint
      const newComplaint = await prisma.feedbackComplain.create({
        data: {
          complain,
          date: new Date(),
          complainNo: uniqueComplainNo, // Auto-generated unique complain number
          complainBy,
          floorNo, // Floor number as a string
          area,
          location,
          locations,
          listServices,
          materialReq,
          actionTaken,
          attendedBy,
          remarks,
          status,
          tenantId: parseInt(tenantId, 10), // Convert tenantId to an integer
        },
      });

      res.status(200).json(newComplaint);
    } catch (error) {
      console.error('Error creating feedback complaint:', error);

      // Handle Prisma validation errors explicitly
      if (error.code === 'P2002') {
        return res
          .status(400)
          .json({ error: 'Duplicate entry for unique field (complainNo)' });
      }

      res.status(500).json({ error: 'Failed to create complaint' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
