import { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Search, Utensils, RefreshCw, Filter } from 'lucide-react';
import { foodAPI, restaurantAPI, categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { resolveFoodImageUrl, getFoodImageFallback } from '../../utils/foodImage';

const MENU_SECTIONS = [
  'All Sections',
  'Starters',
  'Main Course',
  'Biryani',
  'Pizza',
  'Burgers',
  'Sides',
  'Desserts',
  'Beverages',
  'Breakfast',
  'Recommended',
];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  restaurant: '',
  category: '',
  isVeg: false,
  isAvailable: true,
  preparationTime: 20,
  menuSection: 'Main Course',
  isFeatured: false,
};

export default function AdminFoods() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMealRoute = location.pathname.includes('meal');

  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [filterRestaurant, setFilterRestaurant] = useState('');
  const [filterSection, setFilterSection] = useState('All Sections');
  const [search, setSearch] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      restaurantAPI.getAll({ limit: 100 }),
      categoryAPI.getAll(),
    ])
      .then(([rRes, cRes]) => {
        setRestaurants(rRes.data.restaurants || []);
        setCategories(cRes.data.categories || []);
      })
      .catch(console.error);

    fetchFoods();
  }, []);

  // Listen to ?action=add in URL
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const fetchFoods = async (restaurantId) => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (restaurantId) params.restaurant = restaurantId;
      const { data } = await foodAPI.getAllAdmin(params);
      setFoods(data.foods || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key !== 'imageFile' && key !== 'image' && val !== undefined && val !== null) {
          formData.append(key, val);
        }
      });
      if (form.imageFile) formData.append('image', form.imageFile);

      if (editId) {
        await foodAPI.update(editId, formData);
        toast.success(isMealRoute ? 'Meal item updated!' : 'Food item updated!');
      } else {
        await foodAPI.create(formData);
        toast.success(isMealRoute ? 'Meal item created!' : 'Food item created!');
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      fetchFoods(filterRestaurant);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving item');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const label = isMealRoute ? 'meal' : 'food item';
    if (!window.confirm(`Delete this ${label}?`)) return;
    try {
      await foodAPI.delete(id);
      toast.success(`${isMealRoute ? 'Meal' : 'Food item'} deleted`);
      fetchFoods(filterRestaurant);
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  // Filter foods client-side by search and section
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesSearch =
        food.name?.toLowerCase().includes(search.toLowerCase()) ||
        food.description?.toLowerCase().includes(search.toLowerCase()) ||
        food.restaurant?.name?.toLowerCase().includes(search.toLowerCase()) ||
        food.category?.name?.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (filterSection !== 'All Sections' && food.menuSection !== filterSection) {
        return false;
      }
      return true;
    });
  }, [foods, search, filterSection]);

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-gray-900 tracking-tight">
            {isMealRoute ? 'Meal Management' : 'Food Items'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {isMealRoute
              ? 'Manage meal courses, combos and daily menus'
              : 'Manage menu items, prices, and restaurant recipes'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setForm(EMPTY_FORM);
              setEditId(null);
              setShowForm(true);
            }}
            id="add-food-header-btn"
            className="btn-primary py-2 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isMealRoute ? 'Add Meal' : 'Add Food Item'}</span>
          </button>

          <button
            onClick={() => fetchFoods(filterRestaurant)}
            title="Refresh list"
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
            placeholder={isMealRoute ? 'Search meals or combos...' : 'Search food items...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Restaurant Filter */}
          <select
            className="bg-slate-50 border border-gray-200 text-xs sm:text-sm font-medium rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 max-w-[180px] truncate"
            value={filterRestaurant}
            onChange={(e) => {
              setFilterRestaurant(e.target.value);
              fetchFoods(e.target.value);
            }}
          >
            <option value="">All Restaurants</option>
            {restaurants.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Section Filter */}
          <select
            className="bg-slate-50 border border-gray-200 text-xs sm:text-sm font-medium rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
          >
            {MENU_SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-gray-100">
              <tr>
                {['Item', 'Restaurant', 'Category', 'Price', 'Section', 'Type', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider ${
                      h === 'Actions' ? 'text-right' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="px-4 py-3.5">
                        <div className="skeleton h-8 rounded-lg" />
                      </td>
                    </tr>
                  ))
              ) : filteredFoods.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <Utensils className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-600">No items found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try adjusting filters or add a new {isMealRoute ? 'meal' : 'food item'}.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredFoods.map((food) => (
                  <tr key={food._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Item */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 border border-orange-100 flex-shrink-0 flex items-center justify-center">
                          <img
                            src={resolveFoodImageUrl(food)}
                            alt={food.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getFoodImageFallback(food, e.currentTarget.src);
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">{food.name}</p>
                          {food.isFeatured && (
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
                              ⭐ Bestseller
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Restaurant */}
                    <td className="px-4 py-3.5 text-xs text-slate-600">{food.restaurant?.name || '—'}</td>

                    {/* Category */}
                    <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">
                      {food.category?.name || '—'}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5 text-xs sm:text-sm">
                      <span className="font-bold text-slate-900">
                        ₹{food.discountPrice || food.price}
                      </span>
                      {food.discountPrice && (
                        <span className="text-gray-400 line-through text-xs ml-1.5">₹{food.price}</span>
                      )}
                    </td>

                    {/* Section */}
                    <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">{food.menuSection}</td>

                    {/* Type */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border ${
                          food.isVeg
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            food.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {food.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          food.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {food.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setForm({
                              ...food,
                              restaurant: food.restaurant?._id || '',
                              category: food.category?._id || '',
                            });
                            setEditId(food._id);
                            setShowForm(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(food._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-2xl animate-slide-up border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">
                {editId
                  ? isMealRoute
                    ? 'Edit Meal Item'
                    : 'Edit Food Item'
                  : isMealRoute
                  ? 'Add New Meal'
                  : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3.5">
              <div className="col-span-2">
                <label className="label text-xs font-bold text-slate-700">Item Name *</label>
                <input
                  className="input-field text-sm"
                  placeholder="e.g. Butter Chicken Combo, Margherita Pizza..."
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="label text-xs font-bold text-slate-700">Description *</label>
                <textarea
                  className="input-field text-sm h-16 resize-none"
                  placeholder="Appetizing description of ingredients, flavor and servings..."
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-slate-700">Restaurant *</label>
                <select
                  className="input-field text-sm py-2"
                  value={form.restaurant}
                  onChange={(e) => setForm((p) => ({ ...p, restaurant: e.target.value }))}
                  required
                >
                  <option value="">Select Restaurant...</option>
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label text-xs font-bold text-slate-700">Category / Cuisine *</label>
                <select
                  className="input-field text-sm py-2"
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  required
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label text-xs font-bold text-slate-700">Price (₹) *</label>
                <input
                  type="number"
                  className="input-field text-sm py-2"
                  placeholder="e.g. 299"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-slate-700">Discount Price (₹)</label>
                <input
                  type="number"
                  className="input-field text-sm py-2"
                  placeholder="Optional discounted price"
                  value={form.discountPrice || ''}
                  onChange={(e) => setForm((p) => ({ ...p, discountPrice: e.target.value }))}
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-slate-700">Menu Section / Course</label>
                <select
                  className="input-field text-sm py-2"
                  value={form.menuSection}
                  onChange={(e) => setForm((p) => ({ ...p, menuSection: e.target.value }))}
                >
                  {MENU_SECTIONS.filter((s) => s !== 'All Sections').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label text-xs font-bold text-slate-700">Prep Time (min)</label>
                <input
                  type="number"
                  className="input-field text-sm py-2"
                  value={form.preparationTime}
                  onChange={(e) => setForm((p) => ({ ...p, preparationTime: e.target.value }))}
                />
              </div>

              <div className="col-span-2 flex flex-wrap items-center gap-6 py-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isVeg}
                    onChange={(e) => setForm((p) => ({ ...p, isVeg: e.target.checked }))}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) => setForm((p) => ({ ...p, isAvailable: e.target.checked }))}
                    className="w-4 h-4 accent-primary-500 rounded"
                  />
                  <span>Available for Order</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                    className="w-4 h-4 accent-orange-500 rounded"
                  />
                  <span>Featured / Bestseller</span>
                </label>
              </div>

              <div className="col-span-2">
                <label className="label text-xs font-bold text-slate-700">Item Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field text-xs py-1.5"
                  onChange={(e) => setForm((p) => ({ ...p, imageFile: e.target.files[0] }))}
                />
              </div>

              <div className="col-span-2 flex gap-3 pt-3 border-t border-gray-100">
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
                  {formLoading ? 'Saving...' : editId ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
