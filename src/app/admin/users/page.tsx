const users = [
  { name: "Ahmed Ali", email: "ahmed@test.com", credits: 12 },
  { name: "Sara Noor", email: "sara@test.com", credits: 7 },
  { name: "Omar Khaled", email: "omar@test.com", credits: 20 },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black">إدارة المستخدمين</h2>
        <p className="mt-2 text-slate-300">
          من هنا ستدير الحسابات، الحالة، وعدد الألعاب المتبقية.
        </p>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
        <div className="grid grid-cols-3 border-b border-white/10 bg-slate-900/60 px-6 py-4 font-bold text-slate-200">
          <div>الاسم</div>
          <div>البريد</div>
          <div>الرصيد</div>
        </div>

        {users.map((user) => (
          <div
            key={user.email}
            className="grid grid-cols-3 border-b border-white/10 px-6 py-4 text-slate-300 last:border-b-0"
          >
            <div>{user.name}</div>
            <div>{user.email}</div>
            <div>{user.credits}</div>
          </div>
        ))}
      </div>
    </div>
  );
}