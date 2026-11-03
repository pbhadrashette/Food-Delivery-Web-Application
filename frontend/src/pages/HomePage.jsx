import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, ArrowRight, Star, Clock, ChevronRight, ChevronLeft, ChevronDown,
  ShieldCheck, Tag, Flame, Sparkles, TrendingUp, MapPin, Copy, Check,
  Quote, Heart, BadgePercent, Utensils, Award, ThumbsUp, Compass, ShoppingBag
} from 'lucide-react';
import { restaurantAPI, categoryAPI, foodAPI, couponAPI, reviewAPI } from '../services/api';
import RestaurantCard from '../components/common/RestaurantCard';
import FoodCard from '../components/common/FoodCard';
import { CATEGORY_PHOTOGRAPHS, resolveCategoryImageUrl, getCategoryImageFallback, SAFE_FOOD_PLACEHOLDER } from '../utils/foodImage';
import toast from 'react-hot-toast';

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-card border border-gray-100">
      <div className="skeleton aspect-[16/10] w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-full" />
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle, linkTo, linkLabel }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-1.5 h-8 bg-gradient-to-b from-[#ff5a00] to-orange-600 rounded-full mt-0.5 flex-shrink-0" />
        <div>
          <h2 className="text-xl md:text-2xl font-display font-extrabold text-gray-900 flex items-center gap-2">
            {icon && <span className="inline-flex items-center">{icon}</span>}
            {title}
          </h2>
          {subtitle && <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#ff5200] hover:text-[#e04800] bg-orange-50 hover:bg-orange-100 px-3.5 py-1.5 rounded-xl transition-all duration-200 group shadow-sm"
        >
          <span>{linkLabel || 'View all'}</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

const HERO_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=85&fit=crop',
    alt: 'Assorted gourmet dishes ready for delivery',
  },
  {
    src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=85&fit=crop',
    alt: 'Fresh burgers and sides',
  },
  {
    src: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=1200&q=85&fit=crop',
    alt: 'Aromatic biryani platter',
  },
];

const CITIES = [
  'Bangalore, Karnataka',
  'Pune, Maharashtra',
  'Mumbai, Maharashtra',
  'Delhi NCR',
  'Hyderabad, Telangana',
  'Chennai, Tamil Nadu',
  'Kolkata, West Bengal',
  'Ahmedabad, Gujarat',
];

