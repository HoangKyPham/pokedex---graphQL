

export const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  normal: { bg: "bg-slate-400", text: "text-white", border: "border-slate-500" },
  fighting: { bg: "bg-orange-700", text: "text-white", border: "border-orange-800" },
  flying: { bg: "bg-indigo-400", text: "text-white", border: "border-indigo-500" },
  poison: { bg: "bg-purple-500", text: "text-white", border: "border-purple-600" },
  ground: { bg: "bg-amber-600", text: "text-white", border: "border-amber-700" },
  rock: { bg: "bg-yellow-600", text: "text-white", border: "border-yellow-700" },
  bug: { bg: "bg-lime-500", text: "text-white", border: "border-lime-600" },
  ghost: { bg: "bg-violet-700", text: "text-white", border: "border-violet-800" },
  steel: { bg: "bg-zinc-400", text: "text-white", border: "border-zinc-500" },
  fire: { bg: "bg-red-500", text: "text-white", border: "border-red-600" },
  water: { bg: "bg-blue-500", text: "text-white", border: "border-blue-600" },
  grass: { bg: "bg-emerald-500", text: "text-white", border: "border-emerald-600" },
  electric: { bg: "bg-yellow-400", text: "text-slate-900", border: "border-yellow-500" },
  psychic: { bg: "bg-pink-500", text: "text-white", border: "border-pink-600" },
  ice: { bg: "bg-cyan-400", text: "text-slate-900", border: "border-cyan-500" },
  dragon: { bg: "bg-indigo-700", text: "text-white", border: "border-indigo-800" },
  dark: { bg: "bg-stone-700", text: "text-white", border: "border-stone-800" },
  fairy: { bg: "bg-pink-300", text: "text-slate-900", border: "border-pink-400" },
  
  // Các hệ đặc biệt trong dữ liệu của bạn
  stellar: { bg: "bg-gradient-to-r from-teal-400 via-pink-400 to-yellow-400", text: "text-slate-900", border: "border-purple-400" },
  unknown: { bg: "bg-neutral-500", text: "text-white", border: "border-neutral-600" },
  shadow: { bg: "bg-slate-900", text: "text-purple-400", border: "border-purple-900" },
};
export default function PokemonTypeBadge({ typeName }: { typeName: string }) {
  // Lấy bảng màu tương ứng, nếu không tìm thấy thì dùng màu xám mặc định
  const color = TYPE_COLORS[typeName] || {
    bg: "bg-gray-400",
    text: "text-white",
    border: "border-gray-500"
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border shadow-sm ${color.bg} ${color.text} ${color.border}`}
    >
      {typeName}
    </span>
  );
}