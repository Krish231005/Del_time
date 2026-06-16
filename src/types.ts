/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FoodDeliveryRecord {
  Delivery_person_Age: number;
  Delivery_person_Ratings: number;
  Restaurant_latitude: number;
  Restaurant_longitude: number;
  Delivery_location_latitude: number;
  Delivery_location_longitude: number;
  Weatherconditions: string;
  Road_traffic_density: string;
  Vehicle_condition: number;
  Type_of_vehicle: string;
  Type_of_order: string;
  City: string;
  Time_Orderd: string;
  Time_Order_picked: string;
  Time_taken_min: number; // mapped from Time_taken(min)
  
  // Engineered Features (Cleaned)
  Distance_km: number;
  Order_Hour: number;
  Peak_Hour: number;
  Weekend_Order: number;
  Delivery_Speed_Category: string;
  Late: number; // Target: 1 if Time_taken(min) > 45 else 0
}

export interface NotebookCell {
  id: string;
  type: 'markdown' | 'code';
  content: string;
  output?: string;
  executionCount?: number;
}

export interface ModelMetric {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: [[number, number], [number, number]]; // [[TN, FP], [FN, TP]]
}

export interface ModelCollection {
  logisticRegression: ModelMetric;
  decisionTree: ModelMetric;
  randomForest: ModelMetric;
  gradientBoosting: ModelMetric;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  description: string;
}

export interface PredictionInput {
  distance: number;
  traffic: 'Low' | 'Medium' | 'High' | 'Jam';
  weather: 'Sunny' | 'Cloudy' | 'Windy' | 'Foggy' | 'Sandstorms' | 'Stormy';
  city: 'Metropolitan' | 'Urban' | 'Semi-Urban';
  vehicleType: 'motorcycle' | 'scooter' | 'electric_scooter' | 'bicycle';
  rating: number; // 1.0 to 5.0
  hour: number; // 0 to 23
  vehicleCondition: 0 | 1 | 2;
  age: number;
}
