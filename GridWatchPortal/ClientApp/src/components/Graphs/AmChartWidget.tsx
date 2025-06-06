import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import { useLayoutEffect, useRef, useState } from "react";
import type { GraphSeries } from "./GraphWidget";
import ZoomTimeControl from "./ZoomTimeControl";
import ExportButton from "./ExportButton";

interface Props {
  title: string;
  series: GraphSeries[];
}

export default function AmChartWidget({ title, series }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const xAxisRef = useRef<am5xy.DateAxis<am5xy.AxisRendererX> | null>(null);
  const exportingRef = useRef<am5plugins_exporting.Exporting | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [zoomDomain, setZoomDomain] = useState<[number, number]>([0, 100]);
  const [zoomRange, setZoomRange] = useState<[number, number]>([0, 100]);

  useLayoutEffect(() => {
    const observerTarget = chartRef.current?.closest(".dark") || document.body;
    const updateTheme = () => setIsDark(observerTarget.classList.contains("dark"));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(observerTarget, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!chartRef.current) return;
    const root = am5.Root.new(chartRef.current);
    const textColor = isDark ? am5.color(0xffffff) : am5.color(0x000000);

    root.setThemes([
      new am5themes_Animated(root, true),
      ...(isDark ? [new am5themes_Dark(root, true)] : []),
    ]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "zoomX",
        wheelY: "zoomY",
        paddingLeft: 0,
        layout: root.verticalLayout,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "minute", count: 15 },
        renderer: am5xy.AxisRendererX.new(root, {}),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
    xAxis.get("renderer").labels.template.setAll({ fill: textColor });
     xAxisRef.current = xAxis as am5xy.DateAxis<am5xy.AxisRendererX>;

    const allTimestamps = series.flatMap((s) =>
      s.dataPoints.map((pt) => new Date(pt.timestamp).getTime())
    );
    const minTime = Math.min(...allTimestamps);
    const maxTime = Math.max(...allTimestamps);
    setZoomDomain([minTime, maxTime]);
    setZoomRange([minTime, maxTime]);

    const yAxesMap = new Map<string, am5xy.ValueAxis<am5xy.AxisRendererY>>();
    const allSeries: am5xy.LineSeries[] = [];

    const uniqueDeviceIds = [...new Set(series.map(s => s.deviceId).filter(Boolean))];
    const isMultiDeviceMode = uniqueDeviceIds.length > 1;

    const colorMap = new Map<string, am5.Color>();
    const colorPalette = am5.ColorSet.new(root, { step: 2, reuse: false });

    for (const s of series) {
      const baseType = s.graphType as any;
      let yAxis = yAxesMap.get(baseType);

      if (!yAxis) {
        yAxis = am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {
            opposite: yAxesMap.size % 2 === 1,
          }),
        });
        yAxis.get("renderer").labels.template.setAll({ fill: textColor });
        chart.yAxes.push(yAxis);
        yAxesMap.set(baseType, yAxis);
      }

      const parts = s.seriesName.split(" - ");
      const phaseName = parts.length >= 4 ? parts[3] : parts.at(-1) || "Unknown";

      const showFeeder = ["Current", "Power"].includes(s.graphType);
const isBusbar = s.feederId === "busbar";
const label = [
  isMultiDeviceMode ? s.deviceId : null,
  showFeeder && !isBusbar ? s.feederId : null,
  phaseName,
].filter(Boolean).join(" • ");

      if (!colorMap.has(s.deviceId)) {
        colorMap.set(s.deviceId, colorPalette.next());
      }

      const lineSeries = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: label,
          xAxis,
          yAxis,
          valueYField: "value",
          valueXField: "timestamp",
          stroke: colorMap.get(s.deviceId),
          tooltip: am5.Tooltip.new(root, {
            labelText: `${label}: {valueY} ${s.unit}`,
          }),
        })
      );

      const data = s.dataPoints.map((pt) => ({
        timestamp: new Date(pt.timestamp).getTime(),
        value: pt.value,
        unit: s.unit,
      }));

      lineSeries.data.setAll(data);
      allSeries.push(lineSeries);
      lineSeries.get("tooltip")?.label.setAll({ fill: textColor });
    }

    chart.set("cursor", am5xy.XYCursor.new(root, {}));
    chart.set("scrollbarX", undefined);

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 10,
        useDefaultMarker: true,
        layout: root.gridLayout,
      })
    );
    legend.data.setAll(allSeries);
    legend.labels.template.setAll({ fill: textColor });

    const exporting = am5plugins_exporting.Exporting.new(root, {
      menu: am5plugins_exporting.ExportingMenu.new(root, {
        align: "right",
      }),
    });
    exportingRef.current = exporting;

    return () => root.dispose();
  }, [series, isDark]);

  return (
    <div className="relative border rounded-md p-4 bg-card text-card-foreground mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div
        ref={chartRef}
        key={isDark ? "dark" : "light"}
        className="w-full min-h-[500px]"
      />
      <ZoomTimeControl
        domain={zoomDomain}
        range={zoomRange}
        onChange={(range) => {
          setZoomRange(range);
          xAxisRef.current?.zoomToValues(range[0], range[1]);
        }}
        onReset={() => {
          setZoomRange(zoomDomain);
          xAxisRef.current?.zoomToValues(zoomDomain[0], zoomDomain[1]);
        }}
      />
    </div>
  );
}
