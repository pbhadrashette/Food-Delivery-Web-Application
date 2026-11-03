import { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingBag, Users, Store, Clock, CheckCircle,
  XCircle, ArrowUp, ArrowDown, Flame, Trophy, Sparkles, BarChart3,
  Activity, DollarSign, Package, Star,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f97316'];
const STATUS_COLORS = {
  PLACED: '#3b82f6', CONFIRMED: '#6366f1', PREPARING: '#f97316',
  READY_FOR_PICKUP: '#8b5cf6', OUT_FOR_DELIVERY: '#f97316',
  DELIVERED: '#10b981', CANCELLED: '#ef4444',
};

const STAT_CONFIG = [
  { key: 'totalRevenue',     title: 'Total Revenue',   icon: DollarSign,    gradient: 'from-orange-500 to-orange-500',   glow: 'rgba(249,115,22,0.4)',  prefix: '₹' },
  { key: 'totalOrders',      title: 'Total Orders',    icon: Package,       gradient: 'from-blue-500 to-cyan-400',      glow: 'rgba(59,130,246,0.4)' },
  { key: 'totalCustomers',   title: 'Customers',       icon: Users,         gradient: 'from-violet-500 to-purple-600',  glow: 'rgba(139,92,246,0.4)' },
  { key: 'totalRestaurants', title: 'Restaurants',     icon: Store,         gradient: 'from-emerald-500 to-teal-400',   glow: 'rgba(16,185,129,0.4)' },
  { key: 'pendingOrders',    title: 'Pending',         icon: Clock,         gradient: 'from-orange-500 to-orange-400',   glow: 'rgba(249,115,22,0.4)' },
  { key: 'deliveredOrders',  title: 'Delivered',       icon: CheckCircle,   gradient: 'from-green-500 to-emerald-400',  glow: 'rgba(16,185,129,0.4)' },
  { key: 'cancelledOrders',  title: 'Cancelled',       icon: XCircle,       gradient: 'from-red-500 to-rose-500',       glow: 'rgba(239,68,68,0.4)' },
];

const MEDAL_COLORS = ['#f97316', '#9ca3af', '#cd7c2f'];

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '10px 16px', backdropFilter: 'blur(12px)', boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)' }}>
      <p style={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>{label?.slice(5)}</p>
      <p style={{ color: '#0f172a', fontWeight: 800, fontSize: '15px' }}>₹{Number(payload[0]?.value || 0).toLocaleString()}</p>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, gradient, glow, change, prefix = '', index = 0 }) {
  const isPositive = change >= 0;
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white border border-gray-200 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
        style={{ background: glow }}
      />
      <div className="absolute top-0 left-4 right-4 h-px rounded-full opacity-40" style={{ background: `linear-gradient(to right, transparent, ${glow}, transparent)` }} />

      <div className="relative z-10 flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}
          style={{ boxShadow: `0 10px 20px ${glow}` }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-1.5">{title}</p>
      <p className="text-slate-900 text-2xl font-display font-black leading-none">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function PanelCard({ children, className = '', style = {} }) {
  return (
    <div
      className={`rounded-2xl p-5 bg-white border border-gray-200 shadow-[0_10px_24px_rgba(15,23,42,0.05)] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

function PanelTitle({ children, sub }) {
  return (
    <div className="mb-5">
      <h3 className="font-display font-bold text-slate-900 text-base leading-tight">{children}</h3>
      {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="skeleton-dark h-20 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton-dark h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="skeleton-dark lg:col-span-2 h-72 rounded-2xl" />
        <div className="skeleton-dark h-72 rounded-2xl" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <LoadingSkeleton />;

  const stats          = data?.stats || {};
  const revenueData    = data?.revenueByDay || [];
  const statusDist     = (data?.statusDistribution || []).map((s) => ({
    name:  s._id.replace(/_/g, ' '),
    value: s.count,
    color: STATUS_COLORS[s._id],
  }));
  const topRestaurants = data?.topRestaurants || [];
  const topFoods       = data?.topFoods || [];

  const avgOrder = stats.deliveredOrders
    ? Math.round(stats.totalRevenue / stats.deliveredOrders)
    : 0;

  const allStats = [
    ...STAT_CONFIG.map((c) => ({ ...c, value: stats[c.key] || 0 })),
    { key: 'avgOrder', title: 'Avg. Order', icon: TrendingUp, gradient: 'from-indigo-500 to-blue-500', glow: 'rgba(99,102,241,0.4)', prefix: '₹', value: avgOrder },
  ];

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Welcome Banner ── */}
      <div
        className="relative rounded-2xl px-6 py-5 overflow-hidden flex items-center justify-between border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-orange-50 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
      >
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent" />

        <div className="relative z-10">
          <h1 className="text-xl font-display font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_10px_18px_rgba(249,115,22,0.25)] flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {greeting()}, {data?.adminName || 'Admin'} 👋
          </h1>
          <p className="text-slate-600 text-sm mt-1 ml-10">
            Here's what's happening with your platform today.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Today</p>
              <p className="text-slate-800 font-bold text-sm mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-orange-50 border border-orange-200">
              <p className="text-[10px] uppercase tracking-widest font-bold text-orange-500">Orders</p>
              <p className="text-primary-600 font-black text-sm mt-0.5">{(stats.totalOrders || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_10px_18px_rgba(249,115,22,0.25)]">
            <Flame className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {allStats.map((s, i) => (
          <StatCard key={s.key} index={i} {...s} />
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue Area Chart */}
        <PanelCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base">Revenue Trend</h3>
              <p className="text-slate-500 text-xs mt-0.5">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-2">
              {revenueData.length > 0 && (
                <div className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-green-200">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Live
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200">
                <Activity className="w-3.5 h-3.5" />
                7 days
              </div>
            </div>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" vertical={false} />
                <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ stroke: 'rgba(249,115,22,0.15)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#f97316', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#f97316', stroke: 'rgba(249,115,22,0.35)', strokeWidth: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-slate-400">
              <BarChart3 className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No revenue data yet. Place some orders!</p>
            </div>
          )}
        </PanelCard>

        {/* Status Donut */}
        <PanelCard>
          <PanelTitle sub="Distribution by status">Order Status</PanelTitle>
          {statusDist.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusDist}
                    cx="50%" cy="50%"
                    innerRadius={46} outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusDist.map((entry, i) => (
                      <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', backdropFilter: 'blur(12px)' }}
                    formatter={(val, name) => [val, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusDist.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || COLORS[i] }} />
                      <span className="text-slate-500 text-xs capitalize">{item.name.toLowerCase()}</span>
                    </div>
                    <span className="text-slate-800 text-xs font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No orders yet</div>
          )}
        </PanelCard>
      </div>

      {/* ── Top Performers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top Restaurants */}
        <PanelCard>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center border border-orange-200">
              <Trophy className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Top Restaurants</h3>
              <p className="text-slate-500 text-[10px]">By order volume</p>
            </div>
          </div>
          {topRestaurants.length > 0 ? (
            <div className="space-y-3.5">
              {topRestaurants.map((item, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{
                      background: i < 3 ? `${MEDAL_COLORS[i]}18` : '#f8fafc',
                      color: i < 3 ? MEDAL_COLORS[i] : '#64748b',
                      border: `1px solid ${i < 3 ? MEDAL_COLORS[i] + '35' : '#e2e8f0'}`,
                    }}
                  >
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate leading-tight">{item.restaurant?.name}</p>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((item.totalOrders / (topRestaurants[0]?.totalOrders || 1)) * 100, 100)}%`,
                          background: i < 3 ? MEDAL_COLORS[i] : '#f97316',
                          boxShadow: i < 3 ? `0 0 8px ${MEDAL_COLORS[i]}60` : '0 0 8px rgba(249,115,22,0.2)',
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-slate-900 text-xs font-bold">{item.totalOrders} orders</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">₹{(item.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Store className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No data yet</p>
            </div>
          )}
        </PanelCard>

        {/* Top Foods / Best Sellers */}
        <PanelCard>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center border border-orange-200">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Best Sellers</h3>
              <p className="text-slate-500 text-[10px]">Most ordered dishes</p>
            </div>
          </div>
          {topFoods.length > 0 ? (
            <div className="space-y-3.5">
              {topFoods.map((food, i) => (
                <div key={food._id} className="flex items-center gap-3 group">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{
                      background: i < 3 ? `${MEDAL_COLORS[i]}18` : '#f8fafc',
                      color: i < 3 ? MEDAL_COLORS[i] : '#64748b',
                      border: `1px solid ${i < 3 ? MEDAL_COLORS[i] + '35' : '#e2e8f0'}`,
                    }}
                  >
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate leading-tight">{food.name}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5 truncate">{food.restaurant?.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-slate-900 text-xs font-bold">{food.totalOrders} sold</p>
                    <p className="text-primary-500 text-[10px] font-semibold mt-0.5">₹{food.price}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <ShoppingBag className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No data yet</p>
            </div>
          )}
        </PanelCard>
      </div>
    </div>
  );
}
