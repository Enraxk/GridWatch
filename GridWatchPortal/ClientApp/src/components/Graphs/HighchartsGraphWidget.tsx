import { useEffect, useMemo, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import exporting from "highcharts/modules/exporting";
import exportData from "highcharts/modules/export-data";
import fullScreen from "highcharts/modules/full-screen";



export type GraphPoint = {
  timestamp: string;
  value: number;
};

export type GraphSeries = {
  seriesName: string;
  unit: string;
  feederId: string;
  dataPoints: GraphPoint[];
};

type Props = {
  title: string;
  series: GraphSeries[];
};

export default function HighchartsGraphWidget({ title, series }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [modulesLoaded, setModulesLoaded] = useState(false);

  // ✅ Detect Tailwind dark mode class
  useEffect(() => {
    if (!containerRef.current) return;
    const root = containerRef.current.closest(".dark");
    setIsDarkMode(!!root);
  }, []);

useEffect(() => {
  if (typeof window !== "undefined") {
    // @ts-ignore
    require("highcharts/modules/exporting")(Highcharts);
    // @ts-ignore
    require("highcharts/modules/export-data")(Highcharts);
    // @ts-ignore
    require("highcharts/modules/full-screen")(Highcharts);
  }
}, []);


  const options = useMemo(() => {
    const categories = series[0]?.dataPoints.map((p) =>
      new Date(p.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    const labelSeries = (s: GraphSeries) => {
      const phase = s.seriesName.split(" - ")[1];
      return [s.feederId || "Feeder 1", phase].filter(Boolean).join(" • ");
    };

    return {
      chart: {
        zoomType: "x",
        backgroundColor: isDarkMode ? "#1e1e2f" : "#ffffff",
        style: {
          fontFamily: "inherit",
        },
      },
      title: {
        text: title,
        style: { color: isDarkMode ? "#ffffff" : "#000000" },
      },
      xAxis: {
        categories,
        title: { text: "Time" },
        labels: {
          style: { color: isDarkMode ? "#dddddd" : "#333333" },
        },
      },
      yAxis: {
        title: { text: series[0]?.unit || "Value" },
        labels: {
          style: { color: isDarkMode ? "#dddddd" : "#333333" },
        },
      },
      tooltip: {
        shared: true,
        xDateFormat: "%H:%M",
      },
      legend: {
        layout: "horizontal",
        align: "center",
        verticalAlign: "bottom",
        itemStyle: {
          color: isDarkMode ? "#cccccc" : "#333333",
        },
      },
      exporting: {
        enabled: true,
      },
      series: series.map((s) => ({
        name: labelSeries(s),
        data: s.dataPoints.map((p) => p.value),
        type: "line",
      })),
      credits: { enabled: false },
    } as Highcharts.Options;
  }, [series, title, isDarkMode]);

  return (
    <div
      ref={containerRef}
      className="border rounded-md p-4 bg-card text-card-foreground mb-6"
    >
      {modulesLoaded && (
        <HighchartsReact highcharts={Highcharts} options={options} />
      )}
    </div>
  );
}
