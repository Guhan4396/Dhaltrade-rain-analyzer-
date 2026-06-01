export default function WindyMap() {
  return (
    <section>
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-lg font-bold text-[#0F172A] border-l-4 border-[#0F172A] pl-3">
          Live Rainfall Map — Urad Belt
        </h2>
        <span className="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          LIVE
        </span>
      </div>
      <p className="text-[12px] text-gray-500 mb-3 pl-3">
        Always live — centered on Gulbarga to Vidarbha
      </p>
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <iframe
          src="https://embed.windy.com/embed2.html?lat=17.5&lon=77.5&zoom=6&level=surface&overlay=rain&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1"
          className="w-full"
          style={{ height: "320px" }}
          // @ts-ignore
          frameBorder="0"
          title="Windy rainfall map — Gulbarga to Vidarbha urad belt"
        />
      </div>
      <p className="text-[11px] text-gray-400 mt-1.5 text-center">
        Tap to interact. Showing live rainfall over the urad growing belt.
      </p>
    </section>
  )
}
