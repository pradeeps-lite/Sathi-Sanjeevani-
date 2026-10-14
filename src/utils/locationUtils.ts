import { Clinic } from '../types';

/**
 * Calculates the Haversine distance in kilometers between two GPS coordinates.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Generates location-anchored fallback medical facilities centered around user's exact lat/lng and locality name.
 */
export function generateAnchoredMedicalPlaces(
  lat: number,
  lng: number,
  placeName: string,
  city: string
): Clinic[] {
  const cityName = city || (placeName ? placeName.split(',')[0] : 'Your Locality');

  const templates = [
    {
      id: 'anchored-phc-1',
      name: `${cityName} Primary Health Centre (PHC)`,
      address: `Main Road, Near Panchayat Samiti, ${cityName}`,
      type: 'PHC' as const,
      status: 'Open 24x7',
      phone: '+91 1800 180 1104',
      latOffset: 0.0035,
      lngOffset: -0.0028,
    },
    {
      id: 'anchored-[#2E6B4F]-1',
      name: `Jan Aushadhi Kendra & Medical Store`,
      address: `Station Road Market, ${cityName}`,
      type: 'Pharmacy' as const,
      status: 'Open till 10 PM',
      phone: '+91 98765 43210',
      latOffset: -0.0021,
      lngOffset: 0.0019,
    },
    {
      id: 'anchored-hosp-1',
      name: `${cityName} Civil & District Sub-Hospital`,
      address: `Civil Lines, Hospital Chowk, ${cityName}`,
      type: 'Hospital' as const,
      status: 'Open 24x7',
      phone: '+91 112',
      latOffset: 0.0078,
      lngOffset: 0.0064,
    },
    {
      id: 'anchored-[#2E6B4F]-2',
      name: `Apollo 24x7 Pharmacy & Healthcare`,
      address: `Opposite Bus Stand, ${cityName}`,
      type: 'Pharmacy' as const,
      status: 'Open 24x7',
      phone: '+91 98765 11223',
      latOffset: 0.0012,
      lngOffset: -0.0041,
    },
    {
      id: 'anchored-blood-1',
      name: `${cityName} Red Cross Blood Bank & Emergency Care`,
      address: `Red Cross Building, ${cityName}`,
      type: 'Blood Bank' as const,
      status: 'Open 24x7',
      phone: '+91 98765 99887',
      latOffset: -0.0085,
      lngOffset: 0.0092,
    },
    {
      id: 'anchored-[#2E6B4F]-3',
      name: `Sanjeevani MedPlus Medical & Diagnostic Store`,
      address: `Ring Road, Near City Clinic, ${cityName}`,
      type: 'Pharmacy' as const,
      status: 'Open till 11 PM',
      phone: '+91 98765 55443',
      latOffset: -0.0045,
      lngOffset: -0.0053,
    },
  ];

  return templates.map((tmpl) => {
    const itemLat = lat + tmpl.latOffset;
    const itemLng = lng + tmpl.lngOffset;
    const dist = calculateDistanceKm(lat, lng, itemLat, itemLng);

    return {
      id: tmpl.id,
      name: tmpl.name,
      address: tmpl.address,
      distance: `${dist} km away`,
      status: tmpl.status,
      phone: tmpl.phone,
      type: tmpl.type,
      lat: itemLat,
      lng: itemLng,
    };
  });
}
