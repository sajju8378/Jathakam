import React from 'react';
import { DivisionalChart, PlanetPosition } from '../types/astro';

interface Props {
  chart: DivisionalChart;
  planetsMap?: Record<string, PlanetPosition>;
  onSelectPlanet?: (planetName: string) => void;
  onSelectHouse?: (houseNum: number) => void;
  selectedHouse?: number | null;
}

const RASHI_ABBR = [
  'Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'
];

const PLANET_SHORT: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

export const NorthIndianChart: React.FC<Props> = ({
  chart,
  planetsMap,
  onSelectPlanet,
  onSelectHouse,
  selectedHouse
}) => {
  const ascSign = chart.ascendant_sign || 1;

  // Compute sign in each house
  const getHouseSign = (h: number) => {
    return ((ascSign - 1 + (h - 1)) % 12) + 1;
  };

  // House coordinates and polygons in a 400x400 SVG
  // 1 (top diamond): 200,0 -> 100,100 -> 200,200 -> 300,100
  // 2 (top-left): 0,0 -> 200,0 -> 100,100
  // 3 (upper-left): 0,0 -> 100,100 -> 0,200
  // 4 (left diamond): 0,200 -> 100,100 -> 200,200 -> 100,300
  // 5 (lower-left): 0,200 -> 100,300 -> 0,400
  // 6 (bottom-left): 0,400 -> 100,300 -> 200,400
  // 7 (bottom diamond): 200,200 -> 100,300 -> 200,400 -> 300,300
  // 8 (bottom-right): 200,400 -> 300,300 -> 400,400
  // 9 (lower-right): 400,200 -> 300,300 -> 400,400
  // 10 (right diamond): 200,200 -> 300,100 -> 400,200 -> 300,300
  // 11 (upper-right): 400,0 -> 300,100 -> 400,200
  // 12 (top-right): 200,0 -> 400,0 -> 300,100

  const houses = [
    { num: 1, points: "200,0 100,100 200,200 300,100", center: { x: 200, y: 100 }, signPos: { x: 200, y: 135 } },
    { num: 2, points: "0,0 200,0 100,100", center: { x: 100, y: 40 }, signPos: { x: 100, y: 70 } },
    { num: 3, points: "0,0 100,100 0,200", center: { x: 40, y: 100 }, signPos: { x: 70, y: 100 } },
    { num: 4, points: "0,200 100,100 200,200 100,300", center: { x: 100, y: 200 }, signPos: { x: 135, y: 200 } },
    { num: 5, points: "0,200 100,300 0,400", center: { x: 40, y: 300 }, signPos: { x: 70, y: 300 } },
    { num: 6, points: "0,400 100,300 200,400", center: { x: 100, y: 360 }, signPos: { x: 100, y: 330 } },
    { num: 7, points: "200,200 100,300 200,400 300,300", center: { x: 200, y: 300 }, signPos: { x: 200, y: 265 } },
    { num: 8, points: "200,400 300,300 400,400", center: { x: 300, y: 360 }, signPos: { x: 300, y: 330 } },
    { num: 9, points: "400,200 300,300 400,400", center: { x: 360, y: 300 }, signPos: { x: 330, y: 300 } },
    { num: 10, points: "200,200 300,100 400,200 300,300", center: { x: 300, y: 200 }, signPos: { x: 265, y: 200 } },
    { num: 11, points: "400,0 300,100 400,200", center: { x: 360, y: 100 }, signPos: { x: 330, y: 100 } },
    { num: 12, points: "200,0 400,0 300,100", center: { x: 300, y: 40 }, signPos: { x: 300, y: 70 } },
  ];

  return (
    <div className="w-full max-w-[500px] mx-auto select-none">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto drop-shadow-xl bg-slate-950 border border-amber-500/30 rounded-xl overflow-hidden font-sans"
      >
        <defs>
          <radialGradient id="kendraGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.0" />
          </radialGradient>
        </defs>

        {/* 12 House Polygons */}
        {houses.map((h) => {
          const signNum = getHouseSign(h.num);
          const isSelected = selectedHouse === h.num;
          const isKendra = [1, 4, 7, 10].includes(h.num);
          const housePlanets = chart.house_to_planets[h.num.toString()] || [];

          return (
            <g
              key={h.num}
              onClick={() => onSelectHouse?.(h.num)}
              className="cursor-pointer transition-colors duration-150"
            >
              <polygon
                points={h.points}
                fill={isSelected ? '#312e81' : isKendra ? 'url(#kendraGrad)' : '#0f172a'}
                stroke="#b45309"
                strokeWidth={isSelected ? '2.5' : '1.2'}
                className="transition-colors hover:fill-amber-950/40"
              />

              {/* Rashi Sign Number badge */}
              <text
                x={h.signPos.x}
                y={h.signPos.y}
                fill="#f59e0b"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none opacity-80"
              >
                {signNum} ({RASHI_ABBR[signNum - 1]})
              </text>

              {/* House Number in subtle small font */}
              <text
                x={h.center.x}
                y={h.center.y - 18}
                fill="#64748b"
                fontSize="9"
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none"
              >
                H{h.num}
              </text>

              {/* Planets in this house */}
              <g className="planet-group">
                {housePlanets.map((pName, idx) => {
                  const pObj = planetsMap?.[pName];
                  const isRetro = pObj?.is_retrograde;
                  const dignity = pObj?.dignity || '';

                  // Dynamic color based on dignity
                  let pColor = '#38bdf8'; // standard blue
                  if (dignity.includes('Exalted')) pColor = '#4ade80'; // bright green
                  else if (dignity.includes('Own')) pColor = '#fbbf24'; // gold
                  else if (dignity.includes('Debilitated')) pColor = '#f87171'; // red

                  // Offset multiple planets inside house center
                  const total = housePlanets.length;
                  const rowOffset = (idx - (total - 1) / 2) * 14;

                  return (
                    <text
                      key={pName}
                      x={h.center.x}
                      y={h.center.y + rowOffset}
                      fill={pColor}
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="central"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPlanet?.(pName);
                      }}
                      className="hover:scale-110 transition-transform cursor-pointer"
                    >
                      {PLANET_SHORT[pName] || pName}
                      {isRetro ? <tspan fill="#ec4899" fontSize="8">(R)</tspan> : null}
                    </text>
                  );
                })}
              </g>
            </g>
          );
        })}

        {/* Outer boundary stroke */}
        <rect
          x="1"
          y="1"
          width="398"
          height="398"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};
