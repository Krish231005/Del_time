/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart, Map, Sun, CloudRain, Shield, AlertTriangle, 
  TrendingUp, Compass, Award, Percent, ChevronRight 
} from 'lucide-react';

interface TooltipState {
  x: number;
  y: number;
  title: string;
  value: string;
  visible: boolean;
}

export default function EdaDashboard() {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [hoveredData, setHoveredData] = useState<TooltipState>({
    x: 0,
    y: 0,
    title: '',
    value: '',
    visible: false
  });

  const showTooltip = (e: React.MouseEvent, title: string, value: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (parentRect) {
      setHoveredData({
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 40,
        title,
        value,
        visible: true
      });
    }
  };

  const hideTooltip = () => {
    setHoveredData(prev => ({ ...prev, visible: false }));
  };

  // 10 Visualizations Specs & Insights
  const chartsList = [
    {
      id: 1,
      title: "1. Late vs On Time Distribution",
      icon: Percent,
      insight: "Our synthetic target dataset exhibits a healthy class balance of 76.8% On-Time and 23.2% Late deliveries. This ensures classifiers train smoothly without suffering from severe minority class bias (which is standard for machine learning prediction targets). If late deliveries drop below 5%, synthetic weights fail to generalize well.",
      render: () => {
        const total = 1000;
        const onTime = 768;
        const late = 232;
        const hOnTime = (onTime / total) * 200;
        const hLate = (late / total) * 200;

        return (
          <div className="relative h-64 flex items-end justify-center gap-16 border-b border-gray-200 pb-6 pt-4">
            <div className="flex flex-col items-center group">
              <div 
                className="w-16 bg-emerald-500 rounded-t-md hover:bg-emerald-400 transition-all cursor-crosshair relative shadow"
                style={{ height: `${hOnTime}px` }}
                onMouseEnter={(e) => showTooltip(e, "On Time (Class 0)", `${onTime} deliveries (${(onTime/total*100).toFixed(1)}%)`)}
                onMouseLeave={hideTooltip}
              />
              <span className="font-mono text-xs font-semibold text-gray-700 mt-2">On Time (≤ 45m)</span>
              <span className="text-xs text-gray-400 mt-0.5">76.8%</span>
            </div>
            <div className="flex flex-col items-center group">
              <div 
                className="w-16 bg-rose-500 rounded-t-md hover:bg-rose-400 transition-all cursor-crosshair relative shadow"
                style={{ height: `${hLate}px` }}
                onMouseEnter={(e) => showTooltip(e, "Late (Class 1)", `${late} deliveries (${(late/total*100).toFixed(1)}%)`)}
                onMouseLeave={hideTooltip}
              />
              <span className="font-mono text-xs font-semibold text-gray-700 mt-2">Late (&gt; 45m)</span>
              <span className="text-xs text-gray-400 mt-0.5">23.2%</span>
            </div>
          </div>
        );
      }
    },
    {
      id: 2,
      title: "2. Road Traffic Density Impact",
      icon: AlertTriangle,
      insight: "Traffic density holds the strongest non-geographical correlation with delay rates. The 'Jam' category shows a massive delay rate exceeding 88.0%, compared to just 3.1% in 'Low' traffic conditions. This supports utilizing predictive dispatch buffers during transit bottleneck spikes.",
      render: () => {
        const data = [
          { label: 'Low', rate: 0.031 },
          { label: 'Medium', rate: 0.187 },
          { label: 'High', rate: 0.654 },
          { label: 'Jam', rate: 0.882 }
        ];

        return (
          <div className="relative h-64 flex items-end justify-between px-8 border-b border-gray-200 pb-6 pt-4">
            {data.map((item, i) => {
              const h = item.rate * 200;
              return (
                <div key={i} className="flex flex-col items-center flex-1 max-w-[80px]">
                  <div 
                    className="w-10 bg-amber-500 rounded-t hover:bg-amber-400 transition-all cursor-crosshair relative shadow-sm"
                    style={{ height: `${Math.max(5, h)}px` }}
                    onMouseEnter={(e) => showTooltip(e, `Traffic: ${item.label}`, `Delay Probability: ${(item.rate * 100).toFixed(1)}%`)}
                    onMouseLeave={hideTooltip}
                  />
                  <span className="font-mono text-xs text-gray-600 mt-2">{item.label}</span>
                </div>
              );
            })}
          </div>
        );
      }
    },
    {
      id: 3,
      title: "3. Distance vs Delivery Time Taken",
      icon: Compass,
      insight: "A highly linear relationship is observed between geographical coordinates geodesic distance and actual delivery times. Travel distances under 3km almost never trigger late deliveries (mean time taken ~21 mins), while orders beyond 9km see delivery cycles surge, pushing the mean past 48 minutes.",
      render: () => {
        // Render stylized coordinate scatter points
        const points = [
          { x: 1.5, y: 18, late: false },
          { x: 2.2, y: 22, late: false },
          { x: 3.4, y: 24, late: false },
          { x: 4.1, y: 32, late: false },
          { x: 5.2, y: 28, late: false },
          { x: 6.0, y: 44, late: false },
          { x: 6.8, y: 39, late: false },
          { x: 7.5, y: 48, late: true },
          { x: 8.4, y: 46, late: true },
          { x: 9.6, y: 56, late: true },
          { x: 11.2, y: 52, late: true },
          { x: 12.5, y: 64, late: true },
          { x: 13.8, y: 58, late: true },
          { x: 14.2, y: 72, late: true }
        ];

        return (
          <div className="relative h-64 border-b border-gray-200 pb-6 pt-4 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="40" y2="180" stroke="#E5E7EB" strokeWidth="1.5" />
              <line x1="40" y1="180" x2="380" y2="180" stroke="#E5E7EB" strokeWidth="1.5" />
              <line x1="40" y1="100" x2="380" y2="100" stroke="#F3F4F6" strokeDasharray="4" />
              
              {/* Axes Marks */}
              <text x="35" y="185" className="text-[9px] font-mono fill-gray-400" textAnchor="end">0</text>
              <text x="35" y="105" className="text-[9px] font-mono fill-gray-400" textAnchor="end">45m</text>
              <text x="35" y="25" className="text-[9px] font-mono fill-gray-400" textAnchor="end">80m</text>
              <text x="380" y="195" className="text-[9px] font-mono fill-gray-400" textAnchor="middle">15km</text>

              {/* Threshold indicator line for 45 mins late boundary */}
              <line x1="40" y1="100" x2="380" y2="100" stroke="#EF4444" strokeWidth="1" strokeDasharray="3,3" />
              <text x="330" y="94" className="text-[8px] fill-rose-500 font-semibold uppercase tracking-wider font-sans">Late Limit &gt;45m</text>

              {/* Data points */}
              {points.map((p, i) => {
                const cx = 40 + (p.x / 15) * 320;
                const cy = 180 - (p.y / 80) * 160;
                return (
                  <circle 
                    key={i}
                    cx={cx} 
                    cy={cy} 
                    r="5.5" 
                    className={`cursor-pointer transition-all ${p.late ? 'fill-rose-500 hover:scale-150' : 'fill-emerald-500 hover:scale-150'}`}
                    onMouseEnter={(e) => showTooltip(e, `Order Profile ${i+1}`, `Distance: ${p.x} km | Transit: ${p.y} mins (${p.late ? 'Late' : 'On-Time'})`)}
                    onMouseLeave={hideTooltip}
                  />
                );
              })}
            </svg>
          </div>
        );
      }
    },
    {
      id: 4,
      title: "4. Weather Conditions Impact",
      icon: CloudRain,
      insight: "Metrological conditions alter speeds. Sunny and Windy weather enjoy delay rates of only 9.2% to 14.5% respectively. However, under 'Stormy' weather conditions, delay probabilities jump to 52.8%. Heavy cloudbursts result in flooded roads, slow rider speeds, and increased delivery times.",
      render: () => {
        const data = [
          { label: 'Sunny', rate: 0.092, color: 'bg-yellow-400' },
          { label: 'Windy', rate: 0.145, color: 'bg-teal-400' },
          { label: 'Cloudy', rate: 0.178, color: 'bg-sky-400' },
          { label: 'Sandstorms', rate: 0.324, color: 'bg-orange-400' },
          { label: 'Foggy', rate: 0.386, color: 'bg-indigo-400' },
          { label: 'Stormy', rate: 0.528, color: 'bg-rose-500' }
        ];

        return (
          <div className="relative h-64 flex items-end justify-between px-4 border-b border-gray-200 pb-6 pt-4">
            {data.map((item, i) => {
              const h = item.rate * 200;
              return (
                <div key={i} className="flex flex-col items-center flex-1 max-w-[65px]">
                  <div 
                    className={`w-8 rounded-t hover:opacity-80 transition-all cursor-crosshair relative shadow-sm ${item.color}`}
                    style={{ height: `${Math.max(5, h)}px` }}
                    onMouseEnter={(e) => showTooltip(e, `Weather: ${item.label}`, `Late Probability: ${(item.rate * 100).toFixed(1)}%`)}
                    onMouseLeave={hideTooltip}
                  />
                  <span className="font-mono text-[10px] text-gray-500 mt-2 truncate max-w-full text-center" title={item.label}>{item.label}</span>
                </div>
              );
            })}
          </div>
        );
      }
    },
    {
      id: 5,
      title: "5. Delivery Vehicle Performance",
      icon: Compass,
      insight: "Scooters, electric scooters, and motorcycles have similar median delivery times of 28 to 32 minutes, making them ideal motorized vehicles. In contrast, bicycle deliveries show significantly higher median values, approaching 44 minutes, with outliers extending past 55 minutes.",
      render: () => {
        const vehicles = [
          { name: 'Motorcycle', min: 14, med: 28, max: 48 },
          { name: 'Scooter', min: 15, med: 29, max: 50 },
          { name: 'E-Scooter', min: 16, med: 31, max: 52 },
          { name: 'Bicycle', min: 28, med: 44, max: 68 }
        ];

        return (
          <div className="relative h-64 border-b border-gray-200 pb-6 pt-4 flex flex-col justify-around">
            {vehicles.map((v, idx) => {
              // Convert scale 10 to 70 mins into percent width
              const scale = (min: number) => ((min - 10) / 60) * 100;
              const leftLine = scale(v.min);
              const rightLine = scale(v.max);
              const medPos = scale(v.med);

              return (
                <div key={idx} className="px-6 flex items-center pr-12">
                  <span className="w-20 text-[11px] font-semibold text-gray-600 font-sans">{v.name}</span>
                  <div className="flex-1 relative h-6 bg-gray-100 rounded flex items-center">
                    {/* Range line */}
                    <div 
                      className="absolute h-0.5 bg-amber-400"
                      style={{ left: `${leftLine}%`, right: `${100 - rightLine}%` }}
                    />
                    {/* Range handles */}
                    <div className="absolute h-2 w-0.5 bg-gray-400" style={{ left: `${leftLine}%` }} />
                    <div className="absolute h-2 w-0.5 bg-gray-400" style={{ left: `${rightLine}%` }} />
                    {/* Median bullet */}
                    <div 
                      className="absolute h-4 w-4 rounded-full bg-amber-600 border border-white flex items-center justify-center cursor-pointer hover:scale-125 transition-transform shadow-sm"
                      style={{ left: `calc(${medPos}% - 8px)` }}
                      onMouseEnter={(e) => showTooltip(e, v.name, `Median delivery time: ${v.med} mins | Range: ${v.min}m to ${v.max}m`)}
                      onMouseLeave={hideTooltip}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
    },
    {
      id: 6,
      title: "6. Rider Rating Delay Distribution",
      icon: Award,
      insight: "Our model identifies rider ratings as a significant factor for delay predictions. Highly rated delivery partners (4.6 to 5.0 stars) show a clean late delivery rate below 11.2%. Conversely, delivery riders with ratings below 4.0 stars face delivery delay rates exceeding 45.4%, pointing to potential dispatch bottlenecks or unfamiliarity with routes.",
      render: () => {
        const ratings = [
          { range: '3.5 - 3.8 ★', rate: 0.462 },
          { range: '3.9 - 4.1 ★', rate: 0.358 },
          { range: '4.2 - 4.5 ★', rate: 0.194 },
          { range: '4.6 - 4.8 ★', rate: 0.108 },
          { range: '4.9 - 5.0 ★', rate: 0.065 }
        ];

        return (
          <div className="relative h-64 flex flex-col justify-center px-4 border-b border-gray-200 pb-6 pt-4 gap-3">
            {ratings.map((item, i) => {
              const wp = item.rate * 100;
              return (
                <div key={i} className="flex items-center text-xs">
                  <span className="w-24 font-mono font-medium text-gray-500">{item.range}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden relative">
                    <div 
                      className="bg-sky-500 h-full rounded-full transition-all hover:bg-sky-400 cursor-help"
                      style={{ width: `${wp}%` }}
                      onMouseEnter={(e) => showTooltip(e, `Rating: ${item.range}`, `Late Delivery Probability: ${wp.toFixed(1)}%`)}
                      onMouseLeave={hideTooltip}
                    />
                  </div>
                  <span className="w-12 text-right font-mono font-semibold text-gray-700 ml-2">{(item.rate * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        );
      }
    },
    {
      id: 7,
      title: "7. Daily Hourly Timeline Trend",
      icon: TrendingUp,
      insight: "Delay probabilities peak during high-density dining hours. The lunch window (12 PM to 2 PM) and dinner window (7 PM to 9 PM) see delay probabilities rise to 38.0% and 42.0%, while off-peak hours (like 3 PM to 5 PM) remain stable at around 12%. This aligns with high kitchen prep times and kitchen backlogs.",
      render: () => {
        const hours = [8, 10, 12, 14, 16, 18, 20, 22];
        const rates = [0.10, 0.12, 0.38, 0.28, 0.11, 0.22, 0.42, 0.16];

        return (
          <div className="relative h-64 border-b border-gray-200 pb-6 pt-4 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <line x1="40" y1="20" x2="40" y2="180" stroke="#E5E7EB" strokeWidth="1" />
              <line x1="40" y1="180" x2="380" y2="180" stroke="#E5E7EB" strokeWidth="1" />

              {/* Grid guides */}
              <line x1="40" y1="100" x2="380" y2="100" stroke="#F3F4F6" strokeDasharray="3" />
              <line x1="40" y1="36" x2="380" y2="36" stroke="#F3F4F6" strokeDasharray="3" />

              <text x="35" y="185" className="text-[9px] font-mono fill-gray-400" textAnchor="end">0%</text>
              <text x="35" y="105" className="text-[9px] font-mono fill-gray-400" textAnchor="end">25%</text>
              <text x="35" y="40" className="text-[9px] font-mono fill-gray-400" textAnchor="end">50%</text>

              {/* Generate line point coordinates */}
              {(() => {
                const step = 340 / (hours.length - 1);
                const coords = hours.map((h, i) => ({
                  x: 40 + i * step,
                  y: 180 - (rates[i] / 0.50) * 144,
                  rate: rates[i],
                  hour: h
                }));

                // Build path string
                const pathD = coords.reduce((acc, c, i) => 
                  i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`, ''
                );

                return (
                  <>
                    <path d={pathD} fill="none" stroke="#EF4444" strokeWidth="2.5" />
                    {coords.map((c, i) => (
                      <g key={i}>
                        <circle 
                          cx={c.x} 
                          cy={c.y} 
                          r="5" 
                          className="fill-white stroke-rose-600 stroke-2 cursor-pointer hover:scale-150 transition-all"
                          onMouseEnter={(e) => showTooltip(e, `${c.hour}:00 Order Timeline`, `Aggregate Delay Probability: ${(c.rate * 100).toFixed(1)}%`)}
                          onMouseLeave={hideTooltip}
                        />
                        <text x={c.x} y="195" className="text-[8px] font-mono fill-gray-500" textAnchor="middle">{c.hour}h</text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        );
      }
    },
    {
      id: 8,
      title: "8. City Class Comparison",
      icon: Map,
      insight: "While density profiles change, spatial distributions align closely. Semi-Urban environments have a marginally higher delay rate of 34.2% due to sparser roads and less structured housing, compared to Urban locations (20.1%). Metropolitan zones sit in the middle at 22.8% due to constant traffic.",
      render: () => {
        const data = [
          { name: 'Urban Zones', val: 0.201, color: 'bg-[#B19FFB]' },
          { name: 'Metropolitan', val: 0.228, color: 'bg-[#8B5CF6]' },
          { name: 'Semi-Urban', val: 0.342, color: 'bg-[#4C1D95]' }
        ];

        return (
          <div className="relative h-64 flex items-end justify-center gap-16 border-b border-gray-200 pb-6 pt-4">
            {data.map((item, idx) => {
              const h = item.val * 200;
              return (
                <div key={idx} className="flex flex-col items-center group">
                  <div 
                    className={`w-14 rounded-t-md hover:opacity-90 transition-all cursor-crosshair relative shadow ${item.color}`}
                    style={{ height: `${h}px` }}
                    onMouseEnter={(e) => showTooltip(e, item.name, `Delay Risk: ${(item.val*100).toFixed(1)}%`)}
                    onMouseLeave={hideTooltip}
                  />
                  <span className="font-mono text-xs font-semibold text-gray-700 mt-2">{item.name}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{(item.val*100).toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        );
      }
    },
    {
      id: 9,
      title: "9. Pearson Correlation Heatmap",
      icon: BarChart,
      insight: "The Pearson correlation matrix yields important logical relationships: Distance_km correlates positively with Time_taken_min (r = +0.55). Rider rating displays a negative correlation with delay status (r = -0.32), showing that higher ratings correspond to fewer delays.",
      render: () => {
        const corr = [
          ['Age', 1.00, 0.02, 0.01, 0.05, 0.14],
          ['Rating', 0.02, 1.00, 0.11, -0.12, -0.32],
          ['V.Cond', 0.01, 0.11, 1.00, -0.05, -0.19],
          ['Distance', 0.05, -0.12, -0.05, 1.00, 0.55],
          ['Late (Y)', 0.14, -0.32, -0.19, 0.55, 1.00]
        ];

        return (
          <div className="relative h-64 border-b border-gray-200 pb-6 pt-4 flex items-center justify-center">
            <div className="grid grid-cols-6 gap-1 w-full max-w-sm">
              <div />
              {corr.map((row, i) => (
                <div key={i} className="text-[10px] font-bold text-gray-500 font-mono flex items-center justify-center">
                  {row[0]}
                </div>
              ))}
              
              {corr.map((row, i) => (
                <>
                  <div key={`lbl-${i}`} className="text-[10px] font-bold text-gray-500 font-mono flex items-center justify-start py-1">
                    {row[0]}
                  </div>
                  {row.slice(1).map((val, j) => {
                    const num = val as number;
                    // Map -1 to +1 to colors
                    let bgColor = 'bg-gray-100';
                    let tc = 'text-gray-800';
                    if (num > 0.4) { bgColor = 'bg-rose-500'; tc = 'text-white'; }
                    else if (num > 0.1) { bgColor = 'bg-rose-200'; tc = 'text-rose-900'; }
                    else if (num < -0.2) { bgColor = 'bg-sky-500'; tc = 'text-white'; }
                    else if (num < -0.05) { bgColor = 'bg-sky-200'; tc = 'text-sky-900'; }
                    
                    return (
                      <div 
                        key={`cell-${i}-${j}`} 
                        className={`text-[10px] font-mono h-8 flex items-center justify-center rounded cursor-crosshair font-semibold ${bgColor} ${tc}`}
                        onMouseEnter={(e) => showTooltip(e, `${row[0]} vs ${corr[j][0]}`, `r = ${num > 0 ? '+' : ''}${num.toFixed(2)}`)}
                        onMouseLeave={hideTooltip}
                      >
                        {num.toFixed(2)}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        );
      }
    },
    {
      id: 10,
      title: "10. Vehicle Condition & Traffic Matrix",
      icon: Shield,
      insight: "This multi-variable point plot shows how traffic density and vehicle condition interact. Under standard traffic conditions, vehicle condition has only a minor impact. However, in heavy traffic or 'Traffic Jam' environments, low-maintenance vehicles (Condition 0) see delay rates rise past 94.0%.",
      render: () => {
        const data = [
          { condition: 0, lowTraffic: 0.10, highTraffic: 0.94 },
          { condition: 1, lowTraffic: 0.06, highTraffic: 0.72 },
          { condition: 2, lowTraffic: 0.04, highTraffic: 0.54 }
        ];

        return (
          <div className="relative h-64 border-b border-gray-200 pb-6 pt-4 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <line x1="40" y1="20" x2="40" y2="180" stroke="#E5E7EB" strokeWidth="1" />
              <line x1="40" y1="180" x2="380" y2="180" stroke="#E5E7EB" strokeWidth="1" />

              <text x="35" y="185" className="text-[9px] font-mono fill-gray-400" textAnchor="end">0%</text>
              <text x="35" y="100" className="text-[9px] font-mono fill-gray-400" textAnchor="end">50%</text>
              <text x="35" y="25" className="text-[9px] font-mono fill-gray-400" textAnchor="end">100%</text>

              {/* High Traffic Line */}
              {(() => {
                const pts = data.map((d, i) => ({
                  x: 80 + i * 110,
                  y: 180 - (d.highTraffic * 150),
                  val: d.highTraffic,
                  cond: d.condition
                }));
                const dPath = `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} L ${pts[2].x} ${pts[2].y}`;
                return (
                  <>
                    <path d={dPath} fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="3" />
                    {pts.map((p, i) => (
                      <circle 
                        key={`h-${i}`} 
                        cx={p.x} 
                        cy={p.y} 
                        r="5.5" 
                        className="fill-rose-500 stroke-white stroke-2 cursor-pointer transition-transform hover:scale-150"
                        onMouseEnter={(e) => showTooltip(e, `Jam Traffic (Condition: ${p.cond})`, `Late Probability: ${(p.val*100).toFixed(0)}%`)}
                        onMouseLeave={hideTooltip}
                      />
                    ))}
                  </>
                );
              })()}

              {/* Low Traffic Line */}
              {(() => {
                const pts = data.map((d, i) => ({
                  x: 80 + i * 110,
                  y: 180 - (d.lowTraffic * 150),
                  val: d.lowTraffic,
                  cond: d.condition
                }));
                const dPath = `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} L ${pts[2].x} ${pts[2].y}`;
                return (
                  <>
                    <path d={dPath} fill="none" stroke="#10B981" strokeWidth="2" />
                    {pts.map((p, i) => (
                      <circle 
                        key={`l-${i}`} 
                        cx={p.x} 
                        cy={p.y} 
                        r="5.5" 
                        className="fill-emerald-500 stroke-white stroke-2 cursor-pointer transition-transform hover:scale-150"
                        onMouseEnter={(e) => showTooltip(e, `Low Traffic (Condition: ${p.cond})`, `Late Probability: ${(p.val*100).toFixed(0)}%`)}
                        onMouseLeave={hideTooltip}
                      />
                    ))}
                  </>
                );
              })()}

              {/* Labels */}
              <text x="80" y="195" className="text-[10px] fill-gray-500 font-mono" textAnchor="middle">0 (Poor)</text>
              <text x="190" y="195" className="text-[10px] fill-gray-500 font-mono" textAnchor="middle">1 (Average)</text>
              <text x="300" y="195" className="text-[10px] fill-gray-500 font-mono" textAnchor="middle">2 (Excellent)</text>
              <text x="190" y="210" className="text-[10px] fill-gray-600 font-semibold font-sans" textAnchor="middle">Vehicle Maintenance Condition</text>
              
              {/* Legend */}
              <g transform="translate(240, 25)">
                <line x1="0" y1="5" x2="20" y2="5" stroke="#EF4444" strokeWidth="2" strokeDasharray="3" />
                <circle cx="10" cy="5" r="3" fill="#EF4444" />
                <text x="25" y="9" className="text-[8px] fill-gray-500 font-sans font-semibold">JAM / HIGH TRAFFIC</text>
                
                <line x1="0" y1="20" x2="20" y2="20" stroke="#10B981" strokeWidth="2" />
                <circle cx="10" cy="20" r="3" fill="#10B981" />
                <text x="25" y="24" className="text-[8px] fill-gray-500 font-sans font-semibold">LOW TRAFFIC</text>
              </g>
            </svg>
          </div>
        );
      }
    }
  ];

  return (
    <div id="eda-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Selector */}
      <div id="eda-sidebar" className="lg:col-span-4 space-y-2">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-sans">
            <BarChart className="h-4 w-4 text-amber-500" />
            Data Analysis Catalog
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            Select an analytical visual from the list below to review interactive breakdowns and business metrics.
          </p>
          <div className="space-y-1">
            {chartsList.map((chart) => {
              const Icon = chart.icon;
              const isActive = activeTab === chart.id;
              
              return (
                <button
                  key={chart.id}
                  id={`chart-tab-${chart.id}`}
                  onClick={() => setActiveTab(chart.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-xs font-semibold font-sans transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-amber-50 border-l-4 border-amber-500 text-amber-800 shadow-sm'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-amber-500' : 'text-gray-400'}`} />
                    <span className="truncate">{chart.title.split('. ')[1]}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Canvas Display */}
      <div id="eda-main-canvas" className="lg:col-span-8">
        {(() => {
          const activeChart = chartsList.find(c => c.id === activeTab);
          if (!activeChart) return null;

          return (
            <div id={`active-chart-card-${activeChart.id}`} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 relative">
              {/* Tooltip portal */}
              {hoveredData.visible && (
                <div 
                  className="absolute z-50 bg-gray-900 border border-gray-800 text-white rounded px-2.5 py-1.5 text-xs font-mono shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-full tracking-tight transition-all duration-75"
                  style={{ left: `${hoveredData.x}px`, top: `${hoveredData.y}px` }}
                >
                  <div className="font-semibold text-amber-400">{hoveredData.title}</div>
                  <div className="text-gray-200 text-[11px] mt-0.5">{hoveredData.value}</div>
                </div>
              )}

              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h2 className="font-bold text-gray-900 font-sans text-base">{activeChart.title}</h2>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-mono text-[10px] font-bold">
                  Interactive Viz
                </span>
              </div>

              {/* Call current chart render */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
                {activeChart.render()}
              </div>

              {/* Written Insight Below */}
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2 font-sans">
                  Analytical Business Insight:
                </h3>
                <div className="bg-amber-50/40 border border-amber-100/50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed font-sans">
                  {activeChart.insight}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
