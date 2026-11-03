import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Truck, MapPin, Phone, Info, ChevronDown, AlertCircle, ShoppingCart } from 'lucide-react';
import { restaurantAPI, reviewAPI } from '../services/api';
import FoodCard from '../components/common/FoodCard';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import {
  API_ORIGIN,
  resolveRestaurantCoverUrl,
  getRestaurantCoverFallback,
  resolveRestaurantLogoUrl,
  getRestaurantLogoFallback,
} from '../utils/restaurantImage';

function ConflictModal({ show, onClear, onCancel }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-display font-bold text-gray-900">Items already in cart</h3>
        </div>
        <p className="text-gray-600 text-sm mb-6">Your cart has items from another restaurant. Would you like to clear the cart and add this item?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 btn-secondary py-2.5 text-sm">Keep Cart</button>
          <button onClick={onClear} className="flex-1 btn-primary py-2.5 text-sm">Clear & Add</button>
        </div>
      </div>
    </div>
  );
}

export default function RestaurantPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('');
  const [vegFilter, setVegFilter] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const { itemCount, subtotal, clearCart, addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [restRes, reviewRes] = await Promise.all([
          restaurantAPI.getOne(id),
          reviewAPI.getForRestaurant(id),
        ]);
        setRestaurant(restRes.data.restaurant);
        setMenu(restRes.data.menu);
        setReviews(reviewRes.data.reviews);
        const firstSection = Object.keys(restRes.data.menu)[0];
        if (firstSection) setActiveSection(firstSection);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleClearAndAdd = async () => {
    await clearCart();
    if (conflictInfo?.food) {
      const foodId = conflictInfo.food._id;
      setConflictInfo(null);
      const result = await addToCart(foodId, 1);
      if (result?.success) toast.success('Cart cleared and item added!');
    } else {
      setConflictInfo(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="skeleton h-64 w-full rounded-none" />
        <div className="page-container py-6 space-y-4">
          <div className="skeleton h-8 w-64" />
          <div className="skeleton h-4 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="page-container py-20 text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant not found</h2>
        <Link to="/" className="btn-primary mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const coverImg = resolveRestaurantCoverUrl(restaurant);

  const sections = Object.keys(menu);
  const filteredMenu = {};
  sections.forEach((section) => {
    const items = vegFilter ? menu[section].filter((f) => f.isVeg) : menu[section];
    if (items.length > 0) filteredMenu[section] = items;
  });

  return (
    <div className="pb-28 md:pb-10">
      <ConflictModal show={!!conflictInfo} onClear={handleClearAndAdd} onCancel={() => setConflictInfo(null)} />

      {/* Cover Image */}
      <div className="relative h-56 md:h-72 overflow-hidden bg-gray-900">
        <img
          src={coverImg}
          alt={restaurant.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getRestaurantCoverFallback(restaurant, e.currentTarget.src);
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 page-container pb-6">
          <div className="flex items-end gap-4">
            <img
              src={resolveRestaurantLogoUrl(restaurant)}
              alt={restaurant.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getRestaurantLogoFallback(restaurant, e.currentTarget.src);
              }}
              className="w-16 h-16 rounded-2xl border-2 border-white shadow-lg object-cover flex-shrink-0 bg-white"
            />
            <div>
              <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white drop-shadow-sm">{restaurant.name}</h1>
              <p className="text-white/90 text-sm font-medium">{restaurant.cuisine?.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Info Bar */}
        <div className="bg-white rounded-2xl shadow-card -mt-4 relative z-10 p-4 md:p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-white" />
                <span className="text-sm">{restaurant.rating?.toFixed(1)}</span>
              </div>
              <span className="text-gray-500 text-sm">{restaurant.totalRatings?.toLocaleString()} ratings</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 text-sm">
              <Clock className="w-4 h-4 text-primary-500" />
              <span className="font-medium">{restaurant.deliveryTime} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 text-sm">
              <Truck className="w-4 h-4 text-primary-500" />
              <span className="font-medium">₹{restaurant.deliveryFee} delivery</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 text-sm">
              <MapPin className="w-4 h-4 text-primary-500" />
              <span>{restaurant.city}</span>
            </div>
            {restaurant.discount && (
              <div className="ml-auto">
                <span className="bg-primary-50 text-primary-600 font-semibold text-sm px-3 py-1.5 rounded-xl border border-primary-200">
                  🏷️ {restaurant.discount}
                </span>
              </div>
            )}
          </div>

          {restaurant.description && (
            <p className="text-gray-600 text-sm mt-3 border-t border-gray-100 pt-3">{restaurant.description}</p>
          )}
        </div>

        <div className="flex gap-6">
          {/* Menu Sidebar - Desktop */}
          <div className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-20 bg-white rounded-2xl shadow-card overflow-hidden">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => {
                    setActiveSection(section);
                    document.getElementById(`section-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-l-4 ${activeSection === section ? 'text-primary-600 bg-orange-50 border-primary-500' : 'text-gray-600 hover:bg-gray-50 border-transparent'}`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Content */}
          <div className="flex-1 min-w-0">
            {/* Filters */}
            <div className="flex items-center gap-3 mb-6 sticky top-16 bg-gray-50 py-3 z-20">
              <button
                onClick={() => setVegFilter(!vegFilter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${vegFilter ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-green-400'}`}
              >
                <div className={`w-3 h-3 rounded border-2 ${vegFilter ? 'border-white' : 'border-green-600'} flex items-center justify-center`}>
                  {vegFilter && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                Veg Only
              </button>

              <button
                onClick={() => setShowReviews(!showReviews)}
                className="ml-auto flex items-center gap-2 text-primary-500 hover:text-primary-600 text-sm font-medium"
              >
                <Star className="w-4 h-4" /> Reviews ({reviews.length})
              </button>
            </div>

            {/* Reviews Panel */}
            {showReviews && (
              <div className="mb-8 bg-white rounded-2xl shadow-card p-6 animate-slide-up">
                <h3 className="font-display font-bold text-gray-900 text-lg mb-4">Customer Reviews</h3>
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-brand rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {review.user?.name?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{review.user?.name}</p>
                            <div className="flex gap-1">
                              {Array(5).fill(0).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.restaurantRating ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        {review.comment && <p className="text-gray-600 text-sm ml-11">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Menu Sections */}
            {Object.keys(filteredMenu).length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🌱</p>
                <p className="text-gray-500 font-medium">No veg items available in this restaurant</p>
              </div>
            ) : (
              Object.entries(filteredMenu).map(([section, items]) => (
                <div key={section} id={`section-${section}`} className="mb-8 scroll-mt-20">
                  <h2 className="font-display font-bold text-gray-900 text-xl mb-4 pb-2 border-b border-gray-100">
                    {section} <span className="text-gray-400 font-normal text-base">({items.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {items.map((food) => (
                      <FoodCard key={food._id} food={food} onConflict={(info) => setConflictInfo(info)} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sticky Cart Bar (mobile) */}
      {itemCount > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-4 right-4 z-30 animate-slide-up">
          <Link to="/cart" className="bg-primary-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-glow shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl px-2 py-1 text-sm font-bold">{itemCount} items</div>
              <span className="font-semibold">View Cart</span>
            </div>
            <div className="flex items-center gap-2 font-bold">
              <span>₹{subtotal}</span>
              <ShoppingCart className="w-5 h-5" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
