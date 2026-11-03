import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Star, Clock, Truck, ChevronDown, Utensils, Store } from 'lucide-react';
import { restaurantAPI, foodAPI } from '../services/api';
import RestaurantCard from '../components/common/RestaurantCard';
import FoodCard from '../components/common/FoodCard';

const CUISINES = ['Pizza', 'Burger', 'Biryani', 'Chinese', 'South Indian', 'North Indian', 'Desserts', 'Fast Food', 'Beverages'];
const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'rating', label: 'Rating' },
  { value: 'deliveryTime', label: 'Delivery Time' },
  { value: 'deliveryFee', label: 'Delivery Fee' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [totalFoods, setTotalFoods] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'restaurants' | 'dishes'

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const vegOnly = searchParams.get('veg') === 'true';
  const minRating = searchParams.get('rating') || '';

  const [localSearch, setLocalSearch] = useState(query);

  useEffect(() => {
    setLocalSearch(query);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const restParams = { limit: 24 };
        if (query) restParams.search = query;
        if (category) restParams.cuisine = category;
        if (sort) restParams.sort = sort;
        if (minRating) restParams.rating = minRating;
        if (vegOnly) restParams.isVeg = 'true';

        const foodParams = { limit: 24 };
        if (query) foodParams.search = query;
        if (category) foodParams.category = category;
        if (vegOnly) foodParams.isVeg = 'true';
        if (sort === 'rating') foodParams.sort = 'rating';

        const [restRes, foodRes] = await Promise.allSettled([
          restaurantAPI.getAll(restParams),
          foodAPI.getAll(foodParams),
        ]);

        if (restRes.status === 'fulfilled' && restRes.value?.data) {
          setRestaurants(restRes.value.data.restaurants || []);
          setTotalRestaurants(restRes.value.data.total || (restRes.value.data.restaurants?.length || 0));
        } else {
          setRestaurants([]);
          setTotalRestaurants(0);
        }

        if (foodRes.status === 'fulfilled' && foodRes.value?.data) {
          setFoods(foodRes.value.data.foods || []);
          setTotalFoods(foodRes.value.data.total || (foodRes.value.data.foods?.length || 0));
        } else {
          setFoods([]);
          setTotalFoods(0);
        }
      } catch (e) {
        console.error('Error searching:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, category, sort, vegOnly, minRating]);

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams.entries());
    if (value) params[key] = value;
    else delete params[key];
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('q', localSearch);
  };

  const clearAll = () => {
    setLocalSearch('');
    setSearchParams({});
  };

  const totalResults = totalRestaurants + totalFoods;

  return (
    <div className="page-container py-6 pb-20 md:pb-12 animate-fade-in">
      {/* Search Header */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="search-page-input"
            type="text"
            placeholder="Search restaurants, dishes, cuisines..."
            className="input-field pl-12 text-base h-12"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => { setLocalSearch(''); updateParam('q', ''); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button id="search-page-submit" type="submit" className="btn-primary flex-1 sm:flex-initial px-6 min-h-[48px] font-bold">
            Search
          </button>
          <button
            type="button"
            id="search-page-filter-btn"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all min-h-[48px] ${
              showFilters ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-primary-400'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6 animate-slide-up border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Filters &amp; Sort</h3>
            <button onClick={clearAll} className="text-primary-500 text-sm font-semibold hover:text-primary-600">
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {/* Sort */}
            <div>
              <label className="label">Sort By</label>
              <select className="input-field text-sm" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {/* Min Rating */}
            <div>
              <label className="label">Min Rating</label>
              <select className="input-field text-sm" value={minRating} onChange={(e) => updateParam('rating', e.target.value)}>
                <option value="">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
            {/* Veg Only */}
            <div>
              <label className="label">Dietary Preference</label>
              <button
                type="button"
                onClick={() => updateParam('veg', vegOnly ? '' : 'true')}
                className={`flex items-center gap-2 w-full input-field text-sm font-semibold transition-colors ${
                  vegOnly ? 'border-green-500 text-green-700 bg-green-50' : 'text-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 ${vegOnly ? 'bg-green-500 border-green-500' : 'border-gray-400'} flex items-center justify-center`}>
                  {vegOnly && <span className="text-white text-[10px]">✓</span>}
                </div>
                <span>Pure Veg Only</span>
              </button>
            </div>
          </div>

          {/* Cuisine Tags */}
          <div className="mt-5">
            <label className="label">Cuisine / Category</label>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateParam('category', category === c ? '' : c)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                    category === c
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400 hover:text-primary-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Badges */}
      {(query || category || sort || vegOnly || minRating) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {query && (
            <span className="badge-orange flex items-center gap-1.5 text-xs font-semibold">
              Query: &quot;{query}&quot;
              <button onClick={() => updateParam('q', '')}><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          {category && (
            <span className="badge-orange flex items-center gap-1.5 text-xs font-semibold">
              Category: {category}
              <button onClick={() => updateParam('category', '')}><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          {minRating && (
            <span className="badge-orange flex items-center gap-1.5 text-xs font-semibold">
              ⭐ {minRating}+
              <button onClick={() => updateParam('rating', '')}><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          {vegOnly && (
            <span className="badge-green flex items-center gap-1.5 text-xs font-semibold">
              🌱 Veg Only
              <button onClick={() => updateParam('veg', '')}><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
        </div>
      )}

      {/* Tabs: All / Restaurants / Dishes */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'all'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            All Results ({totalResults})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('restaurants')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'restaurants'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Restaurants ({totalRestaurants})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dishes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'dishes'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Dishes ({totalFoods})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-card border border-gray-100">
                <div className="skeleton aspect-[16/10] w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 flex items-center justify-center text-3xl mb-4 text-[#ff5200]">
            🔍
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">No matching results found</h3>
          <p className="text-gray-500 text-xs sm:text-sm mb-6 max-w-sm mx-auto">
            We couldn&apos;t find restaurants or dishes matching your criteria. Try adjusting your search or clearing filters.
          </p>
          <button onClick={clearAll} className="btn-primary text-sm px-6">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Restaurants Section */}
          {(activeTab === 'all' || activeTab === 'restaurants') && restaurants.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-orange-500" />
                  <span>Restaurants ({restaurants.length})</span>
                </h3>
              </div>
              <div className="restaurant-grid restaurant-grid--wide">
                {restaurants.map((r) => (
                  <RestaurantCard key={r._id} restaurant={r} />
                ))}
              </div>
            </section>
          )}

          {/* Dishes Section */}
          {(activeTab === 'all' || activeTab === 'dishes') && foods.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-500" />
                  <span>Dishes &amp; Delicacies ({foods.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {foods.map((food) => (
                  <FoodCard key={food._id} food={food} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
