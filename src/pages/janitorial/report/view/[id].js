import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../../../components/layout";

const ViewJanitorialReport = () => {
  const router = useRouter();
  const { id } = router.query; // Get the report ID from the URL
  const [loading, setLoading] = useState(true);
  const [janitorialReport, setJanitorialReport] = useState({
    date: "",
    supervisor: { id: "", name: "" },
    tenant: { id: "", name: "" },
    remarks: "",
    subJanReports: [], // Initialize with an empty array
  });

  // Fetch Janitorial Report on component load
  useEffect(() => {
    if (id) {
      fetch(`/api/janitorial-report/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setJanitorialReport({
            ...data,
            date: new Date(data.date).toISOString().split("T")[0], // Format date for display
            subJanReports: data.subJanReport || [], // Ensure `subJanReports` is an array
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch report:", err);
          setLoading(false);
        });
    }
  }, [id]);

  // Handle back button click
  const handleBack = () => {
    router.back(); // Navigate to the previous page in history
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">View Janitorial Inspection Report</h1>

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back
        </button>

        {/* Janitorial Report Fields */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div>
            <label className="block font-medium">Date</label>
            <p className="w-full p-2 border rounded bg-gray-200">{janitorialReport.date}</p>
          </div>
          <div>
            <label className="block font-medium">Supervisor</label>
            <p className="w-full p-2 border rounded bg-gray-200">
              {janitorialReport.supervisor.name} (ID: {janitorialReport.supervisor.id})
            </p>
          </div>
          <div>
            <label className="block font-medium">Tenant</label>
            <p className="w-full p-2 border rounded bg-gray-200">
              {janitorialReport.tenant.name} (ID: {janitorialReport.tenant.id})
            </p>
          </div>
          <div>
            <label className="block font-medium">Remarks</label>
            <p className="w-full p-2 border rounded bg-gray-200">{janitorialReport.remarks}</p>
          </div>
        </div>

        {/* Sub Reports Section */}
        <h2 className="text-xl font-semibold mb-4">Sub Reports</h2>
        {janitorialReport.subJanReports.map((subReport) => (
          <div key={subReport.id} className="mb-4 p-4 border rounded-lg bg-white">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-medium">Floor No</label>
                <p className="w-full p-2 border rounded bg-gray-200">{subReport.floorNo}</p>
              </div>
              <div>
                <label className="block font-medium">Toilet</label>
                <p className="w-full p-2 border rounded bg-gray-200">{subReport.toilet}</p>
              </div>
              <div>
                <label className="block font-medium">Lobby</label>
                <p className="w-full p-2 border rounded bg-gray-200">{subReport.lobby}</p>
              </div>
              <div>
                <label className="block font-medium">Staircase</label>
                <p className="w-full p-2 border rounded bg-gray-200">{subReport.staircase}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default ViewJanitorialReport;
