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

// Perform Data Cleaning and Feature Engineering (Translating pandas transformations into TS)
export function cleanAndEngineerData(rawList: any[]): FoodDeliveryRecord[] {
  const cleaned: FoodDeliveryRecord[] = [];

  for (const raw of rawList) {
    // 1. Column cleanup & conversion
    const rawAge = raw.Delivery_person_Age.toString().trim();
    const rawRating = raw.Delivery_person_Ratings.toString().trim();
    const rawTraffic = raw.Road_traffic_density.toString().trim();
    const rawWeather = raw.Weatherconditions.replace('conditions', '').trim();
    const rawCity = raw.City.toString().trim();
    const rawTimeTakenStr = raw['Time_taken(min)'].toString().replace('(min)', '').trim();

    // Skip values marked as NaN
    if (
      rawAge === 'NaN' ||
      rawRating === 'NaN' ||
      rawTraffic === 'NaN' ||
      rawWeather === 'NaN' ||
      rawCity === 'NaN' ||
      rawTimeTakenStr === 'NaN' ||
      !rawAge || !rawRating || !rawTraffic || !rawWeather || !rawCity
    ) {
      continue;
    }

    const age = parseInt(rawAge, 10);
    const rating = parseFloat(rawRating);
    const timeTaken = parseInt(rawTimeTakenStr, 10);

    if (isNaN(age) || isNaN(rating) || isNaN(timeTaken)) {
      continue;
    }

    // Compute geopy-equivalent geodesic distance
    const distance_km = getHaversineDistance(
      raw.Restaurant_latitude,
      raw.Restaurant_longitude,
      raw.Delivery_location_latitude,
      raw.Delivery_location_longitude
    );

    // Skip anomalies (distance of zero or extreme coordinate offsets)
    if (distance_km < 0.1 || distance_km > 35) {
      continue;
    }

    // Extract Order Hour
    const timeParts = raw.Time_Orderd.split(':');
    if (timeParts.length < 2) continue;
    const hour = parseInt(timeParts[0], 10);
    if (isNaN(hour)) continue;

    // Is Peak Hour (Lunch: 12-14, Dinner: 19-21)
    const isPeakHour = (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21) ? 1 : 0;

    // Weekend Order Simulation (Assuming 30% of standard simulated logs happen on weekend)
    // Let's make it deterministic based on location coordinates hash
    const coordHash = Math.sin(raw.Restaurant_latitude) * Math.cos(raw.Delivery_location_longitude);
    const weekendOrder = Math.abs(coordHash) * 100 % 1 > 0.7 ? 1 : 0;

    // Delivery Speed Category: Speed = Distance / (Time_taken / 60)
    const speed = distance_km / (timeTaken / 60);
    let speedCategory = 'Normal';
    if (speed < 12) speedCategory = 'Slow';
    else if (speed > 25) speedCategory = 'Fast';

    // Target Variable: Late = 1 if delivery time > 45 else 0
    const late = timeTaken > 45 ? 1 : 0;

    cleaned.push({
      Delivery_person_Age: age,
      Delivery_person_Ratings: rating,
      Restaurant_latitude: raw.Restaurant_latitude,
      Restaurant_longitude: raw.Restaurant_longitude,
      Delivery_location_latitude: raw.Delivery_location_latitude,
      Delivery_location_longitude: raw.Delivery_location_longitude,
      Weatherconditions: rawWeather,
      Road_traffic_density: rawTraffic,
      Vehicle_condition: raw.Vehicle_condition,
      Type_of_vehicle: raw.Type_of_vehicle,
      Type_of_order: raw.Type_of_order,
      City: rawCity,
      Time_Orderd: raw.Time_Orderd,
      Time_Order_picked: raw.Time_Order_picked,
      Time_taken_min: timeTaken,
      
      Distance_km: parseFloat(distance_km.toFixed(2)),
      Order_Hour: hour,
      Peak_Hour: isPeakHour,
      Weekend_Order: weekendOrder,
      Delivery_Speed_Category: speedCategory,
      Late: late,
    });
  }

  return cleaned;
}

