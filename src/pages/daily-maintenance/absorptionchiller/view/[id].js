import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../../../components/layout';

export default function HotWaterBoilerViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const res = await fetch(`/api/absorptionchiller/${id}`);
          if (!res.ok) {
            throw new Error(`Failed to fetch data: ${res.status}`);
          }
          const result = await res.json();
          setData(result);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError(err.message);
        }
      }
    };
    fetchData();
  }, [id]);

  if (error) {
    return (
      <Layout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <h1 className="text-3xl font-semibold mb-8 text-gray-800">Error</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!data) return <p>Loading...</p>;

  console.log(data)
  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-semibold mb-8 text-gray-800">Absorption Chiller Report Details</h1>

        {/* Chiller Details */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Chiller Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-600">
            <p>
              <strong>Date:</strong> {new Date(data.StartTime).toLocaleDateString()}
            </p>
            <p>
              <strong>Start Time:</strong> {new Date(data.StartTime).toLocaleTimeString()}
            </p>
            <p>
              <strong>Shutdown Time:</strong> {new Date(data.ShutdownTime).toLocaleTimeString()}
            </p>
            <p>
              <strong>Operator:</strong> {data.OperatorName}
            </p>
            <p>
              <strong>Supervisor:</strong> {data.SupervisorName}
            </p>
            <p>
              <strong>Remarks:</strong> {data.Remarks || 'N/A'}
            </p>
          </div>
        </div>

        {/* Time Hour Reports */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">Time Hour Reports</h2>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Time</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Cold Water In</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Cold Water Out</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Chilling Water In</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Chilling Water Out</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Asst. Supervisor</th>
              </tr>
            </thead>
            <tbody>
              {(data.Chillers || []).map((report, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">
                    {new Date(report.time).toLocaleTimeString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">
                    {new Date(report.time).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">{report.ColdWaterIn} °C</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">{report.ColdWaterOut} °C</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">{report.ChillingWaterIn} °C</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">{report.ChillingWaterOut} bar</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">
                    {report.assistantSupervisor || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
