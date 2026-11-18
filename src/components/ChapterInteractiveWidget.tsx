import React, { useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import type { InteractiveKind } from '../its/types';
import { MAP_ILLUSTRATION_URL, RECIPE_ILLUSTRATION_URL } from '../its/chapters';

interface ChapterInteractiveWidgetProps {
  kind: InteractiveKind;
  onInteract: () => void;
}

export const ChapterInteractiveWidget: React.FC<ChapterInteractiveWidgetProps> = ({
  kind,
  onInteract,
}) => {
  // ch1: ratio_compare + simplify
  const [lemons, setLemons] = useState(2);
  const [water, setWater] = useState(3);
  const [swapOrder, setSwapOrder] = useState(false);
  const [simplifyDivisor, setSimplifyDivisor] = useState(1);

  // ch2: equivalent_scaler
  const [scaleOp, setScaleOp] = useState<'div2' | 'x1' | 'x2' | 'x3'>('x2');
  const baseCh2A = 4;
  const baseCh2B = 6;

  // ch3: recipe_mixer
  const [servings, setServings] = useState(4);
  const [showUnbalancedDemo, setShowUnbalancedDemo] = useState(false);

  // ch4: map_ruler
  const [kmPerCm, setKmPerCm] = useState(5);
  const [mapCm, setMapCm] = useState(4);
  const [mapMode, setMapMode] = useState<'to_real' | 'to_map'>('to_real');

  // ch5: challenge_review
  const [litersWater, setLitersWater] = useState(1);
  const [glassesTarget, setGlassesTarget] = useState(6);

  if (kind === 'ratio_compare') {
    const rawLeft = 6;
    const rawRight = 9;
    const simpLeft = rawLeft / simplifyDivisor;
    const simpRight = rawRight / simplifyDivisor;

    return (
      <div className="space-y-5">
        <div className="rounded-xl bg-[#F7F9FF] border border-[#EEF0F5] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#46546A]">
              1. Compare quantities and check order
            </h3>
            <button
              type="button"
              onClick={() => {
                setSwapOrder((v) => !v);
                onInteract();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#DCE2F0] text-[#795BFF] hover:border-[#795BFF] transition-colors cursor-pointer"
            >
              {swapOrder ? 'Order: Water to Lemons' : 'Order: Lemons to Water'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#EEF0F5] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#46546A]">Lemons</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Decrease lemons"
                    onClick={() => {
                      setLemons((n) => Math.max(1, n - 1));
                      onInteract();
                    }}
                    className="w-7 h-7 rounded-lg bg-[#F7F9FF] border border-[#DCE2F0] flex items-center justify-center hover:border-[#795BFF] cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold font-mono-math">{lemons}</span>
                  <button
                    type="button"
                    aria-label="Increase lemons"
                    onClick={() => {
                      setLemons((n) => Math.min(6, n + 1));
                      onInteract();
                    }}
                    className="w-7 h-7 rounded-lg bg-[#F7F9FF] border border-[#DCE2F0] flex items-center justify-center hover:border-[#795BFF] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {Array.from({ length: lemons }).map((_, i) => (
                  <span
                    key={i}
                    className="w-7 h-7 rounded-full bg-[#FFD83D] text-[#46546A] text-xs font-bold flex items-center justify-center"
                  >
                    L
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#EEF0F5] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#46546A]">Glasses of water</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Decrease water"
                    onClick={() => {
                      setWater((n) => Math.max(1, n - 1));
                      onInteract();
                    }}
                    className="w-7 h-7 rounded-lg bg-[#F7F9FF] border border-[#DCE2F0] flex items-center justify-center hover:border-[#795BFF] cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold font-mono-math">{water}</span>
                  <button
                    type="button"
                    aria-label="Increase water"
                    onClick={() => {
                      setWater((n) => Math.min(6, n + 1));
                      onInteract();
                    }}
                    className="w-7 h-7 rounded-lg bg-[#F7F9FF] border border-[#DCE2F0] flex items-center justify-center hover:border-[#795BFF] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {Array.from({ length: water }).map((_, i) => (
                  <span
                    key={i}
                    className="w-7 h-7 rounded-lg bg-[#42C5E8] text-white text-xs font-bold flex items-center justify-center"
                  >
                    W
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#EEF0F5] px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-[#6A768C]">
              {swapOrder ? 'Water to Lemons:' : 'Lemons to Water:'}
            </span>
            <span className="font-bold text-[#795BFF] font-mono-math text-lg">
              {swapOrder ? `${water} : ${lemons}` : `${lemons} : ${water}`} (or{' '}
              {swapOrder ? `${water} to ${lemons}` : `${lemons} to ${water}`})
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-[#F7F9FF] border border-[#EEF0F5] p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#46546A]">
                2. Try simplifying 6 : 9
              </h3>
              <p className="text-xs text-[#7C879C]">
                Divide both numbers by a common factor.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[1, 3].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setSimplifyDivisor(d);
                    onInteract();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono-math cursor-pointer ${
                    simplifyDivisor === d
                      ? 'bg-[#795BFF] text-white'
                      : 'bg-white border border-[#DCE2F0] text-[#46546A]'
                  }`}
                >
                  {d === 1 ? 'Original (6 : 9)' : 'Divide both by 3'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#EEF0F5] px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-[#6A768C]">
              {simplifyDivisor === 1 ? 'Current ratio:' : 'Simplest form:'}
            </span>
            <span className="text-lg font-bold text-[#24A16B] font-mono-math">
              {simpLeft} : {simpRight}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'equivalent_scaler') {
    const multiplier =
      scaleOp === 'div2' ? 0.5 : scaleOp === 'x1' ? 1 : scaleOp === 'x2' ? 2 : 3;
    const multA = baseCh2A * multiplier;
    const multB = baseCh2B * multiplier;
    const addDelta = scaleOp === 'div2' ? 1 : multiplier;
    const addA = baseCh2A + addDelta;
    const addB = baseCh2B + addDelta;

    return (
      <div className="rounded-xl bg-[#F7F9FF] border border-[#EEF0F5] p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#46546A]">
              Scale 4 : 6 by dividing or multiplying
            </h3>
            <p className="text-xs text-[#7C879C]">
              Compare dividing/multiplying both sides equally with adding.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'div2', label: '/ 2' },
                { id: 'x1', label: 'x1' },
                { id: 'x2', label: 'x2' },
                { id: 'x3', label: 'x3' },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  setScaleOp(btn.id);
                  onInteract();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono-math cursor-pointer ${
                  scaleOp === btn.id
                    ? 'bg-[#795BFF] text-white'
                    : 'bg-white border border-[#DCE2F0] text-[#46546A] hover:border-[#795BFF]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-[#BCEAD5] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#24A16B]">
                Scale both equally ({scaleOp === 'div2' ? '/ 2' : `x${multiplier}`})
              </span>
              <span className="text-base font-bold text-[#46546A] font-mono-math">
                {multA} : {multB}
              </span>
            </div>
            <div className="flex items-center gap-1.5 h-6">
              <div
                className="h-full rounded bg-[#795BFF]"
                style={{ width: `${(multA / (multA + multB)) * 100}%` }}
              />
              <div
                className="h-full rounded bg-[#42C5E8]"
                style={{ width: `${(multB / (multA + multB)) * 100}%` }}
              />
            </div>
            <p className="text-xs text-[#6A768C]">
              Equivalent! Always keeps the exact 40% to 60% balance.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#EEF0F5] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7C879C]">
                Adding {addDelta} to both
              </span>
              <span className="text-base font-bold text-[#46546A] font-mono-math">
                {addA} : {addB}
              </span>
            </div>
            <div className="flex items-center gap-1.5 h-6">
              <div
                className="h-full rounded bg-[#B9A9FF]"
                style={{ width: `${(addA / (addA + addB)) * 100}%` }}
              />
              <div
                className="h-full rounded bg-[#9ADFF2]"
                style={{ width: `${(addB / (addA + addB)) * 100}%` }}
              />
            </div>
            <p className="text-xs text-[#6A768C]">
              Not equivalent ({Math.round((addA / (addA + addB)) * 100)}% to{' '}
              {Math.round((addB / (addA + addB)) * 100)}%).
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'recipe_mixer') {
    const factor = servings / 2;
    const flour = 2 * factor;
    const sugar = showUnbalancedDemo ? 1 : 1 * factor;
    const milk = showUnbalancedDemo ? 3 : 3 * factor;

    return (
      <div className="rounded-xl bg-[#F7F9FF] border border-[#EEF0F5] p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={RECIPE_ILLUSTRATION_URL}
              alt="Recipe ingredients illustration"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-xl object-cover border border-[#EEF0F5] shrink-0"
            />
            <div>
              <h3 className="text-sm font-semibold text-[#46546A]">
                Pancake recipe scaler
              </h3>
              <p className="text-xs text-[#7C879C]">
                Base for 2 servings: 2 cups flour, 1 spoon sugar, 3 cups milk.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {[2, 4, 6, 8].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setServings(s);
                  onInteract();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  servings === s
                    ? 'bg-[#795BFF] text-white'
                    : 'bg-white border border-[#DCE2F0] text-[#46546A] hover:border-[#795BFF]'
                }`}
              >
                {s} servings
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Flour', qty: flour, unit: 'cups', color: 'bg-[#795BFF]' },
            { name: 'Sugar', qty: sugar, unit: sugar === 1 ? 'spoon' : 'spoons', color: 'bg-[#FFD83D]' },
            { name: 'Milk', qty: milk, unit: 'cups', color: 'bg-[#42C5E8]' },
          ].map((ing) => (
            <div
              key={ing.name}
              className="bg-white rounded-xl border border-[#EEF0F5] p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#46546A]">{ing.name}</span>
                <span className="font-bold text-[#795BFF] font-mono-math">
                  {ing.qty} {ing.unit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#EEF0F5] overflow-hidden">
                <div
                  className={`h-full rounded-full ${ing.color}`}
                  style={{ width: `${Math.min(100, (ing.qty / 12) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-[#EEF0F5] px-4 py-3 text-xs">
          <div className="space-y-0.5">
            <div className="font-mono-math font-semibold text-[#46546A]">
              Ratio: {flour} : {sugar} : {milk}{' '}
              {showUnbalancedDemo && factor > 1
                ? '(Unbalanced! Only flour changed)'
                : `(All scaled by x${factor})`}
            </div>
            {showUnbalancedDemo && factor > 1 && (
              <div className="text-[#D9536F]">
                Leaving sugar and milk at 1 and 3 makes the batter too dry and unsweetened.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setShowUnbalancedDemo((v) => !v);
              onInteract();
            }}
            className="px-3 py-1.5 rounded-lg font-semibold bg-[#F7F9FF] border border-[#DCE2F0] text-[#795BFF] hover:border-[#795BFF] cursor-pointer"
          >
            {showUnbalancedDemo ? 'Fix recipe scaling' : 'Test changing only flour'}
          </button>
        </div>
      </div>
    );
  }

  if (kind === 'map_ruler') {
    const realKm = mapCm * kmPerCm;

    return (
      <div className="rounded-xl bg-[#F7F9FF] border border-[#EEF0F5] p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={MAP_ILLUSTRATION_URL}
              alt="Map scale ruler illustration"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-xl object-cover border border-[#EEF0F5] shrink-0"
            />
            <div>
              <h3 className="text-sm font-semibold text-[#46546A]">
                Interactive map ruler
              </h3>
              <p className="text-xs text-[#7C879C]">
                Choose a map scale and slide to convert between cm and km.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {[2, 5, 10].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => {
                  setKmPerCm(rate);
                  onInteract();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono-math cursor-pointer ${
                  kmPerCm === rate
                    ? 'bg-[#795BFF] text-white'
                    : 'bg-white border border-[#DCE2F0] text-[#46546A] hover:border-[#795BFF]'
                }`}
              >
                1 cm = {rate} km
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#EEF0F5] p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#6A768C]">Direction:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setMapMode('to_real');
                  onInteract();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  mapMode === 'to_real'
                    ? 'bg-[#42C5E8] text-white'
                    : 'bg-[#F7F9FF] text-[#6A768C]'
                }`}
              >
                Map cm to Real km
              </button>
              <button
                type="button"
                onClick={() => {
                  setMapMode('to_map');
                  onInteract();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  mapMode === 'to_map'
                    ? 'bg-[#42C5E8] text-white'
                    : 'bg-[#F7F9FF] text-[#6A768C]'
                }`}
              >
                Real km to Map cm
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6A768C]">
            <span>Town A</span>
            <span className="font-mono-math font-semibold text-[#795BFF]">
              {mapCm} cm on map ({realKm} km real)
            </span>
            <span>Town B</span>
          </div>

          <div className="h-3 rounded-full bg-[#EEF0F5] overflow-hidden">
            <div
              className="h-full bg-[#42C5E8] rounded-full"
              style={{ width: `${(mapCm / 8) * 100}%` }}
            />
          </div>

          <label className="block">
            <span className="sr-only">Map distance slider</span>
            <input
              type="range"
              min={1}
              max={8}
              value={mapCm}
              onChange={(e) => {
                setMapCm(Number(e.target.value));
                onInteract();
              }}
              className="w-full accent-[#795BFF] cursor-pointer"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-sm">
            <span className="text-[#6A768C] font-mono-math">
              {mapMode === 'to_real'
                ? `${mapCm} cm x ${kmPerCm} km`
                : `${realKm} km / ${kmPerCm} km per cm`}
            </span>
            <span className="font-bold text-[#795BFF] font-mono-math text-base">
              {mapMode === 'to_real'
                ? `Real distance: ${realKm} km`
                : `Map distance: ${mapCm} cm`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ch5: challenge_review
  const waterMl = litersWater * 1000;
  const lemonsNeeded = glassesTarget / 2;

  return (
    <div className="rounded-xl bg-[#F7F9FF] border border-[#EEF0F5] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#46546A]">
          Mixed warm-up: units and batch scaling
        </h3>
        <button
          type="button"
          onClick={() => {
            setLitersWater(1);
            setGlassesTarget(6);
            onInteract();
          }}
          className="text-xs text-[#7C879C] hover:text-[#795BFF] inline-flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#EEF0F5] p-4 space-y-2.5">
          <div className="text-xs font-semibold text-[#795BFF]">Unit matcher</div>
          <p className="text-xs text-[#6A768C]">
            Compare 500 ml of juice with {litersWater} L of water.
          </p>
          <div className="flex items-center gap-2">
            {[1, 2].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLitersWater(l);
                  onInteract();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono-math cursor-pointer ${
                  litersWater === l
                    ? 'bg-[#795BFF] text-white'
                    : 'bg-[#F7F9FF] border border-[#DCE2F0] text-[#46546A]'
                }`}
              >
                {l} L
              </button>
            ))}
          </div>
          <div className="text-xs font-mono-math text-[#46546A] pt-1">
            500 ml : {waterMl} ml = 1 : {waterMl / 500}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#EEF0F5] p-4 space-y-2.5">
          <div className="text-xs font-semibold text-[#42C5E8]">Batch planner</div>
          <p className="text-xs text-[#6A768C]">
            2 glasses need 1 lemon. Choose total glasses:
          </p>
          <div className="flex items-center gap-2">
            {[4, 6, 8, 10].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGlassesTarget(g);
                  onInteract();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono-math cursor-pointer ${
                  glassesTarget === g
                    ? 'bg-[#42C5E8] text-white'
                    : 'bg-[#F7F9FF] border border-[#DCE2F0] text-[#46546A]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="text-xs font-mono-math text-[#46546A] pt-1">
            {glassesTarget} glasses need {lemonsNeeded} lemons
          </div>
        </div>
      </div>
    </div>
  );
};