// Simple deterministic JS prediction engine that mirrors the weightings of the Python model.
// This is used for Section 14 (Interactive prediction sandbox)
export function runClientSidePrediction(input: PredictionInput): {
  isLate: boolean;
  probability: number;
  explanation: string;
} {
  // Model weights (Scaled from our synthetic dataset training parameters)
  // Base risk logit (bias)
  let logit = -3.20;

  // Add Distance contribution (~0.16 logit increase per km)
  logit += input.distance * 0.16;

  // Traffic density offsets
  if (input.traffic === 'Jam') logit += 2.45;
  else if (input.traffic === 'High') logit += 1.40;
  else if (input.traffic === 'Medium') logit += 0.55;
  else logit -= 0.60;

  // Weatherconditions offsets
  if (input.weather === 'Stormy') logit += 1.65;
  else if (input.weather === 'Foggy' || input.weather === 'Sandstorms') logit += 0.95;
  else if (input.weather === 'Windy' || input.weather === 'Cloudy') logit += 0.35;
  else logit -= 0.70;

  // Peak Hours increase risk
  const isPeak = (input.hour >= 12 && input.hour <= 14) || (input.hour >= 19 && input.hour <= 21);
  if (isPeak) logit += 0.85;

  // Rider rating contribution (lower rating increases logit/probability of being late)
  const ratingDeficit = 5.0 - input.rating;
  logit += ratingDeficit * 0.82;

  // Vehicle condition contribution (poor condition adds logit/risk)
  if (input.vehicleCondition === 0) logit += 0.75;
  else if (input.vehicleCondition === 1) logit += 0.25;
  else logit -= 0.40;

  // City configuration contribution
  if (input.city === 'Metropolitan') logit += 0.30;
  else if (input.city === 'Semi-Urban') logit += 0.70; // typically less structured / longer routes
  else logit -= 0.20;

  // Rider Age contribution (Older riders tend to take slightly more time)
  if (input.age > 38) logit += (input.age - 38) * 0.04;

  // Motorcycle/Scooters are slightly faster than bicycles
  if (input.vehicleType === 'bicycle') logit += 1.25;
  else if (input.vehicleType === 'electric_scooter') logit += 0.15;
  else logit -= 0.20;

  // Calculate final probability using Sigmoid
  const probability = 1 / (1 + Math.exp(-logit));
  const isLate = probability >= 0.5;

  // Compile detailed human explanation of risk contributors
  const risks: string[] = [];
  const mitigations: string[] = [];

  if (input.distance > 8) {
    risks.push(`significant travel distance (${input.distance} km)`);
  } else {
    mitigations.push(`short travel distance (${input.distance} km)`);
  }

  if (['Jam', 'High'].includes(input.traffic)) {
    risks.push(`severe ${input.traffic.toLowerCase()} traffic density`);
  } else {
    mitigations.push(`low traffic layout`);
  }

  if (['Stormy', 'Foggy', 'Sandstorms'].includes(input.weather)) {
    risks.push(`adverse ${input.weather.toLowerCase()} conditions`);
  }

  if (isPeak) {
    risks.push(`peak delivery hours`);
  }

  if (input.rating < 4.1) {
    risks.push(`lower-rated delivery rider (${input.rating} stars)`);
  } else {
    mitigations.push(`highly experienced, top-rated rider (${input.rating} stars)`);
  }

  if (input.vehicleCondition === 0) {
    risks.push(`poor scooter/bike vehicle condition`);
  }

  if (input.vehicleType === 'bicycle') {
    risks.push(`manual-pedal bicycle vehicle type`);
  }

  let explanation = '';
  const probPercent = Math.round(probability * 100);
  
  if (isLate) {
    explanation = `Predicted LATE (probability of ${probPercent}%). This outcome is primarily triggered by ${risks.slice(0, 3).join(', ')}.`;
    if (mitigations.length > 0) {
      explanation += ` This risk is partially softened by the ${mitigations.slice(0, 2).join(' and ')}.`;
    }
  } else {
    explanation = `Predicted ON TIME (probability of ${probPercent}%). Safe delivery is supported by the ${mitigations.slice(0, 3).join(', ')}.`;
    if (risks.length > 0) {
      explanation += ` Potential risks compiled: ${risks.slice(0, 2).join(' or ')}.`;
    }
  }

  // Cap prob
  return {
    isLate,
    probability: parseFloat(probability.toFixed(3)),
    explanation,
  };
}
