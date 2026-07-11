"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { formatMarketCap } from "@/lib/chart-format";

export type ChartCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type ChartReplayProps = {
  cardId: string;
  visibleCandles: ChartCandle[];
  replayCandles: ChartCandle[];
  freezeTimestamp: number;
  isReplaying: boolean;
  onReplayComplete?: () => void;
};

const toSeriesData = (candles: ChartCandle[]) =>
  candles.map((c) => ({
    time: c.time as UTCTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));

const ChartReplay = ({
  cardId,
  visibleCandles,
  replayCandles,
  freezeTimestamp,
  isReplaying,
  onReplayComplete,
}: ChartReplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const freezeLineRef = useRef<ReturnType<ISeriesApi<"Candlestick">["createPriceLine"]> | null>(null);
  const onCompleteRef = useRef(onReplayComplete);
  const [replayCount, setReplayCount] = useState(0);

  useEffect(() => {
    onCompleteRef.current = onReplayComplete;
  }, [onReplayComplete]);

  const displayedCandles = useMemo(() => {
    if (isReplaying) {
      return [...visibleCandles, ...replayCandles.slice(0, replayCount)];
    }

    if (replayCount > 0) {
      return [...visibleCandles, ...replayCandles];
    }

    return visibleCandles;
  }, [visibleCandles, replayCandles, isReplaying, replayCount]);

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
      height: 320,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#14f195",
      downColor: "#ff4d6d",
      borderVisible: false,
      wickUpColor: "#14f195",
      wickDownColor: "#ff4d6d",
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
    if (!seriesRef.current || displayedCandles.length === 0) {
      return;
    }

    seriesRef.current.setData(toSeriesData(displayedCandles));
    chartRef.current?.timeScale().fitContent();

    if (freezeLineRef.current) {
      seriesRef.current.removePriceLine(freezeLineRef.current);
      freezeLineRef.current = null;
    }

    const freezeCandle = displayedCandles.find((c) => c.time === freezeTimestamp);
    if (freezeCandle && !isReplaying) {
      freezeLineRef.current = seriesRef.current.createPriceLine({
        price: freezeCandle.high,
        color: "rgba(20,241,149,0.55)",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "freeze",
      });
    }
  }, [displayedCandles, freezeTimestamp, isReplaying]);

  useEffect(() => {
    if (!isReplaying || replayCandles.length === 0) {
      return;
    }

    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setReplayCount(index);

      if (index >= replayCandles.length) {
        window.clearInterval(intervalId);
        onCompleteRef.current?.();
      }
    }, 180);

    return () => window.clearInterval(intervalId);
  }, [isReplaying, replayCandles.length, cardId]);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="w-full"
        role="img"
        aria-label="Token price chart with freeze point before reversal"
      />
      {!isReplaying && replayCount === 0 && (
        <div className="pointer-events-none absolute left-3 top-3 tag px-2 py-1 text-[#14f195]">
          frozen
        </div>
      )}
      {isReplaying && (
        <div className="pointer-events-none absolute left-3 top-3 tag px-2 py-1 text-[#38bdf8]">
          replay
        </div>
      )}
    </div>
  );
};

export default ChartReplay;
