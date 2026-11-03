import { Star, Clock, Truck, Heart, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { getRestaurantCoverFallback, resolveRestaurantCoverUrl, SAFE_RESTAURANT_PLACEHOLDER } from '../../utils/restaurantImage';
import toast from 'react-hot-toast';

export default function RestaurantCard({ restaurant, onFavoriteToggle }) {
  const { isAuthenticated, user } = useAuth();
  const [isFav, setIsFav] = useState(user?.favoriteRestaurants?.some((r) => (r._id || r) === restaurant._id));
  const [favLoading, setFavLoading] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => resolveRestaurantCoverUrl(restaurant));
  const [imgFailedOnce, setImgFailedOnce] = useState(false);

  useEffect(() => {
    setImgSrc(resolveRestaurantCoverUrl(restaurant));
    setImgFailedOnce(false);
  }, [restaurant._id, restaurant.coverImage, restaurant.name, restaurant.cuisine]);

  const handleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Login to save favorites'); return; }
    try {
      setFavLoading(true);
      const { data } = await userAPI.toggleFavRestaurant(restaurant._id);
      setIsFav(data.isFavorite);
      toast.success(data.isFavorite ? 'Added to favorites!' : 'Removed from favorites');
      onFavoriteToggle?.();
    } catch (e) { toast.error('Failed to update favorites'); }
    finally { setFavLoading(false); }
  };

  const ratingLabel = restaurant.rating?.toFixed(1) || '4.0';
  const ratingCount = restaurant.totalRatings > 0 ? restaurant.totalRatings : null;
  const deliveryTimeLabel = String(restaurant.deliveryTime || '30-45').includes('min')
    ? restaurant.deliveryTime
    : `${restaurant.deliveryTime} min`;

  return (
    <Link
      to={`/restaurant/${restaurant._id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-orange-100 hover:shadow-lg animate-fade-in"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50">
        <img
          src={imgSrc}
          alt={`${restaurant.name} — ${restaurant.cuisine?.[0] || 'restaurant'}`}
          loading="lazy"
          decoding="async"
          width={640}
          height={400}
          onError={() => {
            if (!imgFailedOnce) {
              setImgFailedOnce(true);
              setImgSrc(getRestaurantCoverFallback(restaurant, imgSrc));
            } else if (imgSrc !== SAFE_RESTAURANT_PLACEHOLDER) {
              setImgSrc(SAFE_RESTAURANT_PLACEHOLDER);
            }
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

        {restaurant.discount && (
          <div className="absolute bottom-3 left-3 max-w-[85%]">
            <span className="inline-block truncate rounded-lg bg-[#ff5200] px-2.5 py-1 text-xs font-bold text-white shadow-md">
              {restaurant.discount}
            </span>
          </div>
        )}

        {restaurant.isVeg && (
          <div className="absolute top-3 left-3">
            <span className="badge-green text-[10px] shadow-sm">Pure Veg</span>
          </div>
        )}

        {restaurant.featured && !restaurant.isVeg && (
          <div className="absolute top-3 left-3">
            <span className="rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-600 shadow-sm">
              Popular
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleFav}
          disabled={favLoading}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-200 ${isFav ? 'bg-red-500 text-white' : 'bg-white/95 text-gray-500 hover:text-red-500'}`}
        >
          <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#ff5200] line-clamp-1">
              {restaurant.name}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">{restaurant.cuisine?.join(' • ') || restaurant.city}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <div className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 ring-1 ring-emerald-100">
              <Star className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-800">{ratingLabel}</span>
            </div>
            {ratingCount && (
              <span className="text-[10px] font-medium text-gray-400">{ratingCount.toLocaleString()} ratings</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-100 pt-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1 font-medium">
            <Clock className="h-3.5 w-3.5 text-[#ff5200]" />
            {deliveryTimeLabel}
          </span>
          <span className="text-gray-300">|</span>
          <span className="inline-flex items-center gap-1 font-medium">
            <Truck className="h-3.5 w-3.5 text-[#ff5200]" />
            ₹{restaurant.deliveryFee} delivery
          </span>
          <span className="ml-auto inline-flex items-center gap-0.5 font-semibold text-gray-500">
            <IndianRupee className="h-3 w-3" />
            {restaurant.priceForTwo} for two
          </span>
        </div>
      </div>
    </Link>
  );
}
