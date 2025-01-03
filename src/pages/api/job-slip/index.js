import { PrismaClient } from '@prisma/client'; // Import Prisma Client directly
import jobSlipIdGenerator from '../../../utils/jobSlipIdGenerator'
import jwt from 'jsonwebtoken'; // JWT package to decode the token
// import { createPortal } from 'react-dom';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient(); // Initialize Prisma client
// Function to extract userId from the token
const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id; // Ensure 'id' exists in the token
  } catch (error) {
    console.error('JWT Error:', error); // Log the error if verification fails
    return null;
  }
};

export default async function handler(req, res) {
  const { method } = req;
  // const notificationTemplateName = "Added Jobslip";

  // Get the token from the Authorization header
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Authorization: Bearer <token>"
  if (!token) {
    console.error('Token is missing in request headers.');
    return res.status(401).json({ message: 'Unauthorized: Token is missing' });
  }

  // Extract the user ID from the token
  const userId = getUserIdFromToken(token);
  console.log(userId)
  if (!userId) {
    console.error('Invalid token or unable to decode the user ID.');
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
  
  
  switch (method) {
    case 'GET':
      try {
        // Destructure query params for pagination and filters
        const {
          page = 1,
          jobId,
          complainNo,
          complainBy,
          floorNo,
          status,
          dateFrom,
          dateTo
        } = req.query;

        const limit = 10; // Define limit per page
        const offset = (page - 1) * limit; // Calculate offset for pagination

        const where = {}; // Initialize filter object

        // Build dynamic query filters based on the query params
        if (jobId) where.jobId = { contains: jobId };
        if (complainNo) where.complainNo = { contains: complainNo };
        if (complainBy) where.complainBy = { contains: complainBy };
        if (floorNo) where.floorNo = { contains: floorNo };
        if (status) where.status = { equals: status };
        if (dateFrom) where.date = { gte: new Date(dateFrom) };
        if (dateTo) where.date = { lte: new Date(dateTo) };

        // Fetch job slips from the database with filters and pagination
        const jobSlips = await prisma.jobSlip.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { date: 'desc' },
        });

        // Get the total count of job slips matching the filters
        const totalCount = await prisma.jobSlip.count({
          where,
        });

        // Determine if there is a next page for pagination
        const nextPage = totalCount > offset + limit;

        // Send the response with data and pagination info
        res.status(200).json({
          data: jobSlips,
          nextPage,
        });
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while fetching job slips' });
      }
      break;
      case 'POST':
        try {
          // Step 1: Extract and validate required fields
          const {
            date,
            complainNo,
            complainBy,
            floorNo,
            area,
            location,
            locations,
            complaintDesc,
            materialReq,
            actionTaken,
            attendedBy,
            department,
            remarks,
            completed_At,
            supervisorApproval,
            managementApproval,

          } = req.body;
      
          console.log('Request Body:', req.body);
      
          if (!complainNo || !complaintDesc) {
            return res.status(400).json({ error: 'Missing required fields: complainNo or complaintDesc' });
          }
      
          let jobslipId;
          try {
            // Step 2: Fetch department code and generate jobslipId
            const departmentt = await prisma.department.findUnique({
              where: { id: parseInt(department, 10) },
              select: { code: true },
            });
      
            if (!departmentt) {
              throw new Error('Department not found');
            }
      
            jobslipId = jobSlipIdGenerator(departmentt.code, area);
          } catch (error) {
            console.error('Error fetching department or generating jobslipId:', error);
            return res.status(500).json({ error: 'Error fetching department or generating jobslipId' });
          }
      
          let newJobSlip;
          try {
            // Step 3: Insert the JobSlip into the database
            newJobSlip = await prisma.jobSlip.create({
              data: {
                date: date ? new Date(date) : new Date(),
                jobId: jobslipId,
                complainNo,
                complainBy: complainBy || null,
                floorNo,
                area,
                location,
                locations,
                complaintDesc,
                materialReq,
                actionTaken,
                attendedBy,
                department,
                remarks,
                status: "Pending",
                completed_At: completed_At ? new Date(completed_At) : null,
                supervisorApproval: supervisorApproval || false,
                managementApproval: managementApproval || false,
              },
            });
          } catch (error) {
            console.error('Error creating JobSlip:', error);
            return res.status(500).json({ error: 'Error creating JobSlip' });
          }
      
          try {
            // Step 4: Update feedback complaint status
            await prisma.feedbackComplain.update({
              where: { complainNo },
              data: { status: 'In Progress' },
            });
          } catch (error) {
            console.error('Error updating feedback complaint:', error);
            return res.status(500).json({ error: 'Error updating feedback complaint' });
          }
      
          let template;
          try {
            // Step 5: Fetch notification template
            template = await prisma.notificationTemplate.findUnique({
              where: { name: 'Added Jobslip' },
            });
      
            if (!template) {
              throw new Error('Notification template not found');
            }
          } catch (error) {
            console.error('Error fetching notification template:', error);
            return res.status(500).json({ error: 'Error fetching notification template' });
          }
          console.log({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          })
          try {
            // Fetch the user who created the job slip
            console.log('Fetching createdByUser...');
            const createdByUser = await prisma.user.findUnique({
              where: { id: userId },
              select: { name: true, email: true },
            });
          
            if (!createdByUser) {
              throw new Error('CreatedByUser not found');
            }
            console.log('CreatedByUser:', createdByUser);
          
            // Parse technician IDs
            console.log('Parsing technician IDs...');
            const technicianIds = attendedBy
              .split(',')
              .map((id) => parseInt(id.trim(), 10))
              .filter((id) => !isNaN(id));
          
            console.log('Technician IDs:', technicianIds);
          
            // Fetch technicians
            console.log('Fetching technicians...');
            const technicians = await prisma.user.findMany({
              where: { id: { in: technicianIds } },
              select: { id: true, name: true, email: true },
            });
          
            if (!technicians || technicians.length === 0) {
              throw new Error('No technicians found for the provided IDs');
            }
            console.log('Technicians:', technicians);
          
            // Create notifications for technicians
            console.log('Creating notifications...');
            const notificationPromises = technicians.map((technician) =>
              prisma.notification.create({
                data: {
                  templateId: template.id,
                  userId: technician.id,
                  createdById: userId,
                  isRead: false,
                  altText: `Hello ${technician.name}, Jobslip ${newJobSlip.jobId} has been created by ${createdByUser.name}.`,
                  link: `/customer-relation/job-slip/view/${newJobSlip.id}`,
                },
              })
            );
          
            await Promise.all(notificationPromises);
            console.log('Notifications created successfully');
          
            // Set up the email transporter
            console.log('Setting up email transporter...');
            const transporter = nodemailer.createTransport({
              host: process.env.EMAIL_HOST,
              port: process.env.EMAIL_PORT,
              secure: process.env.EMAIL_SECURE === 'true',
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });
          
            // Send emails to technicians
            console.log('Sending emails...');
            const emailPromises = technicians.map((technician) =>
              transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: technician.email,
                subject: `New Jobslip Created: ${newJobSlip.jobId}`,
                text: `Hello ${technician.name},\n\nA new jobslip (${newJobSlip.jobId}) has been created by ${createdByUser.name}. Please review it at the following link:\n\n${process.env.APP_URL}/customer-relation/job-slip/view/${newJobSlip.id}\n\nThank you.`,
              })
            );
          
            await Promise.all(emailPromises);
            console.log('Emails sent successfully');
          } catch (error) {
            console.error('Error notifying technicians:', error);
            return res.status(500).json({ error: 'Error notifying technicians', details: error.message });
          }
          
      
          try {
            // Step 7: Notify and email bookkeeper
            const bookkeeper = await prisma.user.findFirst({
              where: { role: { name: 'Bookkeeper' } },
              select: { id: true, name: true, email: true },
            });
      
            if (bookkeeper) {
              await prisma.notification.create({
                data: {
                  templateId: template.id,
                  userId: bookkeeper.id,
                  createdById: userId,
                  isRead: false,
                  altText: `Hello ${bookkeeper.name}, Jobslip ${newJobSlip.jobId} has been created.`,
                  link: `/customer-relation/job-slip/view/${newJobSlip.id}`,
                },
              });
      
              const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS,
                },
              });
      
              await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: bookkeeper.email,
                subject: `New Jobslip Created: ${newJobSlip.jobId}`,
                text: `Hello ${bookkeeper.name},\n\nA new jobslip (${newJobSlip.jobId}) has been created. Please review it at the following link:\n\n${process.env.APP_URL}/customer-relation/job-slip/view/${newJobSlip.id}\n\nThank you.`,
              });
      
              console.log(`Notification and email sent to bookkeeper: ${bookkeeper.name}`);
            } else {
              console.warn('No bookkeeper found in the system.');
            }
          } catch (error) {
            console.error('Error notifying bookkeeper:', error);
            return res.status(500).json({ error: 'Error notifying bookkeeper' });
          }
              try {
          // Step 8: Notify and email department manager(s)
          console.log('Fetching department managers...');
          const managers = await prisma.user.findMany({
            where: {
              role: { name: 'Manager' },
              departmentId: parseInt(department, 10), // Assuming the department relationship is stored as departmentId
            },
            select: { id: true, name: true, email: true },
          });
        
          if (managers && managers.length > 0) {
            console.log('Managers found:', managers);
        
            // Create notifications for managers
            console.log('Creating notifications for managers...');
            const managerNotificationPromises = managers.map((manager) =>
              prisma.notification.create({
                data: {
                  templateId: template.id,
                  userId: manager.id,
                  createdById: userId,
                  isRead: false,
                  altText: `Hello ${manager.name}, Jobslip ${newJobSlip.jobId} has been created in your department.`,
                  link: `/customer-relation/job-slip/view/${newJobSlip.id}`,
                },
              })
            );
        
            await Promise.all(managerNotificationPromises);
            console.log('Notifications sent to managers successfully.');
        
            // Set up the email transporter
            console.log('Setting up email transporter for managers...');
            const transporter = nodemailer.createTransport({
              host: process.env.EMAIL_HOST,
              port: process.env.EMAIL_PORT,
              secure: process.env.EMAIL_SECURE === 'true',
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });
        
            // Send emails to managers
            console.log('Sending emails to managers...');
            const managerEmailPromises = managers.map((manager) =>
              transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: manager.email,
                subject: `New Jobslip Created in Your Department: ${newJobSlip.jobId}`,
                text: `Hello ${manager.name},\n\nA new jobslip (${newJobSlip.jobId}) has been created in your department. Please review it at the following link:\n\n${process.env.APP_URL}/customer-relation/job-slip/view/${newJobSlip.id}\n\nThank you.`,
              })
            );
        
            await Promise.all(managerEmailPromises);
            console.log('Emails sent to managers successfully.');
          } else {
            console.warn('No managers found for the department.');
          }
        } catch (error) {
          console.error('Error notifying department managers:', error);
          return res.status(500).json({ error: 'Error notifying department managers', details: error.message });
        }
          res.status(201).json(newJobSlip);
        } catch (error) {
          console.error('Unhandled error in POST request:', error);
          res.status(500).json({ error: 'An unexpected error occurred' });
        }


        

        break;
      
    case 'DELETE':
      try {
        // Extract the ID from the query params
        const { id } = req.query;

        // Delete the job slip by ID (soft delete by updating the deletedAt field)
        await prisma.jobSlip.delete({
          where: {
            id: parseInt(id),
          },
        });

        // Send success response
        res.status(200).json({ message: 'Job slip deleted successfully' });
      } catch (error) {
        console.log(error)

        res.status(500).json({ error: 'An error occurred while deleting job slip' });
      }
      break;

    default:
      // Handle any unsupported HTTP methods
      res.status(405).json({ error: 'Method Not Allowed' });
      break;
  }
}
