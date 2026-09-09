import Link from "next/link";

export default function GenreGrid({ genres }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
      {genres.map((g) => (
        <Link
          key={g.id}
          href={`/genre/${g.id}`}
          className="rounded-lg p-4 h-24 flex flex-col justify-between"
          style={{ background: `linear-gradient(135deg, ${g.accent}44, #15120F)` }}
        >
          <span className="text-sm font-medium">{g.name}</span>
        </Link>
      ))}
    </div>
  );
}
