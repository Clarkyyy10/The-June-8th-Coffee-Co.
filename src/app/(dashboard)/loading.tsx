export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 h-8 w-64 rounded-lg skeleton" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl skeleton" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-80 rounded-xl skeleton lg:col-span-2" />
        <div className="h-80 rounded-xl skeleton" />
      </div>
    </div>
  );
}
