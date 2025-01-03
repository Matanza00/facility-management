import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Complaint ID is required' });
  }

  if (method === 'GET') {
    try {
      const { id } = req.query;
  
      // Fetch the specific FeedbackComplain entry by ID, including tenant details
      const complainData = await prisma.feedbackComplain.findUnique({
        where: { id: parseInt(id) },
        include: {
          tenant: {
            select: {
              tenantName: true, // Get tenant's name
            },
          },
          jobSlips: true, // Include all job slips related to the feedback complain
        },
      });
  
      // If no complaint is found, return a 404
      if (!complainData) {
        return res.status(404).json({ error: 'Complaint not found' });
      }
  
      // Map and replace jobSlips' department and attendedBy fields
      const updatedJobSlips = await Promise.all(
        complainData.jobSlips.map(async (jobSlip) => {
          // Fetch the department name if department ID exists
          const department = jobSlip.department
            ? await prisma.department.findUnique({
                where: { id: parseInt(jobSlip.department) },
                select: { name: true },
              })
            : null;
  
          // Handle attendedBy as comma-separated IDs
          const attendedByNames = jobSlip.attendedBy
            ? await Promise.all(
                jobSlip.attendedBy
                  .split(',') // Split into an array
                  .map((id) => parseInt(id)) // Parse each ID as integer
                  .filter((id) => !isNaN(id)) // Filter out invalid IDs
                  .map(async (userId) => {
                    const user = await prisma.user.findUnique({
                      where: { id: userId },
                      select: { name: true },
                    });
                    return user ? user.name : 'Unknown User';
                  })
              )
            : [];
  
          return {
            ...jobSlip,
            department: department ? department.name : 'Unknown Department',
            attendedBy: attendedByNames.length > 0 ? attendedByNames.join(', ') : 'N/A',
          };
        })
      );
  
      // Return the updated complaint data with jobSlips having names instead of IDs
      return res.status(200).json({
        ...complainData,
        jobSlips: updatedJobSlips,
      });
    } catch (error) {
      console.error('Error fetching complaint:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
  else if (method === 'PUT') {
    const {
      complain,
      date,
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
    } = req.body;

     // Ensure `floorNo` is a string
      const formattedFloorNo = typeof floorNo === 'string' ? floorNo : String(floorNo);

    // Validate required fields
    if (!complain || !date || !status) {
      return res.status(400).json({ error: 'Missing required fields: complain, date, or status' });
    }

    try {
      // Parse and validate the date
      const formattedDate = new Date(date);
      if (isNaN(formattedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      // Log the request body for debugging
      console.log('Update Request Data:', {
        complain,
        date: formattedDate,
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
      });

      // Update the complaint in the database
      const updatedComplain = await prisma.feedbackComplain.update({
        where: { id: parseInt(id) },
        data: {
          complain,
          date: formattedDate,
          complainBy,
          floorNo: formattedFloorNo, // Ensure this is a string
          area,
          location,
          locations,
          listServices,
          materialReq,
          actionTaken,
          attendedBy,
          remarks,
          status,
        },
      });

      // Return the updated complain data
      return res.status(200).json(updatedComplain);
    } catch (error) {
      console.error('Error updating complaint:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    // Handle unsupported HTTP methods
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
