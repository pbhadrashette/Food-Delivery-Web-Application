import { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, X, Search, RefreshCw, Eye, LayoutGrid,
  Table as TableIcon, CheckCircle2, XCircle, UtensilsCrossed,
} from 'lucide-react';
import { categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { resolveCategoryImageUrl, getCategoryImageFallback } from '../../utils/foodImage';

const EMPTY_FORM = {
  name: '',
  description: '',
  icon: '',
  state: '',
  meal: '',
  sortOrder: 0,
  isActive: true,
};

export default function AdminCategories() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isCuisineRoute = location.pathname.includes('cuisine') || !location.pathname.includes('categories');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [viewItem, setViewItem] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await categoryAPI.getAllAdmin();
      setCategories(data.categories || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Open Add modal if url has ?action=add
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(true);
      // Clean query parameter from URL without page reload
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'imageFile' && k !== 'image' && v !== undefined && v !== null) {
          formData.append(k, v);
        }
      });
      if (form.imageFile) formData.append('image', form.imageFile);

      if (editId) {
        await categoryAPI.update(editId, formData);
        toast.success(isCuisineRoute ? 'Cuisine updated!' : 'Category updated!');
      } else {
        await categoryAPI.create(formData);
        toast.success(isCuisineRoute ? 'Cuisine created!' : 'Category created!');
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving cuisine');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const label = isCuisineRoute ? 'cuisine' : 'category';
    if (!window.confirm(`Delete this ${label}?`)) return;
    try {
      await categoryAPI.delete(id);
      toast.success(`${isCuisineRoute ? 'Cuisine' : 'Category'} deleted`);
      fetchCategories();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const toggleActive = async (cat) => {
    try {
      await categoryAPI.update(cat._id, { isActive: !cat.isActive });
      toast.success('Status updated');
      fetchCategories();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const openEdit = (cat) => {
    setForm({
      name: cat.name || '',
      description: cat.description || '',
      icon: cat.icon || '',
      state: cat.state || '',
      meal: cat.meal || '',
      sortOrder: cat.sortOrder || 0,
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setEditId(cat._id);
    setShowForm(true);
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name?.toLowerCase().includes(search.toLowerCase()) ||
        cat.description?.toLowerCase().includes(search.toLowerCase()) ||
        cat.state?.toLowerCase().includes(search.toLowerCase()) ||
        cat.meal?.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'Active') return cat.isActive === true;
      if (statusFilter === 'Inactive') return cat.isActive === false;
      return true;
    });
  }, [categories, search, statusFilter]);

  // Generate clean sequential ID like CUI-007, CUI-006 etc.
  const getCuisineId = (cat, index) => {
    const total = categories.length;
    const num = String(total - index).padStart(3, '0');
    return `CUI-${num}`;
  };

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-gray-900 tracking-tight">
            {isCuisineRoute ? 'Cuisine Management' : 'Category Management'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {isCuisineRoute
              ? 'Manage your cuisine catalog and meal associations'
              : 'Manage menu categories and food catalog'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setForm(EMPTY_FORM);
              setEditId(null);
              setShowForm(true);
            }}
            id="add-cuisine-header-btn"
            className="btn-primary py-2 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isCuisineRoute ? 'Add Cuisine' : 'Add Category'}</span>
          </button>

          <button
            onClick={fetchCategories}
            title="Refresh catalog"
            className="btn-secondary py-2 px-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary-500' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-3.5 rounded-2xl shadow-card border border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder={isCuisineRoute ? 'Search cuisines...' : 'Search categories...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Dropdown & View Mode */}
        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-gray-200 text-xs sm:text-sm font-medium rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={fetchCategories}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-slate-100 rounded-xl transition-all border border-gray-200"
            title="Reload data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-primary-600 shadow-xs font-bold'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
              title="Table view"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-xs font-bold'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-4 sm:px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isCuisineRoute ? 'Cuisine ID' : 'Category ID'}
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    State / Region
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Meal Association
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                    Photo
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i}>
                        <td colSpan={8} className="px-6 py-3.5">
                          <div className="skeleton h-8 rounded-lg" />
                        </td>
                      </tr>
                    ))
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      <UtensilsCrossed className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-600">No items found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try adjusting your search or add a new entry.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat, index) => {
                    const cuisineId = getCuisineId(cat, index);
                    return (
                      <tr
                        key={cat._id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Cuisine ID */}
                        <td className="px-4 sm:px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-orange-100 text-primary-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                              C
                            </span>
                            <span className="text-xs font-bold text-slate-700 font-mono tracking-tight">
                              {cuisineId}
                            </span>
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">
                            {cat.name}
                          </p>
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3.5 text-xs text-slate-600 max-w-[200px] truncate">
                          {cat.description || '—'}
                        </td>

                        {/* State */}
                        <td className="px-4 py-3.5 text-xs text-slate-600">
                          {cat.state || 'Maharashtra'}
                        </td>

                        {/* Meal */}
                        <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">
                          {cat.meal || '—'}
                        </td>

                        {/* Photo / Icon */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-orange-50 border border-orange-100 mx-auto flex items-center justify-center flex-shrink-0 shadow-2xs">
                            <img
                              src={resolveCategoryImageUrl(cat)}
                              alt={cat.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getCategoryImageFallback(cat, e.currentTarget.src);
                              }}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => toggleActive(cat)}
                            title="Click to toggle status"
                            className="inline-block transition-transform hover:scale-105"
                          >
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border ${
                                cat.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  cat.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                              {cat.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 sm:px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewItem(cat)}
                              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-orange-50 rounded-lg transition-all"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEdit(cat)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat._id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading
            ? Array(10)
                .fill(0)
                .map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)
            : filteredCategories.map((cat) => (
                <div
                  key={cat._id}
                  className={`bg-white rounded-2xl p-4 shadow-card border border-gray-100 text-center relative group hover:border-orange-200 transition-all ${
                    !cat.isActive ? 'opacity-65' : ''
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 mx-auto mb-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={resolveCategoryImageUrl(cat)}
                      alt={cat.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getCategoryImageFallback(cat, e.currentTarget.src);
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm truncate">{cat.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                    {cat.description || (cat.isActive ? 'Active' : 'Inactive')}
                  </p>
                  <span
                    className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      cat.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>

                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1 bg-white shadow-xs rounded-lg text-blue-500 hover:bg-blue-50 border border-gray-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-1 bg-white shadow-xs rounded-lg text-red-500 hover:bg-red-50 border border-gray-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-slide-up border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {editId
                    ? isCuisineRoute
                      ? 'Edit Cuisine'
                      : 'Edit Category'
                    : isCuisineRoute
                    ? 'Add New Cuisine'
                    : 'Add New Category'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Enter details to save to catalog database
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="label text-xs font-bold text-slate-700">
                  {isCuisineRoute ? 'Cuisine Name *' : 'Category Name *'}
                </label>
                <input
                  className="input-field text-sm"
                  placeholder="e.g. Italian, North Indian, Pizza..."
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-slate-700">Description</label>
                <textarea
                  className="input-field text-sm h-18 resize-none"
                  placeholder="Short description of this cuisine..."
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs font-bold text-slate-700">State / Region</label>
                  <input
                    className="input-field text-sm"
                    placeholder="e.g. Maharashtra, Punjab..."
                    value={form.state}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold text-slate-700">Meal Association</label>
                  <input
                    className="input-field text-sm"
                    placeholder="e.g. MEAL-001 - Samosa"
                    value={form.meal}
                    onChange={(e) => setForm((p) => ({ ...p, meal: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs font-bold text-slate-700">Icon (Emoji)</label>
                  <input
                    className="input-field text-sm"
                    placeholder="🍕 or 🥘"
                    value={form.icon}
                    onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold text-slate-700">Sort Order</label>
                  <input
                    type="number"
                    className="input-field text-sm"
                    value={form.sortOrder}
                    onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs font-bold text-slate-700">Photo / Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field py-1.5 text-xs"
                  onChange={(e) => setForm((p) => ({ ...p, imageFile: e.target.files[0] }))}
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-primary-500 rounded"
                  />
                  <span>Active Catalog Item</span>
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1 text-sm font-semibold py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-primary flex-1 text-sm font-semibold py-2.5"
                >
                  {formLoading ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewItem && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setViewItem(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up border border-gray-100 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 mx-auto mb-3 flex items-center justify-center overflow-hidden">
              {viewItem.image ? (
                <img
                  src={
                    viewItem.image.startsWith('http')
                      ? viewItem.image
                      : `${API_BASE}${viewItem.image}`
                  }
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <span className="text-3xl">{viewItem.icon || '🍽️'}</span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-base">{viewItem.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{viewItem.description || 'No description provided'}</p>

            <div className="my-4 py-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-left px-4">
              <div className="flex justify-between">
                <span className="text-slate-400">State / Region:</span>
                <span className="font-semibold text-slate-700">{viewItem.state || 'Maharashtra'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Meal Association:</span>
                <span className="font-semibold text-slate-700">{viewItem.meal || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={`font-semibold ${viewItem.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                  {viewItem.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setViewItem(null)}
              className="btn-secondary w-full text-xs font-semibold py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
