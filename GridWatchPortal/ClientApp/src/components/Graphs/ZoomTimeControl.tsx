import * as Slider from "@radix-ui/react-slider";
import { useEffect, useState } from "react";

type Props = {
  range: [number, number];
  domain: [number, number];
  onChange: (range: [number, number]) => void;
  onReset: () => void;
};

export default function ZoomTimeControl({ range, domain, onChange, onReset }: Props) {
  const [localRange, setLocalRange] = useState<[number, number]>(range);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setLocalRange(range);
  }, [range]);

  const handleChange = (val: number[]) => {
    const sorted: [number, number] = [Math.min(...val), Math.max(...val)];
    setLocalRange(sorted);
    onChange(sorted);
  };

const handleReset = () => {
  const fullRange: [number, number] = [domain[0], domain[1]];
  setLocalRange(fullRange);
  onReset();
  setIsDragging(false); // Remove glow after reset
};


  return (
    <div className="w-full mt-4 px-4">
      <div className="w-full bg-card/80 backdrop-blur-sm shadow-lg rounded-md px-4 py-3 flex flex-col items-center gap-2">
        <Slider.Root
          className="relative w-full h-3 transition-all duration-75"
          value={localRange}
          min={domain[0]}
          max={domain[1]}
          step={1}
          onValueChange={handleChange}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          minStepsBetweenThumbs={0}
          aria-label="Zoom Time Range"
        >
          {/* Flat gradient track */}
          <Slider.Track className="relative h-full rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 rounded-full" />
          </Slider.Track>

          {/* Glowing range fill during drag */}
          <Slider.Range
            className={`absolute h-full rounded-full transition-all duration-75 ${
              isDragging
                ? "bg-blue-400 shadow-[0_0_8px_2px_rgba(59,130,246,0.5)]"
                : "bg-blue-500 dark:bg-blue-400"
            }`}
          />

          {/* Floating thumbs */}
          <Slider.Thumb
            className="block w-4 h-4 bg-blue-800 border-2 border-white dark:border-black rounded-full shadow-lg hover:scale-110 transition-transform z-10"
            aria-label="Zoom Start"
          />
          <Slider.Thumb
            className="block w-4 h-4 bg-blue-800 border-2 border-white dark:border-black rounded-full shadow-lg hover:scale-110 transition-transform z-10"
            aria-label="Zoom End"
          />
        </Slider.Root>

        {/* Time labels and reset */}
        <div className="flex items-center justify-between w-full mt-1">
          <span className="text-sm font-mono text-blue-900 dark:text-blue-300 tabular-nums">
            {new Date(localRange[0]).toLocaleTimeString()}
          </span>
          <button
            onClick={handleReset}
            className="px-3 py-1 text-sm rounded bg-blue-800 text-white hover:bg-blue-700 font-semibold shadow"
          >
            Reset
          </button>
          <span className="text-sm font-mono text-blue-900 dark:text-blue-300 tabular-nums">
            {new Date(localRange[1]).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
