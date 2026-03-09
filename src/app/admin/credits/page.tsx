const transactions = [
  { user: "Ahmed Ali", type: "إضافة", amount: 10 },
  { user: "Sara Noor", type: "خصم", amount: 1 },
  { user: "Omar Khaled", type: "إضافة", amount: 5 },
];

export default function AdminCreditsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black">إدارة الأرصدة</h2>
        <p className="mt-2 text-slate-300">
          هذه الصفحة ستخصص لإضافة وخصم الألعاب أو النقاط من المستخدمين.
        </p>
      </div>

      <div className="grid gap-4">
        {transactions.map((item, index) => (
          <div
            key={index}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-lg font-black">{item.user}</div>
              <div className="text-cyan-300">
                {item.type} - {item.amount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}