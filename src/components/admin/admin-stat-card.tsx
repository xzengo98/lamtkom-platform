type AdminStatCardProps = {
  label: string;
  value: string;
};

export default function AdminStatCard({
  label,
  value,
}: AdminStatCardProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-4 text-4xl font-black text-cyan-400">{value}</div>
    </div>
  );
}