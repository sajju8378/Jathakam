import React from 'react';
import { DivisionalChart, PlanetPosition } from '../types/astro';

interface Props {
  chart: DivisionalChart;
  planetsMap?: Record<string, PlanetPosition>;
  onSelectPlanet?: (planetName: string) => void;
  onSelectSign?: (signNum: number) => void;
}

const RASHIS_SOUTH = [
  { id: 12, name: 'Pisces', sa: 'Meena', row: 0, col: 0 },
  { id: 1, name: 'Aries', sa: 'Mesha', row: 0, col: 1 },
  { id: 2, name: 'Taurus', sa: 'Vrishabha', row: 0, col: 2 },
  { id: 3, name: 'Gemini', sa: 'Mithuna', row: 0, col: 3 },
  { id: 4, name: 'Cancer', sa: 'Karka', row: 1, col: 3 },
  { id: 5, name: 'Leo', sa: 'Simha', row: 2, col: 3 },
  { id: 6, name: 'Virgo', sa: 'Kanya', row: 3, col: 3 },
  { id: 7, name: 'Libra', sa: 'Tula', row: 3, col: 2 },
  { id: 8, name: 'Scorpio', sa: 'Vrishchika', row: 3, col: 1 },
  { id: 9, name: 'Sagittarius', sa: 'Dhanu', row: 3, col: 0 },
  { id: 10, name: 'Capricorn', sa: 'Makara', row: 2, col: 0 },
  { id: 11, name: 'Aquarius', sa: 'Kumbha', row: 1, col: 0 },
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

export const SouthIndianChart: React.FC<Props> = ({
  chart,
  planetsMap,
  onSelectPlanet,
  onSelectSign
}) => {
  const ascSign = chart.ascendant_sign;
  const cellSize = 100;

  return (
    <div className="w-full max-w-[500px] mx-auto select-none">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto drop-shadow-xl bg-slate-950 border border-amber-500/30 rounded-xl overflow-hidden font-sans"
      >
        {/* Center Box for Chart Title & Division Info */}
        <rect
          x="100"
          y="100"
          width="200"
          height="200"
          fill="#0b0f19"
          stroke="#b45309"
          strokeWidth="1.5"
        />
        <text
          x="200"
          y="180"
          fill="#f59e0b"
          fontSize="18"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {chart.code}
        </text>
        <text
          x="200"
          y="205"
          fill="#94a3b8"
          fontSize="12"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {chart.title}
        </text>
        <text
          x="200"
          y="225"
          fill="#64748b"
          fontSize="10"
          textAnchor="middle"
          dominantBaseline="central"
        >
          South Indian Style
        </text>

        {/* 12 Rashi Perimeter Boxes */}
        {RASHIS_SOUTH.map((r) => {
          const x = r.col * cellSize;
          const y = r.row * cellSize;
          const isAscendant = ascSign === r.id;
          const signPlanets = chart.sign_to_planets[r.id.toString()] || [];

          return (
            <g
              key={r.id}
              onClick={() => onSelectSign?.(r.id)}
              className="cursor-pointer"
            >
              <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={isAscendant ? '#1e1b4b' : '#0f172a'}
                stroke="#b45309"
                strokeWidth="1.2"
                className="transition-colors hover:fill-amber-950/40"
              />

              {/* Ascendant Lagna diagonal slash */}
              {isAscendant && (
                <line
                  x1={x}
                  y1={y}
                  x2={x + cellSize}
                  y2={y + cellSize}
                  stroke="#ec4899"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              )}

              {/* Sign label */}
              <text
                x={x + 6}
                y={y + 12}
                fill="#64748b"
                fontSize="9"
                fontWeight="500"
              >
                {r.name.slice(0, 3)}
              </text>

              {/* ASC badge */}
              {isAscendant && (
                <text
                  x={x + cellSize - 8}
                  y={y + 12}
                  fill="#f43f5e"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  ASC
                </text>
              )}

              {/* Planets */}
              <g>
                {signPlanets.map((pName, idx) => {
                  const pObj = planetsMap?.[pName];
                  const isRetro = pObj?.is_retrograde;
                  const dignity = pObj?.dignity || '';

                  let pColor = '#38bdf8';
                  if (dignity.includes('Exalted')) pColor = '#4ade80';
                  else if (dignity.includes('Own')) pColor = '#fbbf24';
                  else if (dignity.includes('Debilitated')) pColor = '#f87171';

                  const colIdx = idx % 2;
                  const rowIdx = Math.floor(idx / 2);
                  const px = x + 25 + colIdx * 50;
                  const py = y + 36 + rowIdx * 18;

                  return (
                    <text
                      key={pName}
                      x={px}
                      y={py}
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

        {/* Outer border */}
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
