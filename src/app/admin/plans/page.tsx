const plans = [
  { name: "تجريبية", credits: 3, price: "0" },
  { name: "بريميوم", credits: 20, price: "9.9" },
  { name: "شركات", credits: 100, price: "مخصص" },
];

export default function AdminPlansPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black">إدارة الباقات</h2>
          <p className="mt-2 text-slate-300">
            من هنا ستدير الباقات وعدد الألعاب والأسعار.
          </p>
        </div>

        <button className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
          إضافة باقة
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
          >
            <h3 className="text-2xl font-black">{plan.name}</h3>
            <div className="mt-4 space-y-2 text-slate-300">
              <p>عدد الألعاب: {plan.credits}</p>
              <p>السعر: {plan.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}