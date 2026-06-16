/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FoodDeliveryRecord, PredictionInput } from './types';

// Constants for coordinate boundaries (Centered near Bangalore, India)
const METRO_LAT = 12.9716;
const METRO_LON = 77.5946;

const WEATHERS = ['Sunny', 'Cloudy', 'Windy', 'Foggy', 'Sandstorms', 'Stormy'];
const TRAFFICS = ['Low', 'Medium', 'High', 'Jam'];
const VEHICLES = ['motorcycle', 'scooter', 'electric_scooter', 'bicycle'];
const ORDERS = ['Snack', 'Meal', 'Drinks', 'Buffet'];
const CITIES = ['Metropolitan', 'Urban', 'Semi-Urban'];

// Helper to compute geodesic distance using the Haversine formula (Mimics geopy)
export function getHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Generate Raw dataset, containing some raw formatting quirks:
// - Missing values as "NaN " strings (very typical of raw text imports like Zomato dataset)
// - Extra spacing in text
// - String timestamps (e.g., "14:15")
// - Variable ages, vehicle conditions
export function generateRawDataset(seed = 42): any[] {
  const rawList: any[] = [];
  
  // Custom pseudo-random generator to ensure deterministic output matching seed
  let car = seed;
  const lcg = () => {
    car = (car * 1664525 + 1013904223) % 4294967296;
    return car / 4294967296;
  };

  for (let i = 0; i < 2500; i++) {
    const ageVal = lcg();
    const ratingVal = lcg();
    const isMissingAge = lcg() < 0.04; // 4% missing age
    const isMissingRating = lcg() < 0.05; // 5% missing rating
    const isMissingTraffic = lcg() < 0.03; // 3% missing traffic

    // Generate locations
    const distLimit = 0.02 + lcg() * 0.12; // 2km to 15km
    const angle = lcg() * 2 * Math.PI;
    
    const restLat = METRO_LAT + (lcg() - 0.5) * 0.08;
    const restLon = METRO_LON + (lcg() - 0.5) * 0.08;
    const delLat = restLat + Math.sin(angle) * distLimit;
    const delLon = restLon + Math.cos(angle) * distLimit;

    const weather = WEATHERS[Math.floor(lcg() * WEATHERS.length)];
    const traffic = isMissingTraffic ? 'NaN' : TRAFFICS[Math.floor(lcg() * TRAFFICS.length)];
    
    // Vehicle stats
    const vehicleCondition = Math.floor(lcg() * 3); // 0, 1, 2
    const vehicleType = VEHICLES[Math.floor(lcg() * VEHICLES.length)];
    const orderType = ORDERS[Math.floor(lcg() * ORDERS.length)];
    const city = lcg() < 0.75 ? 'Metropolitan' : lcg() < 0.85 ? 'Urban' : 'Semi-Urban';

    // Time calculations
    const startHourNum = Math.floor(8 + lcg() * 15); // Operating hours 8 AM to 11 PM
    const startMinNum = Math.floor(lcg() * 60);
    const timeOrderedStr = `${startHourNum.toString().padStart(2, '0')}:${startMinNum.toString().padStart(2, '0')}`;
    
    const pickDelay = Math.floor(10 + lcg() * 15); // Picked 10-25 mins later
    let pickMin = startMinNum + pickDelay;
    let pickHour = startHourNum;
    if (pickMin >= 60) {
      pickHour = (pickHour + Math.floor(pickMin / 60)) % 24;
      pickMin = pickMin % 60;
    }
    const timePickedStr = `${pickHour.toString().padStart(2, '0')}:${pickMin.toString().padStart(2, '0')}`;

    // Base Time_taken(min) formulation:
    // Distance impact: ~3.5 minutes per km
    const distanceVal = getHaversineDistance(restLat, restLon, delLat, delLon);
    let timeTaken = 15 + distanceVal * 3.2;

    // Traffic impact
    if (traffic === 'Jam') timeTaken += 22;
    else if (traffic === 'High') timeTaken += 14;
    else if (traffic === 'Medium') timeTaken += 7;
    else timeTaken += 2;

    // Weather impact
    if (weather === 'Stormy') timeTaken += 12;
    else if (weather === 'Foggy' || weather === 'Sandstorms') timeTaken += 8;
    else if (weather === 'Windy' || weather === 'Cloudy') timeTaken += 4;

    // Vehicle condition impact (0 is poor, 1 is average, 2 is excellent)
    if (vehicleCondition === 0) timeTaken += 5;
    else if (vehicleCondition === 1) timeTaken += 1.5;

    // Rider rating impact
    const riderRating = isMissingRating ? NaN : parseFloat((3.5 + lcg() * 1.5).toFixed(1));
    if (!isNaN(riderRating)) {
      if (riderRating < 4.0) timeTaken += 6;
      else if (riderRating < 4.5) timeTaken += 3;
    }

    // Age impact
    const riderAge = isMissingAge ? NaN : Math.floor(20 + lcg() * 31);
    if (!isNaN(riderAge) && riderAge > 40) {
      timeTaken += 2; // slightly slower
    }

    // Hour of day (Peak shift: Lunch 12-14, Dinner 19-21)
    const isPeakHour = (startHourNum >= 12 && startHourNum <= 14) || (startHourNum >= 19 && startHourNum <= 21);
    if (isPeakHour) {
      timeTaken += 6;
    }

    // Add random noise
    timeTaken += (lcg() - 0.5) * 8; // Noise ± 4 min
    timeTaken = Math.max(12, Math.round(timeTaken));

    rawList.push({
      Delivery_person_Age: isMissingAge ? 'NaN ' : riderAge.toString(),
      Delivery_person_Ratings: isMissingRating ? 'NaN ' : riderRating.toString(),
      Restaurant_latitude: restLat,
      Restaurant_longitude: restLon,
      Delivery_location_latitude: delLat,
      Delivery_location_longitude: delLon,
      Weatherconditions: `conditions ${weather}`, // raw values in actual dataset have "conditions " prefix
      Road_traffic_density: traffic === 'NaN' ? 'NaN ' : `${traffic} `, // raw trailing space
      Vehicle_condition: vehicleCondition,
      Type_of_vehicle: vehicleType,
      Type_of_order: orderType,
      City: `${city} `, // raw styling space
      Time_Orderd: timeOrderedStr,
      Time_Order_picked: timePickedStr,
      'Time_taken(min)': `(min) ${timeTaken}`, // representation of string text format in CSV
    });
  }

  return rawList;
}

