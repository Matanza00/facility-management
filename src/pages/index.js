'use client';
import Layout from '../components/layout';
import { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { FaUsers, FaCogs, FaClipboardList, FaExclamationCircle, FaClipboardCheck } from 'react-icons/fa';
import { MdSecurity, MdCleanHands, MdCameraAlt } from 'react-icons/md';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);


const AuthComponent = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const authenticateAndFetchData = async () => {
    const url = 'http://182.180.99.136:8090/api/docs/api-token-auth';
    const payload = JSON.stringify({
      username: 'admin',
      password: 'ad123456',
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Authentication Example</h1>
      <button onClick={authenticateAndFetchData}>Authenticate and Fetch Data</button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {data ? (
        <div>
          <h2>Response Data:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <p>No data fetched yet.</p>
      )}
    </div>
  );
};


const Home = () => {
  const [dashboardData, setDashboardData] = useState({
    tenants: 0,
    supervisors: 0,
    technicians: 0,
    complaints: 0,
    jobSlips: 0,
    janitorialReports: 0,
    securityReports: 0,
    cctvReports: 0,
  });
  const [jobSlipDataState, setJobSlipDataState] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]); // Add feedbackData state
  const [feedbackStatus, setFeedbackStatus] = useState({
    Open: 0,
    Pending: 0,
    'In Progress': 0,
    Completed: 0,
  });
  const [jobSlipStatus, setJobSlipStatus] = useState({
    Open: 0,
    Pending: 0,
    'In Progress': 0,
    Completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [popupData, setPopupData] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  // const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  // const chartRef = useRef(null);

  
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
         
         // Fetch the session to get the access token
      const authRes = await fetch('/api/auth/session');
      const authData = await authRes.json();

      const token = authData?.user?.accessToken;
      console.log('Access Token:', token);

        const tenantsRes = await fetch('/api/tenants');
        const tenantsData = await tenantsRes.json();

        const supervisorsRes = await fetch('/api/users/filtered?roles=supervisor');
        const supervisorsData = await supervisorsRes.json();

        const techniciansRes = await fetch('/api/users/filtered?roles=technician');
        const techniciansData = await techniciansRes.json();

         // Fetch all data
         const complaintsRes = await fetch('/api/feedbackcomplain', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const complaintsData = await complaintsRes.json();
        setFeedbackData(complaintsData.data || []); // Set feedbackData

        const jobSlipsRes = await fetch('/api/job-slip', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const jobSlipsData = await jobSlipsRes.json();
        setJobSlipDataState(jobSlipsData.data || []);

        const janitorialReportsRes = await fetch('/api/janitorial-report');
        const janitorialReportsData = await janitorialReportsRes.json();

        const securityReportsRes = await fetch('/api/security-reports');
        const securityReportsData = await securityReportsRes.json();

        const cctvReportsRes = await fetch('/api/cctv-report');
        const cctvReportsData = await cctvReportsRes.json();

        // Process complaint statuses
        // Initialize status counts
        const complaintsStatusCounts = { Open: 0, Pending: 0, 'In Progress': 0, Resolved: 0 };
        if (Array.isArray(complaintsData.data)) {
          complaintsData.data.forEach((complaint) => {
            const status = complaint.status.trim();
            if (complaintsStatusCounts[status] !== undefined) {
              complaintsStatusCounts[status] += 1;
            } else {
              console.warn(`Unexpected status: ${status}`);
            }
          });
        }

    console.log('Complaints Status Counts:', complaintsStatusCounts);

        // Process job slip statuses
const jobSlipsStatusCounts = { Open: 0, Pending: 0, 'In Progress': 0, Completed: 0 }; // Initialize counts

if (Array.isArray(jobSlipsData.data)) {
  jobSlipsData.data.forEach((jobSlip) => {
    const status = jobSlip.status.trim(); // Normalize status (e.g., trim spaces)
    if (jobSlipsStatusCounts[status] !== undefined) {
      jobSlipsStatusCounts[status] += 1;
    } else {
      console.warn(`Unexpected status in job slips: ${status}`); // Log unexpected statuses
    }
  });
}

console.log('Job Slips Status Counts:', jobSlipsStatusCounts);
setJobSlipStatus(jobSlipsStatusCounts);


        setDashboardData({
          tenants: tenantsData?.data?.length || tenantsData?.total || 0,
          supervisors: supervisorsData?.length || supervisorsData.total || 0,
          technicians: techniciansData?.length || techniciansData.total || 0,
          complaints: complaintsData?.data?.length || complaintsData?.total || 0,
          jobSlips: jobSlipsData?.data?.length || jobSlipsData?.total || 0,
          janitorialReports: janitorialReportsData?.data?.length || janitorialReportsData?.total || 0,
          securityReports: securityReportsData?.length || securityReportsData.total || 0,
          cctvReports: cctvReportsData?.data?.length || cctvReportsData?.total || 0,
        });

        setFeedbackStatus(complaintsStatusCounts);
        setJobSlipStatus(jobSlipsStatusCounts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  

  const barData = {
    labels: ['Complaints', 'Job Slips', 'Janitorial Reports'],
    datasets: [
      {
        label: 'Count',
        data: [
          dashboardData.complaints,
          dashboardData.jobSlips,
          dashboardData.janitorialReports,

        ],
        backgroundColor: ['#4C51BF', '#48BB78', '#ED8936', ],
      },
    ],
  };
  const barData2 = {
    labels: ['Security Reports', 'CCTV Reports'], // Correct labels
    datasets: [
      {
        label: 'Count',
        data: [
          dashboardData.securityReports, // Security Reports count
          dashboardData.cctvReports,    // CCTV Reports count
        ],
        backgroundColor: ['#F56565', '#63B3ED'], // Colors for each bar
      },
    ],
  };
  

  const handlePieClick = (event, elements, chartData, dataState) => {
    if (elements.length > 0) {
      const clickedIndex = elements[0].index;
      const clickedLabel = chartData.labels[clickedIndex];
  
      // Filter data based on the label
      const filteredData = dataState.filter(
        (item) => item.status?.trim() === clickedLabel
      );
  
      if (filteredData.length > 0) {
        setPopupData(filteredData);
        setPopupVisible(true);
      }
    }
  };
  

  const pieData = {
    labels: ['Open', 'Pending', 'In Progress', 'Resolved'],
    datasets: [
      {
        label: 'Feedback Complaints',
        data: [
          feedbackStatus['Open'],
          feedbackStatus['Pending'],
          feedbackStatus['In Progress'],
          feedbackStatus['Resolved'],
        ],
        backgroundColor: ['#F56565', '#63B3ED', '#48BB78', '#9F7AEA'],
      },
    ],
  };

  const jobSlipPieData = {
    labels: ['Open', 'Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        label: 'Job Slips',
        data: [
          jobSlipStatus['Open'],
          jobSlipStatus['Pending'],
          jobSlipStatus['In Progress'],
          jobSlipStatus['Completed'],
        ],
        backgroundColor: ['#F6AD55', '#ED8936', '#9F7AEA', '#68D391'],
      },
    ],
  };
  

  // const jobSlipData = {
  //   labels: ['Open', 'Pending', 'InProgress', 'Completed'],
  //   datasets: [
  //     {
  //       label: 'Job Slips',
  //       data: [
  //         jobSlipStatus['Open'],
  //         jobSlipStatus['Pending'],
  //         jobSlipStatus['InProgress'],
  //         jobSlipStatus.Completed,
  //       ],
  //       backgroundColor: ['#F6AD55', '#ED8936', '#9F7AEA', '#68D391'],
  //       hoverOffset: 4,
  //     },
  //   ],
  // };
  if (loading) {
    return (
      <Layout>
        <h2 className="text-3xl font-semibold">Loading...</h2>
      </Layout>
    );
  }
  return (
    <Layout>
  <h2 className="text-3xl font-semibold mb-6">Admin Dashboard</h2>
<AuthComponent></AuthComponent>
  {/* Overview Cards */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
    {[
      { label: 'Total Tenants', value: dashboardData.tenants, icon: <FaUsers className="text-blue-500" /> },
      { label: 'Supervisors', value: dashboardData.supervisors, icon: <FaCogs className="text-green-500" /> },
      { label: 'Technicians', value: dashboardData.technicians, icon: <FaClipboardList className="text-orange-500" /> },
      { label: 'Complaints', value: dashboardData.complaints, icon: <FaExclamationCircle className="text-red-500" /> },
      { label: 'Job Slips', value: dashboardData.jobSlips, icon: <FaClipboardCheck className="text-purple-500" /> },
      { label: 'Janitorial Reports', value: dashboardData.janitorialReports, icon: <MdCleanHands className="text-yellow-500" /> },
      { label: 'Security Reports', value: dashboardData.securityReports, icon: <MdSecurity className="text-indigo-500" /> },
      { label: 'CCTV Reports', value: dashboardData.cctvReports, icon: <MdCameraAlt className="text-teal-500" /> },
    ].map((item, index) => (
      <div
        key={index}
        className="p-4 bg-white shadow-lg rounded-lg flex items-center hover:shadow-xl transition-shadow duration-300"
      >
        {item.icon}
        <div className="ml-4">
          <h3 className="text-xl font-semibold">{item.label}</h3>
          <p className="text-2xl font-bold text-gray-700">{item.value}</p>
        </div>
      </div>
    ))}
  </div>

  {/* Pie Charts */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    {/* Feedback Complaints by Status */}
    <div className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold mb-4">Feedback Complaints by Status</h3>
      <div style={{ height: '400px', width: '100%' }}>
        <Pie
          data={pieData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => handlePieClick(event, elements, pieData, feedbackData, "feedback"),
          }}
        />
      </div>
    </div>

    {/* Job Slips by Status */}
    <div className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold mb-4">Job Slips by Status</h3>
      <div style={{ height: '400px', width: '100%' }}>
        <Pie
          data={jobSlipPieData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) =>
              handlePieClick(event, elements, jobSlipPieData, jobSlipDataState, "jobSlip"),
          }}
        />
      </div>
    </div>
  </div>

  {/* Bar Graphs */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Reports Overview */}
    <div className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold mb-4">Reports Overview</h3>
      <div style={{ height: '400px', width: '100%' }}>
        <Bar
          data={barData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
              if (elements.length > 0) {
                const clickedIndex = elements[0].index;
                const clickedLabel = barData.labels[clickedIndex];

                if (clickedLabel === 'Complaints') {
                  window.location.href = '/customer-relation/feedback-complain';
                } else if (clickedLabel === 'Job Slips') {
                  window.location.href = '/customer-relation/job-slip';
                } else if (clickedLabel === 'Janitorial Reports') {
                  window.location.href = '/janitorial/report';
                }
              }
            },
          }}
        />
      </div>
    </div>

    {/* Security Overview */}
    <div className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold mb-4">Security Overview</h3>
      <div style={{ height: '400px', width: '100%' }}>
        <Bar
          data={barData2}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
              if (elements.length > 0) {
                const clickedIndex = elements[0].index;
                const clickedLabel = barData2.labels[clickedIndex];

                if (clickedLabel === 'Security Reports') {
                  window.location.href = '/security-services/security-reports';
                } else if (clickedLabel === 'CCTV Reports') {
                  window.location.href = '/security-services/cctv-report';
                }
              }
            },
          }}
        />
      </div>
    </div>
  </div>

  {/* Popup */}
  {popupVisible && (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
      <div className="bg-white border shadow-xl p-6 rounded-lg max-w-lg w-full transform scale-105">
        <h4 className="text-lg font-semibold mb-4">Details</h4>
        <table className="min-w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">No</th>
              <th className="border px-4 py-2">Tenant ID</th>
              <th className="border px-4 py-2">Attended By</th>
              <th className="border px-4 py-2">Floor</th>
            </tr>
          </thead>
          <tbody>
            {popupData.map((item) => {
              const isComplaint = 'tenantId' in item;
              return (
                <tr
                  key={item.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    const targetPath = isComplaint
                      ? `/customer-relation/feedback-complain/view/${item.id}`
                      : `/customer-relation/job-slip/view/${item.id}`;
                    window.location.href = targetPath;
                  }}
                >
                  <td className="border px-4 py-2">{item.id}</td>
                  <td className="border px-4 py-2">{item.complainNo}</td>
                  <td className="border px-4 py-2">{item.tenantId || '-'}</td>
                  <td className="border px-4 py-2">{item.attendedBy || '-'}</td>
                  <td className="border px-4 py-2">{item.floorNo || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setPopupVisible(false)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}
    </Layout>

  );
};

export default Home;
