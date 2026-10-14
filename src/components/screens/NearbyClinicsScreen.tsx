import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  RefreshCw,
  Navigation,
  Search,
  ExternalLink,
  Map,
  List,
  Compass,
  Building2,
  Pill,
  HeartPulse,
} from 'lucide-react';
import { Clinic } from '../../types';
import { getTranslation } from '../../data/translations';
import { UserLocation } from '../../hooks/useUserLocation';
import {
  calculateDistanceKm,
  generateAnchoredMedicalPlaces,
} from '../../utils/locationUtils';

interface NearbyClinicsScreenProps {
  onBack: () => void;
  clinics: Clinic[];
  userLocation: UserLocation;
  onRefreshLocation: () => void;
  selectedLanguage?: string;
}

export const NearbyClinicsScreen: React.FC<NearbyClinicsScreenProps> = ({
  onBack,
  clinics: initialClinics,
  userLocation,
  onRefreshLocation,
  selectedLanguage = 'हिंदी',
}) => {
  const t = getTranslation(selectedLanguage);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'google-map' | 'radar-map'>('google-map');
  const [callingNumber, setCallingNumber] = useState<string | null>(null);

  const [nearbyPlaces, setNearbyPlaces] = useState<Clinic[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(true);

  // Default coordinates (User GPS or Fallback India center)
  const lat = userLocation.latitude || 20.5937;
  const lng = userLocation.longitude || 78.9629;

  // Fetch or calculate real nearby medical stores & hospitals when GPS coordinates change
  useEffect(() => {
    let isMounted = true;

    async function loadRealPlaces() {
      setIsLoadingPlaces(true);

      // 1. Try fetching real facilities from OpenStreetMap Overpass API
      if (userLocation.latitude && userLocation.longitude) {
        try {
          const overpassQuery = `[out:json][timeout:8];(node["amenity"~"hospital|pharmacy|clinic|doctors|blood_bank"](around:8000,${userLocation.latitude},${userLocation.longitude});way["amenity"~"hospital|pharmacy|clinic|doctors|blood_bank"](around:8000,${userLocation.latitude},${userLocation.longitude}););out center 15;`;
          const res = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: overpassQuery,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.elements && data.elements.length > 0) {
              const fetchedList: Clinic[] = data.elements.map((el: any, idx: number) => {
                const itemLat = el.lat || (el.center && el.center.lat) || lat;
                const itemLng = el.lon || (el.center && el.center.lon) || lng;
                const dist = calculateDistanceKm(lat, lng, itemLat, itemLng);

                let amenityType: Clinic['type'] = 'Hospital';
                const am = el.tags?.amenity;
                if (am === 'pharmacy') amenityType = 'Pharmacy';
                else if (am === 'clinic' || am === 'doctors') amenityType = 'PHC';
                else if (am === 'blood_bank') amenityType = 'Blood Bank';

                const rawName =
                  el.tags?.name ||
                  el.tags?.['name:en'] ||
                  el.tags?.brand ||
                  `${amenityType} near ${userLocation.city || 'You'}`;

                const street =
                  el.tags?.['addr:street'] ||
                  el.tags?.['addr:suburb'] ||
                  el.tags?.['addr:city'] ||
                  userLocation.city ||
                  userLocation.placeName;

                return {
                  id: `osm-${el.id || idx}`,
                  name: rawName,
                  address: street
                    ? `${street}, ${userLocation.city || ''}`
                    : `Near ${userLocation.placeName}`,
                  distance: `${dist} km away`,
                  status: el.tags?.opening_hours || 'Open 24x7',
                  phone:
                    el.tags?.phone ||
                    el.tags?.['contact:phone'] ||
                    '+91 1800 180 1104',
                  type: amenityType,
                  lat: itemLat,
                  lng: itemLng,
                };
              });

              if (isMounted && fetchedList.length >= 2) {
                setNearbyPlaces(fetchedList);
                setIsLoadingPlaces(false);
                return;
              }
            }
          }
        } catch (err) {
          console.warn('Live Overpass API query failed, generating location-anchored places:', err);
        }
      }

      // 2. Fallback: generate anchored places dynamically calculated around user's exact lat/lng
      if (isMounted) {
        const anchored = generateAnchoredMedicalPlaces(
          lat,
          lng,
          userLocation.placeName,
          userLocation.city
        );
        setNearbyPlaces(anchored);
        setIsLoadingPlaces(false);
      }
    }

    loadRealPlaces();

    return () => {
      isMounted = false;
    };
  }, [userLocation.latitude, userLocation.longitude, userLocation.city, userLocation.placeName]);

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  useEffect(() => {
    if (nearbyPlaces.length > 0 && !selectedClinic) {
      setSelectedClinic(nearbyPlaces[0]);
    }
  }, [nearbyPlaces, selectedClinic]);

  const filterOptions = [
    { key: 'All', label: t.all, icon: Building2 },
    { key: 'Pharmacy', label: t.pharmacy, icon: Pill },
    { key: 'Hospital', label: t.hospital, icon: HeartPulse },
    { key: 'PHC', label: t.phc, icon: Compass },
    { key: 'Blood Bank', label: t.bloodBank, icon: MapPin },
  ];

  // Search and filter logic
  const filteredClinics = nearbyPlaces.filter((c) => {
    const matchesFilter = filterType === 'All' || c.type === filterType;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCall = (phone: string, name: string) => {
    setCallingNumber(`${name} (${phone})`);
    setTimeout(() => {
      window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
    }, 400);
  };

  const openInGoogleMaps = (c?: Clinic) => {
    if (c) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${c.name} ${c.address}`
      )}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/hospitals+and+pharmacies+near+${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  const openDirections = (c: Clinic) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FBF7EE] text-gray-800 animate-fadeIn">
      {/* Top Header */}
      <div className="p-3 bg-white border-b border-[#E5DEC9] flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black text-gray-900">{t.clinicsTitle}</h1>
          <p className="text-[10px] text-gray-500 font-semibold truncate max-w-[180px]">
            {userLocation.placeName}
          </p>
        </div>
        <button
          onClick={onRefreshLocation}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 flex items-center gap-1 text-xs font-bold"
          title={t.getExactLocationBtn}
        >
          <RefreshCw
            className={`w-4 h-4 ${
              userLocation.isLoading ? 'animate-spin text-[#2E6B4F]' : ''
            }`}
          />
        </button>
      </div>

      {/* Live GPS Exact Location Header Bar */}
      <div className="px-3 py-2 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <Navigation className="w-4 h-4 text-[#2E6B4F] animate-pulse shrink-0" />
          <div className="truncate">
            <span className="font-extrabold text-[#2E6B4F] mr-1">{t.exactGpsLoc}:</span>
            <span className="font-bold text-gray-900">{userLocation.placeName}</span>
          </div>
        </div>

        <button
          onClick={() => openInGoogleMaps()}
          className="px-2.5 py-1 bg-[#2E6B4F] hover:bg-[#23533E] text-white text-[10px] font-bold rounded-xl shadow-2xs flex items-center gap-1 shrink-0 transition active:scale-95"
        >
          <span>Open Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Search Bar Input */}
      <div className="px-3 py-2 bg-white border-b border-[#E5DEC9]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nearby medical store, hospital, PHC..."
            className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-9 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2E6B4F]"
          />
        </div>
      </div>

      {/* Filter Category Chips & View Toggle */}
      <div className="px-3 py-2 bg-white border-b border-[#E5DEC9] flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        <div className="flex gap-1.5 shrink-0">
          {filterOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = filterType === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setFilterType(opt.key)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#2E6B4F] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher */}
        <div className="flex bg-gray-100 p-0.5 rounded-xl shrink-0 border border-gray-200">
          <button
            onClick={() => setViewMode('google-map')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
              viewMode === 'google-map'
                ? 'bg-white text-[#2E6B4F] shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Google Maps Live View"
          >
            <Map className="w-3 h-3" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setViewMode('radar-map')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
              viewMode === 'radar-map'
                ? 'bg-white text-[#2E6B4F] shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Radar Pin View"
          >
            <Compass className="w-3 h-3" />
            <span>Radar</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Interactive Map View Box */}
        <div className="relative w-full h-56 bg-slate-200 overflow-hidden border-b border-[#E5DEC9] shrink-0">
          {viewMode === 'google-map' ? (
            /* Live Google Maps Interactive Iframe centered on User GPS */
            <iframe
              title="Google Maps Live Location View"
              src={`https://maps.google.com/maps?q=hospitals+pharmacies+medical+stores+near+${lat},${lng}&z=14&output=embed`}
              className="w-full h-full border-0"
              loading="lazy"
            />
          ) : (
            /* Custom SVG Map Radar Graphics */
            <svg className="w-full h-full object-cover bg-[#EAF0E6]" viewBox="0 0 400 220">
              {/* Roads Grid */}
              <path
                d="M 20 50 Q 150 120 380 40"
                stroke="#D3E0CE"
                strokeWidth="24"
                fill="none"
              />
              <path
                d="M 120 0 Q 180 110 220 220"
                stroke="#D3E0CE"
                strokeWidth="18"
                fill="none"
              />
              <path
                d="M 200 120 Q 300 180 400 160"
                stroke="#FFFFFF"
                strokeWidth="12"
                fill="none"
              />

              {/* User Blue Pulsing GPS Radar Ring */}
              <circle cx="200" cy="120" r="45" fill="#3B82F6" fillOpacity="0.08" stroke="#3B82F6" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="200" cy="120" r="16" fill="#3B82F6" fillOpacity="0.2" />
              <circle cx="200" cy="120" r="7" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />

              {/* Dynamic Clinic Map Pins */}
              {filteredClinics.map((clinic, idx) => {
                const positions = [
                  { x: 130, y: 70 },
                  { x: 270, y: 155 },
                  { x: 85, y: 150 },
                  { x: 310, y: 65 },
                  { x: 230, y: 180 },
                  { x: 170, y: 40 },
                ];
                const pos = positions[idx % positions.length];
                const isSelected = selectedClinic?.id === clinic.id;

                return (
                  <g
                    key={clinic.id}
                    onClick={() => setSelectedClinic(clinic)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 16 : 12}
                      fill={
                        clinic.type === 'Pharmacy'
                          ? '#D97706'
                          : isSelected
                          ? '#2E6B4F'
                          : '#10B981'
                      }
                      className="transition-all hover:scale-125 shadow-md"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {clinic.type === 'Pharmacy' ? 'Rx' : '+'}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Floating Live Location Badge */}
          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-bold text-gray-900 shadow-md border border-gray-200 flex items-center gap-1.5 z-10">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span className="truncate max-w-[220px]">
              GPS: {userLocation.placeName}
            </span>
          </div>

          <button
            onClick={() => openInGoogleMaps()}
            className="absolute bottom-2 right-2 bg-[#2E6B4F] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1 z-10 hover:bg-[#23533E]"
          >
            <span>Full Map</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Nearby Facility Cards List */}
        <div className="p-4 space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>Nearby Medical Stores & Hospitals</span>
              <span className="bg-[#2E6B4F] text-white px-2 py-0.5 rounded-full text-[10px]">
                {filteredClinics.length}
              </span>
            </h2>

            {isLoadingPlaces && (
              <span className="text-[10px] text-[#2E6B4F] font-bold flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Locating nearby...</span>
              </span>
            )}
          </div>

          {filteredClinics.length === 0 ? (
            <div className="bg-white p-6 rounded-3xl border border-[#E5DEC9] text-center space-y-2 my-2">
              <MapPin className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs font-bold text-gray-700">
                No facilities matching "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('All');
                }}
                className="text-xs text-[#2E6B4F] font-bold underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredClinics.map((clinic) => {
              const isSelected = selectedClinic?.id === clinic.id;
              return (
                <div
                  key={clinic.id}
                  onClick={() => setSelectedClinic(clinic)}
                  className={`bg-white p-3.5 rounded-3xl border transition shadow-2xs cursor-pointer ${
                    isSelected
                      ? 'border-[#2E6B4F] ring-1 ring-[#2E6B4F] bg-[#FBF7EE]/40'
                      : 'border-[#E5DEC9] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            clinic.type === 'Pharmacy'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : clinic.type === 'Hospital'
                              ? 'bg-rose-100 text-rose-900 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {clinic.type}
                        </span>

                        <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#2E6B4F]" />
                          {clinic.distance}
                        </span>
                      </div>

                      <h3 className="text-xs font-black text-gray-900 leading-snug">
                        {clinic.name}
                      </h3>

                      <p className="text-[11px] font-medium text-gray-600 leading-tight">
                        {clinic.address}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {clinic.status === 'Open 24x7' ? t.open24x7 : clinic.status}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDirections(clinic);
                          }}
                          className="text-[10px] font-extrabold text-[#2E6B4F] hover:underline flex items-center gap-0.5 ml-auto"
                        >
                          <span>Directions</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Call Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCall(clinic.phone, clinic.name);
                      }}
                      className="w-10 h-10 rounded-full bg-[#E2F0E8] hover:bg-[#2E6B4F] text-[#2E6B4F] hover:text-white flex items-center justify-center transition shadow-2xs shrink-0 active:scale-95"
                      title={t.callNow}
                    >
                      <Phone className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Simulated Call Toast Indicator */}
      {callingNumber && (
        <div className="p-3 bg-emerald-900 text-white flex items-center justify-between text-xs font-bold animate-slideUp">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 animate-bounce text-emerald-300" />
            <span>Calling {callingNumber}...</span>
          </div>
          <button
            onClick={() => setCallingNumber(null)}
            className="text-[10px] text-emerald-200 underline"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
};
