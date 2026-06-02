export default function Loading() {
  return (
    <div className="ua-bg min-h-screen px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-center py-6 mb-6">
          <div className="w-96 h-12 rounded-full shimmer-bg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ua-event-card">
              <div className="h-40 shimmer-bg" />
              <div className="p-4 space-y-2.5">
                <div className="h-3 w-1/2 rounded-full shimmer-bg" />
                <div className="h-4 w-full rounded-full shimmer-bg" />
                <div className="h-3 w-3/4 rounded-full shimmer-bg" />
                <div className="h-2 w-full rounded-full bg-[#FFE566] mt-2" />
              </div>
              <div className="h-11 shimmer-bg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
