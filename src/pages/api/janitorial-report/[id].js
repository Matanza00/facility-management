import { PrismaClient } from '@prisma/client'; // Import Prisma Client directly

const prisma = new PrismaClient(); // Initialize Prisma client

// API handler for /api/janitorial-report/[id]
export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid report ID" });
  }

  switch (req.method) {
    // GET a specific Janitorial Report
    case "GET":
      try {
        // Fetch the Janitorial Report
        const janitorialReport = await prisma.janitorialReport.findUnique({
          where: { id: parseInt(id, 10) },
          include: {
            subJanReport: true, // Include related sub-reports
          },
        });
    
        if (!janitorialReport) {
          return res.status(404).json({ error: "Janitorial Report not found" });
        }
    
        // Fetch supervisor details (id and name)
        const supervisor = await prisma.user.findUnique({
          where: { id: parseInt(janitorialReport.supervisor, 10) },
          select: { id: true, name: true },
        });
    
        // Fetch tenant details (id and name)
        const tenant = await prisma.tenants.findUnique({
          where: { id: parseInt(janitorialReport.tenant, 10) },
          select: { id: true, tenantName: true },
        });
    
        // Format the response
        const formattedReport = {
          ...janitorialReport,
          supervisor: supervisor
            ? { id: supervisor.id, name: supervisor.name }
            : { id: janitorialReport.supervisor, name: null },
          tenant: tenant
            ? { id: tenant.id, name: tenant.tenantName }
            : { id: janitorialReport.tenant, name: null },
        };
    
        res.status(200).json(formattedReport);
      } catch (error) {
        console.error("GET Error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
      break;
    
    // PUT to update a specific Janitorial Report
// PUT to update a specific Janitorial Report
case "PUT":
  try {
    const { date, supervisor, tenant, remarks, subJanReports } = req.body;

    if (!date || !supervisor || !tenant || !Array.isArray(subJanReports)) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Ensure `supervisor` and `tenant` are strings since the database expects string values
    const supervisorString = supervisor.toString();
    const tenantString = tenant.toString();

    // Step 1: Find existing subJanReports for the janitorial report
    const existingSubReports = await prisma.subJanReport.findMany({
      where: {
        janitorialReportId: parseInt(id, 10), // Assuming 'janitorialReportId' is the relationship field
      },
    });

    // Step 2: Identify sub-reports to delete (those not included in the updated subJanReports array)
    const subReportsToDelete = existingSubReports.filter((existing) =>
      !subJanReports.some((sub) => sub.id === existing.id)
    );

    // Step 3: Delete the sub-reports that are not included in the new subJanReports
    if (subReportsToDelete.length > 0) {
      await prisma.subJanReport.deleteMany({
        where: {
          id: {
            in: subReportsToDelete.map((sub) => sub.id),
          },
        },
      });
    }

    // Step 4: Update the Janitorial Report
    const updatedReport = await prisma.janitorialReport.update({
      where: { id: parseInt(id, 10) },
      data: {
        date: new Date(date),
        supervisor: supervisorString, // Save supervisor as string
        tenant: tenantString, // Save tenant as string
        remarks,
      },
    });

    // Step 5: Upsert sub-reports
    for (const sub of subJanReports) {
      await prisma.subJanReport.upsert({
        where: { id: sub.id || 0 }, // Try to match by ID
        create: {
          floorNo: sub.floorNo,
          toilet: sub.toilet,
          lobby: sub.lobby,
          staircase: sub.staircase,
          janitorialReportId: updatedReport.id,
        },
        update: {
          floorNo: sub.floorNo,
          toilet: sub.toilet,
          lobby: sub.lobby,
          staircase: sub.staircase,
        },
      });
    }

    // Fetch updated report with sub-reports for response
    const refreshedReport = await prisma.janitorialReport.findUnique({
      where: { id: updatedReport.id },
      include: {
        subJanReport: true,
      },
    });

    res.status(200).json(refreshedReport);
  } catch (error) {
    console.error("PUT Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
  break;

    // DELETE a specific Janitorial Report
    case "DELETE":
      try {
        await prisma.janitorialReport.delete({
          where: { id: parseInt(id, 10) },
        });

        res.status(204).end(); // Successfully deleted
      } catch (error) {
        console.error("DELETE Error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
      break;

    // If method is not supported
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
      break;
  }
}
