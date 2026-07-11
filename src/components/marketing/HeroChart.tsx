"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  CrosshairMode,
  type AutoscaleInfoProvider,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { formatMarketCap } from "@/lib/chart-format";
import { getHeroChartSlices } from "@/lib/hero-demo-candles";

const heroAutoscale: AutoscaleInfoProvider = (original) => {
  const base = original();
  if (!base?.priceRange) {
    return base;
  }

  const { minValue, maxValue } = base.priceRange;
  const range = maxValue - minValue;
  const pad = Math.max(range * 0.22, 5_000);

  return {
    priceRange: {
      minValue: minValue - pad,
      maxValue: maxValue + pad,
    },
  };
};

const toSeriesData = (candles: ReturnType<typeof getHeroChartSlices>["visible"]) =>
  candles.map((c) => ({
    time: c.time as UTCTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));

const HeroChart = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const freezeLineRef = useRef<ReturnType<ISeriesApi<"Candlestick">["createPriceLine"]> | null>(
    null,
  );

  const { visible, freezeTimestamp } = useMemo(() => getHeroChartSlices(), []);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6b6b78",
        fontFamily: "var(--font-plex-mono)",
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
        scaleMargins: { top: 0.18, bottom: 0.14 },
      },
      localization: {
        priceFormatter: formatMarketCap,
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 4,
        rightOffset: 12,
      },
      crosshair: {
        mode: CrosshairMode.Hidden,
      },
      handleScroll: false,
      handleScale: false,
      width: containerRef.current.clientWidth,
      height: 260,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#14f195",
      downColor: "#ff4d6d",
      borderVisible: false,
      wickUpColor: "#14f195",
      wickDownColor: "#ff4d6d",
      autoscaleInfoProvider: heroAutoscale,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      chart.applyOptions({ width: entry.contentRect.width });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      freezeLineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) {
      return;
    }

    seriesRef.current.setData(toSeriesData(visible));
    const timeScale = chartRef.current?.timeScale();
    timeScale?.fitContent();
    timeScale?.applyOptions({ barSpacing: 4, rightOffset: 12 });

    if (freezeLineRef.current) {
      seriesRef.current.removePriceLine(freezeLineRef.current);
      freezeLineRef.current = null;
    }

    const freezeCandle = visible.find((c) => c.time === freezeTimestamp);
    if (freezeCandle) {
      freezeLineRef.current = seriesRef.current.createPriceLine({
        price: freezeCandle.high,
        color: "rgba(20,241,149,0.45)",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: false,
        title: "",
      });
    }
  }, [visible, freezeTimestamp]);

  return (
    <div
      className="panel select-none overflow-hidden p-4 sm:p-5"
      aria-label="Demo reversal drill preview"
    >
      <div className="mb-3 flex items-center justify-between border-b border-[#23232a] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center border border-[#23232a] bg-[#08080a] font-mono text-[0.6rem] font-semibold text-[#6b6b78]">
            ??
          </div>
          <div>
            <p className="font-mono text-xs text-[#6b6b78]">????</p>
            <p className="text-[0.65rem] text-[#4a4a55]">Name hidden until you choose</p>
          </div>
        </div>
        <span className="tag px-2 py-1 text-[#14f195]">frozen</span>
      </div>

      <div className="pointer-events-none relative overflow-hidden rounded-sm border border-[#23232a]/60 bg-[#08080a]/40">
        <div ref={containerRef} className="w-full" />
      </div>

      <div className="pointer-events-none mt-4 grid grid-cols-2 gap-2">
        <div className="rounded border border-[#ff4d6d]/35 bg-[#ff4d6d]/5 py-2.5 text-center font-mono text-xs text-[#ffb3c1]">
          Exit
        </div>
        <div className="rounded border border-[#38bdf8]/35 bg-[#38bdf8]/5 py-2.5 text-center font-mono text-xs text-[#a5e8ff]">
          Hold
        </div>
      </div>

      <p className="mt-3 text-center font-mono text-[0.6rem] uppercase tracking-wider text-[#4a4a55]">
        Demo preview · replay unlocks in the drill
      </p>
    </div>
  );
};

export default HeroChart;
