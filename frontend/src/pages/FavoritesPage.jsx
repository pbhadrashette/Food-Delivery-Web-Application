import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RestaurantCard from '../components/common/RestaurantCard';

export default function FavoritesPage() {
  const { user, updateUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const { data } = await userAPI.getProfile();
        setFavorites(data.user.favoriteRestaurants || []);
        updateUser(data.user);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchFavorites();
  }, []);

  const refreshFavorites = async () => {
    const { data } = await userAPI.getProfile();
    setFavorites(data.user.favoriteRestaurants || []);
  };

  return (
    <div className="page-container py-6 pb-24 md:pb-8 animate-fade-in">
      <h1 className="section-title mb-6">My Favorites</h1>
      {loading ? (
        <div className="restaurant-grid">
          {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-500">Save your favorite restaurants by clicking the heart icon</p>
        </div>
      ) : (
        <div className="restaurant-grid">
          {favorites.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} onFavoriteToggle={refreshFavorites} />
          ))}
        </div>
      )}
    </div>
  );
}
