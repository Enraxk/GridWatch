type Props = {
  onExport: (format: "png" | "csv") => void;
};

export default function ExportButton({ onExport }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-background shadow-md rounded px-3 py-2 space-y-1">
        <button onClick={() => onExport("png")} className="w-full text-left">
          Export PNG
        </button>
        <button onClick={() => onExport("csv")} className="w-full text-left">
          Export CSV
        </button>
      </div>
    </div>
  );
}

