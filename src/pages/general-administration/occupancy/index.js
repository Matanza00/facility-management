// pages/general-administration/occupancy/index.js
import Layout from '../../../components/layout';

export default function OccupancyPage({ tenants }) {
  // Calculate total occupied area and percentage
  const totalOccupiedArea = tenants.reduce((sum, tenant) => sum + tenant.totalAreaSq, 0);
  const totalBuildingArea = 203943; // Total building area for percentage calculation
  const totalPercentage = ((totalOccupiedArea / totalBuildingArea) * 100).toFixed(2);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Occupancy Overview</h1>

        {/* Tenants Data Table */}
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Floor</th>
                <th className="px-4 py-2 text-left">Occupied By</th>
                <th className="px-4 py-2 text-right">Occupied Area</th>
                <th className="px-4 py-2 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {/* Map Tenants */}
              {tenants.length > 0 ? (
                tenants.map((tenant, index) => (
                  <tr key={index} className="text-center border-t">
                    <td className="px-4 py-2 text-left">
                      {tenant.area.map((area) => area.floor).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-2 text-left">{tenant.tenantName}</td>
                    <td className="px-4 py-2 text-right">{tenant.totalAreaSq.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      {((tenant.totalAreaSq / totalBuildingArea) * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-2 text-center text-gray-600">
                    No data available
                  </td>
                </tr>
              )}

              {/* Total Row */}
              <tr className="bg-gray-200 font-semibold border-t">
                <td className="px-4 py-2 text-left">Total</td>
                <td className="px-4 py-2 text-left">—</td>
                <td className="px-4 py-2 text-right">{totalOccupiedArea.toLocaleString()}</td>
                <td className="px-4 py-2 text-right">{totalPercentage}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  // Fetch tenant data from the API
  const res = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/occupancy`);
  const result = await res.json();

  return {
    props: {
      tenants: result.data || [],
    },
  };
}
