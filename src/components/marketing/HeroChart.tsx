"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { formatMarketCap } from "@/lib/chart-format";
import { getHeroChartSlices } from "@/lib/hero-demo-candles";

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
  const ghostRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const { visible, hidden, freezeTimestamp } = useMemo(() => getHeroChartSlices(), []);

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
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
      },
      localization: {
        priceFormatter: formatMarketCap,
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: "rgba(20,241,149,0.35)" },
        horzLine: { color: "rgba(20,241,149,0.35)" },
      },
      width: containerRef.current.clientWidth,
      height: 280,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#14f195",
      downColor: "#ff4d6d",
      borderVisible: false,
      wickUpColor: "#14f195",
      wickDownColor: "#ff4d6d",
    });

    const ghost = chart.addSeries(CandlestickSeries, {
      upColor: "rgba(20,241,149,0.22)",
      downColor: "rgba(255,77,109,0.22)",
      borderVisible: false,
      wickUpColor: "rgba(20,241,149,0.22)",
      wickDownColor: "rgba(255,77,109,0.22)",
    });

    chartRef.current = chart;
    seriesRef.current = series;
    ghostRef.current = ghost;

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
      ghostRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !ghostRef.current) {
      return;
    }

    seriesRef.current.setData(toSeriesData(visible));
    ghostRef.current.setData(toSeriesData(hidden));
    chartRef.current?.timeScale().fitContent();

    const freezeCandle = visible.find((c) => c.time === freezeTimestamp);
    if (freezeCandle) {
      seriesRef.current.createPriceLine({
        price: freezeCandle.high,
        color: "rgba(20,241,149,0.55)",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "freeze",
      });
    }
  }, [visible, hidden, freezeTimestamp]);

  return (
    <div className="panel relative overflow-hidden p-4 sm:p-6" aria-hidden>
      <div className="mb-4 flex items-center justify-between border-b border-[#23232a] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center border border-[#23232a] bg-[#08080a] font-mono text-[0.6rem] font-semibold text-[#14f195]">
            ??
          </div>
          <div>
            <p className="font-mono text-xs font-semibold blur-sm">????</p>
            <p className="text-[0.65rem] text-[#6b6b78]">Revealed after your call</p>
          </div>
        </div>
        <span className="tag px-2 py-1 text-[#14f195]">frozen</span>
      </div>

      <div className="relative">
        <div ref={containerRef} className="w-full" />
        <div className="pointer-events-none absolute left-3 top-3 tag px-2 py-1 text-[0.55rem] text-[#14f195]">
          frozen
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="btn-exit py-2.5 text-center font-mono text-xs">Exit</div>
        <div className="btn-hold py-2.5 text-center font-mono text-xs">Hold</div>
      </div>

      <p className="mt-3 text-center font-mono text-[0.6rem] uppercase tracking-wider text-[#4a4a55]">
        Hidden candles replay after you choose
      </p>
    </div>
  );
};

export default HeroChart;
