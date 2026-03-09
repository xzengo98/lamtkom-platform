type AdminEmptyStateProps = {
  title: string;
  description: string;
  buttonText?: string;
};

export default function AdminEmptyState({
  title,
  description,
  buttonText,
}: AdminEmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-10 text-center">
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-slate-300">{description}</p>

      {buttonText ? (
        <button className="mt-6 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
          {buttonText}
        </button>
      ) : null}
    </div>
  );
}