const DEFAULT_CATEGORIES = [
  { name: 'Pizza', photo: CATEGORY_PHOTOGRAPHS.Pizza },
  { name: 'Burger', photo: CATEGORY_PHOTOGRAPHS.Burger },
  { name: 'Biryani', photo: CATEGORY_PHOTOGRAPHS.Biryani },
  { name: 'Chinese', photo: CATEGORY_PHOTOGRAPHS.Chinese },
  { name: 'South Indian', photo: CATEGORY_PHOTOGRAPHS['South Indian'] },
  { name: 'North Indian', photo: CATEGORY_PHOTOGRAPHS['North Indian'] },
  { name: 'Desserts', photo: CATEGORY_PHOTOGRAPHS.Desserts },
  { name: 'Beverages', photo: CATEGORY_PHOTOGRAPHS.Beverages },
  { name: 'Fast Food', photo: CATEGORY_PHOTOGRAPHS['Fast Food'] },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Bangalore, Karnataka');
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Application Data States
  const [categories, setCategories] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [topRatedRestaurants, setTopRatedRestaurants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [recommendedFoods, setRecommendedFoods] = useState([]);
  const [newArrivalFoods, setNewArrivalFoods] = useState([]);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [customerReviews, setCustomerReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  const categoryScrollRef = useRef(null);
  const heroSearchRef = useRef(null);
  const navigate = useNavigate();

  // Fetch real database data for all sections
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          categoryAPI.getAll(),
          restaurantAPI.getAll({ featured: true, limit: 8 }),
          restaurantAPI.getAll({ sort: 'rating', limit: 8 }),
          restaurantAPI.getAll({ limit: 16 }),
          foodAPI.getAll({ sort: 'popular', limit: 8 }),
          foodAPI.getAll({ featured: 'true', limit: 8 }),
          foodAPI.getAll({ sort: 'newest', limit: 8 }),
          couponAPI.getActive(),
          reviewAPI.getPublic(),
        ]);

        const [
          catRes,
          featRes,
          topRes,
          allRes,
          popFoodRes,
          recFoodRes,
          newFoodRes,
          couponRes,
          reviewRes,
        ] = results.map((r) => (r.status === 'fulfilled' ? r.value?.data : null));

        if (catRes?.categories?.length) setCategories(catRes.categories);
        if (featRes?.restaurants?.length) setFeaturedRestaurants(featRes.restaurants);
        if (topRes?.restaurants?.length) setTopRatedRestaurants(topRes.restaurants);
        if (allRes?.restaurants?.length) setAllRestaurants(allRes.restaurants);
        if (popFoodRes?.foods?.length) setPopularFoods(popFoodRes.foods);
        if (recFoodRes?.foods?.length) setRecommendedFoods(recFoodRes.foods);
        if (newFoodRes?.foods?.length) setNewArrivalFoods(newFoodRes.foods);
        if (couponRes?.coupons?.length) setActiveCoupons(couponRes.coupons);
        if (reviewRes?.reviews?.length) setCustomerReviews(reviewRes.reviews);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchSuggestionsOpen(false);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const scrollCategoryStrip = (direction) => {
    if (categoryScrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      categoryScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Filter restaurants for "Trending Near You" based on selectedCity
  const currentCityName = useMemo(() => {
    return selectedCity.split(',')[0].trim().toLowerCase();
  }, [selectedCity]);

  const trendingInSelectedCity = useMemo(() => {
    const matches = allRestaurants.filter((r) => {
      return (
        r.city?.toLowerCase().includes(currentCityName) ||
        r.address?.toLowerCase().includes(currentCityName)
      );
    });
    return matches.length > 0 ? matches : topRatedRestaurants.slice(0, 4);
  }, [allRestaurants, currentCityName, topRatedRestaurants]);

  // Combine categories with photographs and image resolution
  const displayCategories = useMemo(() => {
    if (categories.length > 0) {
      return categories.map((cat) => ({
        _id: cat._id,
        name: cat.name,
        photo: resolveCategoryImageUrl(cat),
      }));
    }
    return DEFAULT_CATEGORIES.map((cat, idx) => ({
      _id: `default_${idx}`,
      name: cat.name,
      photo: resolveCategoryImageUrl(cat),
    }));
  }, [categories]);

  // Click outside listener for search suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (heroSearchRef.current && !heroSearchRef.current.contains(e.target)) {
        setSearchSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live search suggestions across categories, restaurants, and dishes
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return { categories: [], restaurants: [], dishes: [] };

    const matchedCats = displayCategories
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedRestaurants = allRestaurants
      .filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.cuisine?.some((c) => c.toLowerCase().includes(q))
      )
      .slice(0, 3);

    const allDishes = [...popularFoods, ...recommendedFoods, ...newArrivalFoods];
    const seenFood = new Set();
    const matchedDishes = allDishes
      .filter((f) => {
        if (!f?.name || seenFood.has(f.name.toLowerCase())) return false;
        seenFood.add(f.name.toLowerCase());
        return f.name.toLowerCase().includes(q);
      })
      .slice(0, 4);

    return {
      categories: matchedCats,
      restaurants: matchedRestaurants,
      dishes: matchedDishes,
    };
  }, [searchQuery, displayCategories, allRestaurants, popularFoods, recommendedFoods, newArrivalFoods]);

  const hasSuggestions =
    searchSuggestionsOpen &&
    searchQuery.trim().length >= 2 &&
    (searchSuggestions.categories.length > 0 ||
      searchSuggestions.restaurants.length > 0 ||
      searchSuggestions.dishes.length > 0);

  // Restaurant discount offers
  const restaurantOffers = useMemo(() => {
    const seen = new Set();
    return [...featuredRestaurants, ...allRestaurants].filter((r) => {
      if (!r?.discount?.trim() || seen.has(r._id)) return false;
      seen.add(r._id);
      return true;
    });
  }, [featuredRestaurants, allRestaurants]);

  return (
    <div className="pb-24 md:pb-12 bg-[#F9FAFB]">
      {/* ════════════════════ 1. HERO SECTION ════════════════════ */}
      <section className="home-hero">
        {/* Background ambient lighting */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-[#10141d] to-[#181d29] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-[400px] h-[300px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="home-hero__inner page-container">
          <div className="home-hero__grid">
            {/* LEFT COLUMN: HERO CONTENT */}
            <div className="home-hero__content">
              {/* Delivery Badge with City Selector */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setLocationDropdownOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 bg-[#2d1b12]/80 hover:bg-[#38261e] border border-orange-500/25 text-white/95 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-colors shadow-sm cursor-pointer"
                >
                  <span className="text-orange-400">🚚</span>
                  <span>Delivering to {selectedCity.split(',')[0]} (50+ cities)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-orange-400" />
                </button>
              </div>

              {/* Main Heading */}
              <h1 className="home-hero__title">
                Delicious Food,
                <br />
                <span className="text-[#ff5a00]">Delivered to You</span>
              </h1>

              {/* Subtitle */}
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed max-w-xl mb-6 font-normal">
                Order from your favorite restaurants and get fresh, hot food delivered at your doorstep, fast and easy.
              </p>

              {/* Search Bar + Location Selector + Find Food */}
              <form onSubmit={handleSearch} ref={heroSearchRef} className="home-hero__search relative">
                <div className="home-hero__search-input-wrap">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0 mr-2.5" />
                  <input
                    id="hero-search-input"
                    type="text"
                    placeholder="Search for restaurants, dishes or cuisines..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!searchSuggestionsOpen) setSearchSuggestionsOpen(true);
                    }}
                    onFocus={() => setSearchSuggestionsOpen(true)}
                    autoComplete="off"
                  />
                </div>

                <div className="home-hero__search-divider" />

                {/* Location Dropdown */}
                <div className="home-hero__search-location">
                  <button
                    type="button"
                    onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 border-t sm:border-t-0 border-gray-100 flex-shrink-0 transition-colors w-full sm:w-auto justify-between sm:justify-start"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-4 h-4 text-[#ff5200] flex-shrink-0" />
                      <span className="truncate max-w-[130px] sm:max-w-none">{selectedCity.split(',')[0]}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${locationDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {locationDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 z-50 animate-fade-in">
                      <div className="px-3.5 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        Select Delivery City
                      </div>
                      {CITIES.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setSelectedCity(city);
                            setLocationDropdownOpen(false);
                            toast.success(`Location set to ${city.split(',')[0]}`);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${
                            selectedCity === city
                              ? 'bg-orange-50 text-[#ff5a00] font-bold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{city}</span>
                          {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a00]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Find Food Button */}
                <button id="hero-search-btn" type="submit" className="home-hero__search-btn group">
                  <span>Find Food</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Live Search Suggestions Dropdown */}
                {hasSuggestions && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-left py-2 animate-fade-in max-h-80 overflow-y-auto">
                    {searchSuggestions.categories.length > 0 && (
                      <div className="px-3 py-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categories</span>
                        <div className="mt-1 space-y-1">
                          {searchSuggestions.categories.map((cat) => (
                            <button
                              key={cat._id || cat.name}
                              type="button"
                              onClick={() => {
                                setSearchSuggestionsOpen(false);
                                navigate(`/search?category=${encodeURIComponent(cat.name)}`);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#ff5200] transition-colors text-left"
                            >
                              <Utensils className="w-3.5 h-3.5 text-orange-400" />
                              <span>{cat.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchSuggestions.restaurants.length > 0 && (
                      <div className="px-3 py-1 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Restaurants</span>
                        <div className="mt-1 space-y-1">
                          {searchSuggestions.restaurants.map((rest) => (
                            <button
                              key={rest._id}
                              type="button"
                              onClick={() => {
                                setSearchSuggestionsOpen(false);
                                navigate(`/restaurant/${rest._id}`);
                              }}
                              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#ff5200] transition-colors text-left"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                                <span className="truncate">{rest.name}</span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-normal ml-2 flex-shrink-0">{rest.city || 'Restaurant'}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchSuggestions.dishes.length > 0 && (
                      <div className="px-3 py-1 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dishes</span>
                        <div className="mt-1 space-y-1">
                          {searchSuggestions.dishes.map((dish) => (
                            <button
                              key={dish._id}
                              type="button"
                              onClick={() => {
                                setSearchSuggestionsOpen(false);
                                navigate(`/search?q=${encodeURIComponent(dish.name)}`);
                              }}
                              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#ff5200] transition-colors text-left"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Search className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                                <span className="truncate">{dish.name}</span>
                              </div>
                              <span className="text-[10px] text-[#ff5200] font-bold ml-2 flex-shrink-0">₹{dish.price}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>

              {/* 4 Feature Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#ff5a00]/15 flex items-center justify-center text-[#ff5a00] flex-shrink-0">
                    <Clock className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-white leading-tight">Fast Delivery</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">30 mins avg</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#ff5a00]/15 flex items-center justify-center text-[#ff5a00] flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-white leading-tight">Safe &amp; Hygienic</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">100% safety</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#ff5a00]/15 flex items-center justify-center text-[#ff5a00] flex-shrink-0">
                    <Tag className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-white leading-tight">Best Offers</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">Up to 50% off</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#ff5a00]/15 flex items-center justify-center text-[#ff5a00] flex-shrink-0">
                    <Star className="w-4 h-4 fill-[#ff5a00] text-[#ff5a00] stroke-[1]" />
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-white leading-tight">Top Restaurants</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">500+ partners</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: HERO VISUAL & CAROUSEL */}
            <div className="home-hero__media">
              <div className="home-hero__carousel-wrap group">
                <div className="home-hero__image-frame">
                  <img
                    key={HERO_SLIDES[activeSlide].src}
                    src={HERO_SLIDES[activeSlide].src}
                    alt={HERO_SLIDES[activeSlide].alt}
                    width={650}
                    height={450}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/hero-food.jpg';
                    }}
                    className="home-hero__image transition-opacity duration-500 group-hover:scale-[1.02] transform object-cover w-full h-full"
                  />
                </div>

                {/* Interactive Carousel Overlays */}
                <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 opacity-90 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1.5">
                    {HERO_SLIDES.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        aria-label={`Show hero slide ${index + 1}`}
                        onClick={() => setActiveSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveSlide((p) => (p === 0 ? HERO_SLIDES.length - 1 : p - 1))}
                      className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                      title="Previous slide"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlide((p) => (p === HERO_SLIDES.length - 1 ? 0 : p + 1))}
                      className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                      title="Next slide"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ PAGE BODY CONTENT ════════════════════ */}
      <div className="page-container home-page-body py-8 sm:py-12 space-y-14">

        {/* ════════════════════ 2. WHAT'S ON YOUR MIND? (LARGE PHOTOGRAPHIC CATEGORIES) ════════════════════ */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-8 bg-gradient-to-b from-[#ff5a00] to-orange-600 rounded-full mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-xl md:text-2xl font-display font-extrabold text-gray-900">
                  What&apos;s on your mind?
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                  Explore curated delicacies with authentic flavors &amp; fresh ingredients
                </p>
              </div>
            </div>

            {/* Scroll Navigation Controls */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCategoryStrip('left')}
                className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-300 flex items-center justify-center text-gray-600 hover:text-[#ff5200] transition-colors shadow-sm"
                aria-label="Scroll categories left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategoryStrip('right')}
                className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-300 flex items-center justify-center text-gray-600 hover:text-[#ff5200] transition-colors shadow-sm"
                aria-label="Scroll categories right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Attractive Culinary Feature Banner for What's on your mind */}
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md group">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=85&fit=crop"
              alt="Artisan culinary spread featuring fresh gourmet dishes, savory spices, and gourmet ingredients"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/hero-banner-clean.png';
              }}
              className="w-full h-44 sm:h-56 md:h-64 object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-6 sm:p-8 md:p-10">
              <div className="max-w-md text-white">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#FF6B35] to-[#ff5200] text-white shadow-sm mb-2.5">
                  Chef&apos;s Daily Specials
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold leading-tight text-white drop-shadow-sm">
                  Craving Something Delicious?
                </h3>
                <p className="text-white/85 text-xs sm:text-sm mt-1 sm:mt-2 line-clamp-2">
                  Browse handpicked authentic cuisines freshly prepared by top-rated local kitchens.
                </p>
              </div>
            </div>
          </div>

          {/* Large food-category cards with relevant high-quality photographs */}
          <div
            ref={categoryScrollRef}
            className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-orange-200 scroll-smooth"
          >
            {displayCategories.map((cat) => (
              <Link
                key={cat._id || cat.name}
                to={`/search?category=${encodeURIComponent(cat.name)}`}
                className="group flex-shrink-0 w-36 sm:w-44 md:w-48 bg-white rounded-2xl border border-gray-100 hover:border-orange-300 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block"
              >
                <div className="relative aspect-square overflow-hidden bg-orange-50">
                  <img
                    src={cat.photo}
                    alt={cat.name}
                    loading="lazy"
                    onError={(e) => {
                      const fallback = getCategoryImageFallback(cat, e.currentTarget.src);
                      if (e.currentTarget.src !== fallback && !fallback.includes('data:image')) {
                        e.currentTarget.src = fallback;
                      } else {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = SAFE_FOOD_PLACEHOLDER;
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-center">
                    <span className="font-display font-extrabold text-white text-sm sm:text-base drop-shadow-md">
                      {cat.name}
                    </span>
                  </div>
                </div>
                <div className="py-2 text-center bg-white group-hover:bg-orange-50/70 transition-colors">
                  <span className="text-[11px] font-bold text-[#ff5200] uppercase tracking-wider inline-flex items-center gap-0.5">
                    Explore <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ════════════════════ 3. POPULAR FOODS ════════════════════ */}
        <section>
          <SectionHeader
            icon={<Sparkles className="w-5 h-5 text-orange-500" />}
            title="Popular Foods"
            subtitle="Most ordered dishes with top customer ratings"
            linkTo="/search"
            linkLabel="Explore all dishes"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)
            ) : popularFoods.length > 0 ? (
              popularFoods.slice(0, 8).map((food) => <FoodCard key={food._id} food={food} />)
            ) : (
              <p className="text-gray-400 text-sm col-span-full">No popular foods found.</p>
            )}
          </div>
        </section>

        {/* ════════════════════ 4. TOP RESTAURANTS ════════════════════ */}
        <section>
          <SectionHeader
            icon={<Award className="w-5 h-5 text-amber-500" />}
            title="Top Restaurants"
            subtitle="Highest rated dining partners known for exquisite taste &amp; swift service"
            linkTo="/restaurants"
            linkLabel="View all restaurants"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : topRatedRestaurants.length > 0 ? (
              topRatedRestaurants.slice(0, 6).map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))
            ) : (
              <p className="text-gray-400 text-sm col-span-full">No restaurants found.</p>
            )}
          </div>
        </section>

        {/* ════════════════════ 5. DEALS & OFFERS (REAL COUPONS + OFFERS) ════════════════════ */}
        <section>
          <SectionHeader
            icon={<BadgePercent className="w-5 h-5 text-rose-500" />}
            title="Deals &amp; Offers"
            subtitle="Save big with verified discount coupons and promotional restaurant deals"
            linkTo="/restaurants"
            linkLabel="Browse offers"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Real Active Coupons from Backend */}
            {activeCoupons.slice(0, 3).map((coupon) => (
              <div
                key={coupon._id || coupon.code}
                className="rounded-2xl border-2 border-dashed border-orange-200 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/40 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-100 text-[#ff5200] px-3 py-1 font-mono font-black text-xs">
                      <Tag className="w-3.5 h-3.5" />
                      {coupon.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCoupon(coupon.code)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#ff5200] bg-white px-2.5 py-1 rounded-lg border border-gray-200 transition-colors shadow-2xs"
                    >
                      {copiedCoupon === coupon.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="font-display font-bold text-gray-900 text-lg">
                    {coupon.discountType === 'percentage'
                      ? `Flat ${coupon.discountValue}% OFF`
                      : `Flat ₹${coupon.discountValue} OFF`}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {coupon.description || `Applicable on orders above ₹${coupon.minimumOrderValue || 200}`}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-orange-100/80 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Min. order ₹{coupon.minimumOrderValue || 200}</span>
                  <Link
                    to="/restaurants"
                    className="font-bold text-[#ff5200] hover:underline inline-flex items-center gap-0.5"
                  >
                    Apply on Checkout <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}

            {/* Restaurant Special Offers if fewer coupons */}
            {restaurantOffers.slice(0, Math.max(0, 3 - activeCoupons.length)).map((r) => (
              <Link
                key={r._id}
                to={`/restaurant/${r._id}`}
                className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="badge-orange text-xs font-bold uppercase tracking-wide">
                    {r.name}
                  </span>
                  <h3 className="font-display font-bold text-gray-900 text-lg mt-2 line-clamp-1">
                    {r.discount}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500">{r.deliveryTime || '30-45'} mins</span>
                  <span className="font-bold text-[#ff5200] inline-flex items-center gap-0.5">
                    Order Now <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Promotional Value Banner */}
          <div className="mt-5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-md">
                FoodieRush Weekend Fest
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-black mt-2">
                Order with Cash on Delivery &amp; Enjoy Zero Convenience Fees!
              </h3>
              <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-xl">
                Choose Cash on Delivery at checkout for safe, touch-free delivery and exact cash payment upon arrival.
              </p>
            </div>
            <Link
              to="/restaurants"
              className="bg-white hover:bg-orange-50 text-[#ff5200] font-bold text-sm px-5 py-3 rounded-xl transition-all shadow-md flex-shrink-0 flex items-center gap-2"
            >
              <span>Explore Restaurants</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ════════════════════ 6. RECOMMENDED FOR YOU ════════════════════ */}
        <section>
          <SectionHeader
            icon={<Heart className="w-5 h-5 text-rose-500" />}
            title="Recommended for You"
            subtitle="Curated picks personalized for your culinary preferences"
            linkTo="/search"
            linkLabel="See all recommendations"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 items-stretch">
            {loading ? (
              Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)
            ) : recommendedFoods.length > 0 ? (
              recommendedFoods.slice(0, 8).map((food) => <FoodCard key={food._id} food={food} />)
            ) : (
              popularFoods.slice(0, 4).map((food) => <FoodCard key={food._id} food={food} />)
            )}
          </div>
        </section>

        {/* ════════════════════ 7. NEW ARRIVALS ════════════════════ */}
        <section>
          <SectionHeader
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            title="New Arrivals"
            subtitle="Exciting new dishes and trending menu additions"
            linkTo="/search"
            linkLabel="View newest dishes"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 items-stretch">
            {loading ? (
              Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)
            ) : newArrivalFoods.length > 0 ? (
              newArrivalFoods.slice(0, 8).map((food) => <FoodCard key={food._id} food={food} />)
            ) : (
              popularFoods.slice(4, 8).map((food) => <FoodCard key={food._id} food={food} />)
            )}
          </div>
        </section>

        {/* ════════════════════ 8. TRENDING NEAR YOU ════════════════════ */}
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-8 bg-gradient-to-b from-sky-500 to-blue-600 rounded-full mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-xl md:text-2xl font-display font-extrabold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sky-600" />
                  Trending in {selectedCity.split(',')[0]}
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                  Popular foodie spots actively delivering in your chosen location
                </p>
              </div>
            </div>
            <Link
              to="/restaurants"
              className="flex items-center gap-1 text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3.5 py-1.5 rounded-xl transition-all"
            >
              <span>Explore {selectedCity.split(',')[0]}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading ? (
              Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : trendingInSelectedCity.length > 0 ? (
              trendingInSelectedCity.slice(0, 4).map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))
            ) : (
              allRestaurants.slice(0, 4).map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))
            )}
          </div>
        </section>

        {/* ════════════════════ 9. WHY CHOOSE FOODIERUSH? ════════════════════ */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#ff5200] bg-orange-50 px-3 py-1 rounded-full">
              Why Choose Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900 mt-2">
              The FoodieRush Advantage
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Elevating every dining experience with speed, hygiene, savings, and unmatched convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100 hover:border-orange-200 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#ff5200] text-white flex items-center justify-center mb-4 shadow-md shadow-orange-500/20">
                <Clock className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-display font-bold text-gray-900 text-lg mb-1.5">Lightning-Fast Delivery</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Avg. 30-min delivery time with live GPS tracking from the restaurant kitchen straight to your door.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 hover:border-rose-200 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-4 shadow-md shadow-rose-500/20">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-display font-bold text-gray-900 text-lg mb-1.5">100% Hygienic &amp; Safe</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Certified kitchen sanitization, temperature logs, tamper-evident seals, and contact-free handovers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 hover:border-amber-200 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-md shadow-amber-500/20">
                <Tag className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-display font-bold text-gray-900 text-lg mb-1.5">Best Offers &amp; Savings</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Daily promotional coupons, flat festival discounts, and member rewards with zero hidden surcharges.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-100 hover:border-sky-200 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mb-4 shadow-md shadow-sky-500/20">
                <ThumbsUp className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-display font-bold text-gray-900 text-lg mb-1.5">COD &amp; Easy Convenience</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Hassle-free Cash on Delivery checkout, instant 1-tap reorders, and 24/7 priority customer support.
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════ 10. CUSTOMER REVIEWS & RATINGS ════════════════════ */}
        <section>
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-[#ff5200] bg-orange-50 px-3 py-1 rounded-full">
              Customer Testimonials
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900 mt-2">
              Loved by Foodies Everywhere
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Read authentic reviews from happy customers who order daily on FoodieRush
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {customerReviews.length > 0 ? (
              customerReviews.slice(0, 4).map((review) => (
                <div
                  key={review._id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-3">
                      {Array(review.foodRating || 5).fill(0).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed italic line-clamp-4">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-[#ff5200] text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {review.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{review.user?.name || 'Verified User'}</p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {review.restaurant?.name ? `at ${review.restaurant.name}` : 'FoodieRush Customer'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Authentic fallbacks if backend has not yet seeded reviews
              [
                {
                  name: 'Aarav Sharma',
                  restaurant: 'Urban Biryani',
                  comment: 'The Dum Biryani was piping hot, fragrant and loaded with tender meat! Delivery took only 25 minutes. Best biryani in town!',
                  rating: 5,
                },
                {
                  name: 'Priya Patel',
                  restaurant: 'Spice House',
                  comment: 'Incredible Butter Chicken and crispy naan. Packed safely with zero spill. Highly recommend for family dinners!',
                  rating: 5,
                },
                {
                  name: 'Rohan Deshmukh',
                  restaurant: 'Pizza Point',
                  comment: 'Crust was perfectly wood-fired, cheese was gooey and toppings were very fresh. Cash on Delivery was seamless!',
                  rating: 5,
                },
                {
                  name: 'Ananya Nair',
                  restaurant: 'South Indian Kitchen',
                  comment: 'Authentic crispy ghee roast Masala Dosa and filter coffee. Tasted just like traditional South Indian breakfast!',
                  rating: 5,
                },
              ].map((testi, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-3">
                      {Array(testi.rating).fill(0).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed italic line-clamp-4">
                      &ldquo;{testi.comment}&rdquo;
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-[#ff5200] text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {testi.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{testi.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">at {testi.restaurant}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
