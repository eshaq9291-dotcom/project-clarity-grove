import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from "react";

function JoodSecretAdmin() {
  const [isLogged, setIsLogged] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [activeTab, setActiveTab] = useState("sliders");
  const [sliders, setSliders] = useState<any[]>(() => {
    const s = localStorage.getItem("jood_sliders");
    return s ? JSON.parse(s) : [{ id: 1, title: "مجموعة جود الحصرية", image: "https://via.placeholder.com/400x200?text=JOOD", active: true }];
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (localStorage.getItem("jood_admin_logged") === "true") setIsLogged(true);
  }, []);

  const handleLogin = () => {
    const savedUser = localStorage.getItem("jood_admin_user") || "jood-4sh__o";
    const savedPass = localStorage.getItem("jood_admin_pass");
    if (!savedPass) {
      if (username === "jood-4sh__o" && password.length >= 4) {
        localStorage.setItem("jood_admin_user", "jood-4sh__o");
        localStorage.setItem("jood_admin_pass", password);
        localStorage.setItem("jood_admin_logged", "true");
        setIsLogged(true);
        alert("تم حفظ كلمة السر! أنت المدير الكامل jood-4sh__o");
      } else alert("اسم المستخدم jood-4sh__o وكلمة السر 4 أحرف على الأقل");
      return;
    }
    if (username === savedUser && password === savedPass) {
      localStorage.setItem("jood_admin_logged", "true");
      setIsLogged(true);
    } else alert("خطأ! أنت المدير jood-4sh__o فقط");
  };

  const handleChangePassword = () => {
    if (newPassword.length < 4) return alert("قصيرة");
    localStorage.setItem("jood_admin_pass", newPassword);
    alert("تم تغيير كلمة السر يا مدير jood-4sh__o");
    setNewPassword("");
  };

  const addSlider = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const title = prompt("عنوان:") || "عرض جديد";
      const updated = [...sliders, { id: Date.now(), title, image: dataUrl, active: true }];
      setSliders(updated);
      localStorage.setItem("jood_sliders", JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-yellow-600/30 p-8 rounded-2xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-yellow-500 text-center mb-2">JOOD | جود</h1>
          <p className="text-zinc-400 text-center mb-6 text-sm">المدير الكامل: jood-4sh__o</p>
          {!localStorage.getItem("jood_admin_pass") && <p className="text-green-400 text-xs text-center mb-4">أول مرة؟ أدخل jood-4sh__o واختر كلمة سرك</p>}
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="jood-4sh__o" className="w-full p-3 mb-3 bg-black border border-zinc-700 rounded text-white" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="كلمة السر" className="w-full p-3 mb-4 bg-black border border-zinc-700 rounded text-white" />
          <button onClick={handleLogin} className="w-full bg-yellow-500 text-black font-bold p-3 rounded">دخول الإدارة</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-yellow-600/20 p-4 flex justify-between bg-zinc-900">
        <h1 className="text-yellow-500 font-bold">JOOD Admin - jood-4sh__o المدير الكامل</h1>
        <button onClick={()=>{localStorage.removeItem("jood_admin_logged"); setIsLogged(false)}} className="text-sm border px-3 py-1 rounded">خروج</button>
      </header>
      <div className="flex">
        <aside className="w-64 bg-zinc-900 min-h-screen p-4">
          {["sliders","ledger","settings"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} className={`w-full text-right p-3 mb-2 rounded ${activeTab===tab ? "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30" : "text-zinc-400"}`}>
              {tab==="sliders"?"🎞️ الشريط المتحرك - تغير الصور":tab==="ledger"?"📒 دفتر الأستاذ العام":"⚙️ تغيير كلمة السر"}
            </button>
          ))}
        </aside>
        <main className="flex-1 p-6">
          {activeTab==="sliders" && (
            <div>
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-yellow-500">إدارة الشريط المتحرك - تقدر تغير صوره</h2>
                <button onClick={addSlider} className="bg-yellow-600 text-black px-4 py-2 rounded font-bold">+ إضافة صورة</button>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="grid grid-cols-2 gap-4">
                {sliders.map((s:any)=>(
                  <div key={s.id} className="border border-zinc-800 rounded overflow-hidden">
                    <img src={s.image} className="h-32 w-full object-cover" />
                    <div className="p-3 flex justify-between"><p className="text-sm">{s.title}</p><button onClick={()=>{const u=sliders.filter((x:any)=>x.id!==s.id); setSliders(u); localStorage.setItem("jood_sliders",JSON.stringify(u))}} className="text-red-400 text-xs">حذف</button></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab==="ledger" && (
            <div>
              <h2 className="text-xl font-bold text-yellow-500 mb-4">دفتر الأستاذ العام JOOD</h2>
              <table className="w-full border border-zinc-800 text-sm">
                <thead className="bg-zinc-900"><tr><th className="p-2 border">التاريخ</th><th className="p-2 border">الحساب</th><th className="p-2 border">مدين</th><th className="p-2 border">دائن</th><th className="p-2 border">الوصف</th></tr></thead>
                <tbody>
                  <tr><td className="p-2 border">2026/01/15</td><td className="p-2 border">4000 المبيعات</td><td className="p-2 border"></td><td className="p-2 border">5000</td><td className="p-2 border">بيع شيلان</td></tr>
                  <tr><td className="p-2 border">2026/01/15</td><td className="p-2 border">1001 الصندوق</td><td className="p-2 border">5000</td><td className="p-2 border"></td><td className="p-2 border">استلام نقدية</td></tr>
                </tbody>
              </table>
              <div className="mt-4 p-4 bg-zinc-900 rounded text-xs">
                <p>حسابات JOOD: 1001 الصندوق، 1002 البنك، 1100 المخزون (شيلان/كعب/حقائب)، 4000 المبيعات، 5000 المشتريات، 5100 شحن، 5200 تسويق</p>
                <p className="mt-2 text-yellow-500">ميزان المراجعة: مجموع المدين = مجموع الدائن</p>
              </div>
            </div>
          )}
          {activeTab==="settings" && (
            <div className="max-w-md">
              <h2 className="text-xl font-bold text-yellow-500 mb-4">الإعدادات - jood-4sh__o</h2>
              <p className="text-sm text-zinc-400 mb-2">المدير الحالي: jood-4sh__o - تقدر تغير كلمة السر</p>
              <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="كلمة سر جديدة" className="w-full p-3 mb-3 bg-zinc-900 border border-zinc-700 rounded" />
              <button onClick={handleChangePassword} className="bg-yellow-600 text-black px-4 py-2 rounded font-bold w-full">تغيير كلمة السر</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/jood-secret-2024-admin')({
  component: JoodSecretAdmin,
})
