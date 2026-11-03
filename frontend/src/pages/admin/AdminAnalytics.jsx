import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-48 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  const revenueData = data?.monthlyRevenue || [];
  const topFoods = data?.topFoods || [];

  const statCards = [
    { label: 'Avg. Order Value', value: `₹${data?.avgOrderValue || 0}`, color: 'bg-primary-100 text-primary-700' },
    { label: 'New Customers (30d)', value: data?.newCustomers || 0, color: 'bg-blue-100 text-blue-700' },
    { label: 'Cancellation Rate', value: `${data?.cancellationRate || 0}%`, color: 'bg-red-100 text-red-700' },
    { label: 'Revenue (30d)', value: `₹${revenueData.reduce((acc, d) => acc + d.revenue, 0).toLocaleString()}`, color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-display font-bold text-gray-900">Analytics (Last 30 Days)</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-card">
            <p className="text-gray-500 text-sm">{label}</p>
            <p className={`text-2xl font-display font-bold mt-1 ${color.split(' ')[1]}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-gray-900 mb-4">Daily Revenue & Orders</h3>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(8)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(val, name) => [name === 'revenue' ? `₹${val}` : val, name === 'revenue' ? 'Revenue' : 'Orders']} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#colorRevenue)" name="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-52 flex items-center justify-center text-gray-400">
            <p>No revenue data yet. Start getting orders!</p>
          </div>
        )}
      </div>

      {/* Top Foods */}
      {topFoods.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-gray-900 mb-4">Top Selling Food Items</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topFoods.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(val) => [`${val} sold`, 'Orders']} />
              <Bar dataKey="totalOrders" fill="#f97316" radius={[0, 6, 6, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
