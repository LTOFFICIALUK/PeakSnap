const CANDLES = [
  { up: true, h: 28 },
  { up: true, h: 36 },
  { up: true, h: 44 },
  { up: true, h: 52 },
  { up: true, h: 58 },
  { up: true, h: 62 },
  { up: true, h: 68 },
  { up: true, h: 72 },
  { up: true, h: 74 },
  { up: false, h: 70 },
  { up: false, h: 58 },
  { up: false, h: 48 },
  { up: false, h: 38 },
  { up: false, h: 30 },
];

const FREEZE_INDEX = 8;

const HeroChart = () => {
  return (
    <div className="panel relative overflow-hidden p-4 sm:p-6" aria-hidden>
      <div className="mb-4 flex items-center justify-between border-b border-[#23232a] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center border border-[#23232a] bg-[#08080a] font-mono text-[0.6rem] font-semibold text-[#14f195]">
            MF
          </div>
          <div>
            <p className="font-mono text-xs font-semibold">$MOONFROG</p>
            <p className="text-[0.65rem] text-[#6b6b78]">+67% · volume cliff</p>
          </div>
        </div>
        <span className="tag px-2 py-1 text-[#14f195]">frozen</span>
      </div>

      <div className="relative flex h-48 items-end gap-1 sm:h-56 sm:gap-1.5">
        {CANDLES.map((candle, i) => {
          const isHidden = i > FREEZE_INDEX;
          const isFreeze = i === FREEZE_INDEX;

          return (
            <div
              key={i}
              className={`relative flex-1 transition-opacity ${isHidden ? "opacity-20" : "opacity-100"}`}
            >
              {isFreeze && (
                <div className="absolute -top-1 left-0 right-0 border-t border-dashed border-[#14f195]/60" />
              )}
              <div
                className={`mx-auto w-full max-w-[12px] rounded-sm ${
                  candle.up ? "bg-[#14f195]" : "bg-[#ff4d6d]"
                } ${isFreeze ? "ring-1 ring-[#14f195]/50" : ""}`}
                style={{ height: `${candle.h}%` }}
              />
            </div>
          );
        })}

        <div className="pointer-events-none absolute inset-y-0 left-[calc((100%/15)*9)] w-px bg-[#14f195]/40" />
        <div className="pointer-events-none absolute left-[calc((100%/15)*9+4px)] top-1/2 -translate-y-1/2">
          <span className="tag whitespace-nowrap px-1.5 py-0.5 text-[0.55rem] text-[#14f195]">
            you are here
          </span>
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
