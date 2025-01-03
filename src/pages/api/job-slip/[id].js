import { PrismaClient } from '@prisma/client'; // Import Prisma Client directly

const prisma = new PrismaClient(); // Initialize Prisma client

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    // ================================
    // Handle GET Request
    // ================================
    case 'GET':
      try {
        const { id } = req.query;

        // Fetch the job slip by its ID
        const jobSlip = await prisma.jobSlip.findUnique({
          where: { id: parseInt(id) },
          include: {
            feedbackComplain: true, // Include related feedback complain if needed
          },
        });

        if (!jobSlip) {
          return res.status(404).json({ message: 'Job slip not found' });
        }

        // Parse attendedBy as an array of IDs
        const attendedByIds = jobSlip.attendedBy
          ? jobSlip.attendedBy.split(',').map((id) => parseInt(id)).filter((id) => !isNaN(id))
          : [];

        // Fetch all user names for the attendedBy IDs
        const users = attendedByIds.length
          ? await prisma.user.findMany({
              where: { id: { in: attendedByIds } },
              select: { id: true, name: true },
            })
          : [];

        // Fetch the department name (optional)
        const department = jobSlip.department
          ? await prisma.department.findUnique({
              where: { id: parseInt(jobSlip.department) },
              select: { name: true },
            })
          : null;

        // Build a response with user names and department name
        const jobSlipWithNames = {
          ...jobSlip,
          attendedBy: users.map((user) => user.name).join(', ') || 'N/A', // Convert to readable names
          department: department ? department.name : 'N/A',
        };

        return res.status(200).json(jobSlipWithNames);
      } catch (error) {
        console.error('Error fetching job slip:', error);
        return res.status(500).json({ message: 'Error fetching job slip' });
      }

    // ================================
    // Handle PUT Request
    // ================================
    case 'PUT':
      try {
        // Extract the data from the request body
        const {
          jobId,
          complainNo,
          materialReq,
          actionTaken,
          attendedBy, // Comma-separated string expected
          remarks,
          status,
          supervisorApproval,
          managementApproval,
          completed_At,
          picture, // Added picture field
        } = req.body;
    
        // Ensure required fields are included
        if (!jobId || !complainNo || !materialReq || !actionTaken || !attendedBy || !status) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
    
        // Validate attendedBy (comma-separated string)
        const attendedByValidated = attendedBy
          .split(',')
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id))
          .join(',');
    
        // Handle picture field: Ensure it is a valid comma-separated string or null
        let updatedPicture = null;

        if (picture) {
          const pictureArray = picture.split(',').map((img) => img.trim()).filter(Boolean); // Split and trim, remove empty
          if (pictureArray.length > 0) {
            updatedPicture = pictureArray.join(','); // Join back into a clean string
          }
        }
           
        let updatedcompleted_At = completed_At;
        let updatedsupervisorApproval = supervisorApproval;

        // Prepare the updated status: If picture exists, set to 'Completed', otherwise use the provided status
        let updatedStatus = status;
        if (updatedPicture) {
          supervisorApproval != true ? updatedStatus = 'Resolved':updatedStatus = 'Verified & Closed';
          updatedcompleted_At = new Date()// Set status to 'Completed' if there is a picture
        }
        if ( supervisorApproval == true) {
          updatedStatus = "Verified & Closed"
        }
        // Update the job slip
        const updatedJobSlip = await prisma.jobSlip.update({
          where: { id: parseInt(req.query.id) },
          data: {
            jobId,
            complainNo,
            materialReq,
            actionTaken,
            attendedBy: attendedByValidated, // Save as a validated comma-separated string
            remarks,
            status: updatedStatus, // Set the status dynamically
            supervisorApproval,
            managementApproval,
            completed_At:updatedcompleted_At,
            picture: updatedPicture, // Update picture with the validated value
            updatedAt: new Date(), // Always update the timestamp
          },
        });
    
        // Check if all job slips with the same complainNo are completed
        const allJobSlipsCompleted = await prisma.jobSlip.findMany({
          where: { complainNo, status: 'Completed' },
        });
    
        // Get all job slips for the given complainNo
        const allJobSlips = await prisma.jobSlip.findMany({
          where: { complainNo },
        });
    
        // If all related job slips are completed, update the FeedbackComplain status
        if (allJobSlipsCompleted.length === allJobSlips.length) {
          await prisma.feedbackComplain.update({
            where: { complainNo },
            data: { status: 'Resolved' },
          });
        }
    
        // Send the updated job slip response
        res.status(200).json(updatedJobSlip);
      } catch (error) {
        // Log the error and send a response
        console.error('Error updating job slip:', error);
        res.status(500).json({ error: 'Error updating job slip', message: error.message });
      }
      break;
    
    // ================================
    // Handle DELETE Request
    // ================================
    case 'DELETE':
      try {
        const { id } = req.query;

        // Delete the job slip
        const deletedJobSlip = await prisma.jobSlip.delete({
          where: {
            id: parseInt(id),
          },
        });

        res.status(200).json({ message: 'Job slip deleted successfully', deletedJobSlip });
      } catch (error) {
        console.error('Error deleting job slip:', error);
        res.status(500).json({ error: 'An error occurred while deleting job slip' });
      }
      break;

    // ================================
    // Handle Unsupported Methods
    // ================================
    default:
      res.status(405).json({ error: 'Method Not Allowed' });
      break;
  }
}
