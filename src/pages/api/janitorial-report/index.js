import { PrismaClient } from '@prisma/client'; // Import Prisma Client directly

const prisma = new PrismaClient(); // Initialize Prisma client

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Handle GET request for fetching Janitorial Reports with filters and pagination
    const { supervisor, dateFrom, dateTo, page = 1 } = req.query;

    // Initialize filter object
    const filters = {};
    if (supervisor) filters.supervisor = { contains: supervisor, mode: 'insensitive' };
    if (dateFrom) filters.date = { gte: new Date(dateFrom) };
    if (dateTo) filters.date = { lte: new Date(dateTo) };

    try {
      // Fetch Janitorial Reports with pagination and filters
      const reports = await prisma.janitorialReport.findMany({
        where: filters,
        skip: (page - 1) * 10,  // Pagination logic, 10 reports per page
        take: 10,
        include: {
          subJanReport: true,  // Include related sub-reports
        },
      });

      // Fetch tenant and supervisor names based on IDs
      const reportsWithNames = await Promise.all(reports.map(async (report) => {
        const tenant = await prisma.tenants.findUnique({
          where: { id: parseInt(report.tenant, 10) },
          select: { tenantName: true },
        });

        const supervisor = await prisma.user.findUnique({
          where: { id: parseInt(report.supervisor, 10) },
          select: { name: true },
        });

        return {
          ...report,
          supervisor: supervisor ? supervisor.name : null, // Supervisor name
          tenant: tenant ? tenant.tenantName : null,       // Tenant name
        };
      }));

      // Count the total number of reports for pagination
      const totalCount = await prisma.janitorialReport.count({ where: filters });
      const hasMore = totalCount > page * 10;  // Check if more pages are available

      res.status(200).json({
        data: reportsWithNames,
        nextPage: hasMore ? page + 1 : null,  // Return next page if more data exists
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  }
  else if (req.method === 'POST') {
    const {
      date,
      supervisor,
      tenant,
      remarks,
      subJanReports,
      createdById, // Ensure this is passed from the frontend
    } = req.body;
  
    // Validate request body
    if (!date || !supervisor || !tenant || !subJanReports || !subJanReports.length || !createdById) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const validDate = new Date(date);
    if (isNaN(validDate)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
  
    const formattedDate = validDate.toISOString();
  
    try {
      const janitorialReport = await prisma.janitorialReport.create({
        data: {
          date: formattedDate,
          supervisor: supervisor.toString(),
          tenant: tenant.toString(),
          remarks,
          subJanReport: {
            create: subJanReports.map((subReport) => ({
              floorNo: subReport.floorNo,
              toilet: subReport.toilet,
              lobby: subReport.lobby,
              staircase: subReport.staircase,
            })),
          },
        },
        include: {
          subJanReport: true,
        },
      });

      const createdByUser = await prisma.user.findUnique({
        where: { id: parseInt(createdById, 10) },
        select: { name: true },
      });
  
      // Fetch notification recipients
      const [managers, supervisors, admins] = await Promise.all([
        prisma.user.findMany({
          where: { role: { name: 'Manager' } },
          select: { id: true, name: true },
        }),
        prisma.user.findMany({
          where: {
            role: { name: 'Supervisor' },
            department: {
              name: { in: ['Building', 'Janitorial'] },
            },
          },
          select: { id: true, name: true },
        }),
        prisma.user.findMany({
          where: { role: { name: 'Admin' } },
          select: { id: true, name: true },
        }),
      ]);
  
      const allRecipients = [...managers, ...supervisors, ...admins];
  
      const notificationPromises = allRecipients.map((recipient) =>
        prisma.notification.create({
          data: {
            templateId: 1, // Use appropriate template ID
            userId: recipient.id,
            createdById: parseInt(createdById), // Use the provided createdById
            isRead: false,
            altText: `Hello ${recipient.name}, Janitorial inspection report created by ${createdByUser.name}`,
            link: `/janitorial/report/view/${janitorialReport.id}`, // Update URL as needed

          },
        })
      );
  
      await Promise.all(notificationPromises);
  
      res.status(201).json(janitorialReport);
    } catch (error) {
      console.error("Error creating Janitorial Report:", error);
      res.status(500).json({ error: 'Failed to create Janitorial Report' });
    }
  }
  
}