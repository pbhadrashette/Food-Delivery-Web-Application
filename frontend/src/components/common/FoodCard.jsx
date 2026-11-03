import { useState, useEffect } from 'react';
import { Plus, Minus, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { resolveFoodImageUrl, getFoodImageFallback, SAFE_FOOD_PLACEHOLDER } from '../../utils/foodImage';
import toast from 'react-hot-toast';

export default function FoodCard({ food, onConflict }) {
  const { addToCart, updateItem, removeItem, getItemQuantity, cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => resolveFoodImageUrl(food));
  const [imgFailed, setImgFailed] = useState(false);
  const quantity = getItemQuantity(food._id);

  useEffect(() => {
    setImgSrc(resolveFoodImageUrl(food));
    setImgFailed(false);
  }, [food?._id, food?.image, food?.name]);

  const effectivePrice = food.discountPrice || food.price;
  const hasDiscount = food.discountPrice && food.discountPrice < food.price;

  const handleAdd = async () => {
    setLoading(true);
    const result = await addToCart(food._id, 1);
    if (result?.conflict) {
      onConflict?.({ food, existingRestaurant: cart.restaurant });
    }
    setLoading(false);
  };

  const handleIncrease = async () => {
    const item = cart.items?.find((i) => (i.food?._id || i.food)?.toString() === food._id.toString());
    if (item) await updateItem(item._id, quantity + 1);
  };

  const handleDecrease = async () => {
    const item = cart.items?.find((i) => (i.food?._id || i.food)?.toString() === food._id.toString());
    if (item) {
      if (quantity === 1) await removeItem(item._id);
      else await updateItem(item._id, quantity - 1);
    }
  };

  return (
    <div className="food-card flex gap-3 sm:gap-4 p-3.5 sm:p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-card transition-all duration-200 group h-full justify-between">
      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Veg/Non-veg indicator */}
        <div className="flex items-center gap-2 mb-2">
          {food.isVeg ? (
            <div className="veg-dot"><div className="w-2 h-2 bg-green-600 rounded-full" /></div>
          ) : (
            <div className="nonveg-dot"><div className="w-2 h-2 bg-red-600 rounded-full" /></div>
          )}
          {food.isFeatured && <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">⭐ Bestseller</span>}
        </div>

        <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1 truncate">{food.name}</h4>

        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="font-bold text-gray-900 text-sm">₹{effectivePrice}</span>
          {hasDiscount && <span className="text-gray-400 line-through text-xs">₹{food.price}</span>}
          {hasDiscount && <span className="text-green-600 text-xs font-semibold">{Math.round(((food.price - food.discountPrice) / food.price) * 100)}% off</span>}
        </div>

        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{food.description}</p>

        {food.rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3 h-3 text-orange-400 fill-orange-400 flex-shrink-0" />
            <span className="text-xs text-gray-500">{food.rating?.toFixed(1)} ({food.totalRatings} ratings)</span>
          </div>
        )}
      </div>

      {/* Image + Add Button */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-orange-50/50">
          <img
            src={imgSrc}
            alt={food.name}
            onError={() => {
              if (!imgFailed) {
                setImgFailed(true);
                setImgSrc(getFoodImageFallback(food, imgSrc));
              } else if (imgSrc !== SAFE_FOOD_PLACEHOLDER) {
                setImgSrc(SAFE_FOOD_PLACEHOLDER);
              }
            }}
            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {!food.isAvailable ? (
          <span className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-lg">Unavailable</span>
        ) : quantity === 0 ? (
          <button
            onClick={handleAdd}
            disabled={loading}
            className="food-card-add-btn w-20 sm:w-24 flex items-center justify-center gap-1 bg-white border-2 border-primary-500 text-primary-600 font-bold text-xs sm:text-sm py-1.5 rounded-xl hover:bg-primary-500 hover:text-white transition-all duration-200 active:scale-95 shadow-sm"
          >
            {loading ? <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" />ADD</>}
          </button>
        ) : (
          <div className="flex items-center gap-1 bg-primary-500 rounded-xl px-1.5 py-1 w-20 sm:w-24 justify-between shadow-sm">
            <button onClick={handleDecrease} aria-label="Decrease quantity" className="food-card-qty-btn text-white hover:scale-110 transition-transform p-1"><Minus className="w-3.5 h-3.5" /></button>
            <span className="text-white font-bold text-xs sm:text-sm select-none">{quantity}</span>
            <button onClick={handleIncrease} aria-label="Increase quantity" className="food-card-qty-btn text-white hover:scale-110 transition-transform p-1"><Plus className="w-3.5 h-3.5" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
