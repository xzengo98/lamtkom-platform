export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black">لوحة التحكم</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          هذه الصفحة ستكون المدخل الرئيسي لإدارة الفئات، الأسئلة، المستخدمين،
          الرصيد، والباقات.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {[
            "إدارة الفئات",
            "إدارة الأسئلة",
            "إدارة المستخدمين",
            "إدارة الأرصدة",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
            >
              <h2 className="text-xl font-black">{item}</h2>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}