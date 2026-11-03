import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, Trash2, Search, Filter } from 'lucide-react';
import { reviewAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-orange-400 fill-orange-400' : 'text-gray-200'}`} />
    ))}
  </div>
);

export default function AdminReviews() {
  const [searchParams] = useSearchParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState(searchParams.get('rating') || '');

  useEffect(() => {
    if (searchParams.get('rating')) {
      setFilterRating(searchParams.get('rating'));
    }
  }, [searchParams]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filterRating) params.rating = filterRating;
      const { data } = await reviewAPI.getAll(params);
      let result = data.reviews;
      if (search) {
        const regex = new RegExp(search, 'i');
        result = result.filter(r => regex.test(r.user?.name) || regex.test(r.restaurant?.name) || regex.test(r.comment));
      }
      setReviews(result);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [page, filterRating]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewAPI.delete(id);
      toast.success('Review deleted');
      fetchReviews();
    } catch (e) { toast.error('Failed to delete review'); }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + ((r.foodRating + r.deliveryRating + r.restaurantRating) / 3), 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-gray-900">Reviews ({total})</h1>
          <p className="text-gray-400 text-xs mt-0.5">Average rating: ⭐ {avgRating}</p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="grid grid-cols-5 gap-2">
        {[5, 4, 3, 2, 1].map(r => {
          const count = reviews.filter(rev => Math.round((rev.foodRating + rev.deliveryRating + rev.restaurantRating) / 3) === r).length;
          return (
            <button key={r} onClick={() => setFilterRating(filterRating === String(r) ? '' : String(r))}
              className={`bg-white rounded-xl p-3 text-center shadow-sm border transition-all ${filterRating === String(r) ? 'border-primary-400 bg-primary-50' : 'border-gray-100 hover:border-gray-300'}`}>
              <div className="flex justify-center mb-1">
                {Array(r).fill(0).map((_, i) => <Star key={i} className="w-3 h-3 text-orange-400 fill-orange-400" />)}
              </div>
              <p className="text-lg font-display font-black text-gray-900">{count}</p>
              <p className="text-xs text-gray-400">{r} star</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          className="input-field pl-10 text-sm py-2.5"
          placeholder="Search by user, restaurant, comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchReviews()}
        />
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />) :
          reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No reviews yet</p>
            </div>
          ) : reviews.map((review) => {
            const overallRating = ((review.foodRating + review.deliveryRating + review.restaurantRating) / 3).toFixed(1);
            return (
              <div key={review._id} className="bg-white rounded-2xl shadow-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {review.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{review.user?.name}</p>
                      <p className="text-xs text-gray-500">{review.user?.email}</p>
                      <p className="text-xs text-primary-600 font-medium mt-0.5">📍 {review.restaurant?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                        <span className="font-bold text-gray-900">{overallRating}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => handleDelete(review._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs bg-gray-50 rounded-xl p-3">
                  <div><p className="text-gray-400 mb-0.5">Food Quality</p><StarDisplay rating={review.foodRating} /></div>
                  <div><p className="text-gray-400 mb-0.5">Delivery</p><StarDisplay rating={review.deliveryRating} /></div>
                  <div><p className="text-gray-400 mb-0.5">Restaurant</p><StarDisplay rating={review.restaurantRating} /></div>
                </div>
                {review.comment && (
                  <p className="mt-3 text-gray-600 text-sm bg-gray-50 rounded-xl px-3 py-2 italic">"{review.comment}"</p>
                )}
              </div>
            );
          })
        }
      </div>

      {total > 15 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-2 px-4 text-sm disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 15)}</span>
          <button disabled={page * 15 >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary py-2 px-4 text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
