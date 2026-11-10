import Link from "next/link";

const collections = [
  { title: "Masalas & Spice Mixes", icon: "🌶️", summary: "Everyday essentials for flavourful cooking." },
  { title: "Appalam & Vadagam", icon: "🍚", summary: "Traditional favourites for your family meals." },
  { title: "Thokku & Organic Foods", icon: "🥬", summary: "Pantry staples for daily enjoyment." },
  { title: "Home Cleaning", icon: "🫧", summary: "Practical essentials for a fresh home." },
  { title: "Cattle Feed & Oils", icon: "🌾", summary: "Products for farms and households." },
  { title: "Mobiles", icon: "📱", summary: "Explore the latest product listings." },
];

export default function Home() {
  return <div className="min-h-screen bg-[#fafaf5] text-slate-900">
    <header className="border-b border-emerald-900/10 bg-white/90">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-emerald-900">Your Store<span className="text-orange-500">.</span></Link>
        <nav className="flex flex-wrap items-center gap-5 text-sm font-medium">
          <Link href="/products" className="hover:text-emerald-700">Shop all</Link>
          <Link href="/login" className="hover:text-emerald-700">Sign in</Link>
          <Link href="/account" className="hover:text-emerald-700">Account</Link>
          <Link href="/cart" className="hover:text-emerald-700">Cart</Link>
          <Link href="/wholesale" className="hover:text-emerald-700">Wholesale</Link>
          <Link href="/admin" className="hover:text-emerald-700">Admin</Link>
        </nav>
      </div>
    </header>
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 text-white">
        <div className="pointer-events-none absolute -right-32 -top-48 size-[34rem] rounded-full border-[80px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-56 right-8 size-[32rem] rounded-full border-[64px] border-yellow-300/10" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-widest uppercase">Retail & wholesale · Across India</span>
            <h1 className="mt-7 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">Everyday essentials.<br/><span className="text-amber-300">One smart store.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-emerald-50/85">Discover food, home, and lifestyle products in one convenient place. Browse our growing collection and explore retail or wholesale opportunities.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/products" className="rounded-xl bg-amber-400 px-7 py-4 font-bold text-emerald-950 transition hover:bg-amber-300">Explore products</Link>
              <Link href="/register" className="rounded-xl border border-white/40 px-7 py-4 font-semibold transition hover:bg-white/10">Create an account</Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl shadow-emerald-950/30 backdrop-blur-sm">
            <div className="rounded-[1.5rem] bg-white/95 p-7 text-slate-900">
              <div className="flex items-center justify-between"><span className="text-sm font-bold uppercase tracking-wider text-emerald-800">Shop by category</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">New collection</span></div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {collections.slice(0,4).map(c=><div key={c.title} className="rounded-2xl bg-emerald-50 p-5">
                  <div className="text-4xl" aria-hidden="true">{c.icon}</div><div className="mt-4 text-sm font-bold">{c.title}</div>
                </div>)}
              </div>
              <p className="mt-5 text-xs text-slate-500">Products and prices appear as inventory is added by the store administrator.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-semibold uppercase tracking-widest text-orange-700 text-xs">Explore the range</p><h2 className="mt-2 text-3xl font-bold">Browse categories</h2></div><Link href="/products" className="font-semibold text-emerald-800 hover:underline">View all products →</Link></div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map(c=><Link key={c.title} href="/products" className="group rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="text-4xl" aria-hidden="true">{c.icon}</div><h3 className="mt-5 text-lg font-bold group-hover:text-emerald-800">{c.title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{c.summary}</p>
            <span className="mt-5 inline-block text-sm font-semibold text-emerald-800">Explore →</span>
          </Link>)}
        </div>
      </section>
      <section className="border-y border-emerald-900/10 bg-white"><div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3">
        {[["🚚","Pan-India delivery","Shipping options are being configured."],["🏬","Retail & wholesale","Wholesale access is reviewed and approved."],["🔐","Secure accounts","Sign in to manage your account and future orders."]].map(([icon,title,desc])=><div key={title}><div className="text-2xl" aria-hidden="true">{icon}</div><h3 className="mt-3 font-bold">{title}</h3><p className="mt-2 text-sm text-slate-600">{desc}</p></div>)}
      </div></section>
    </main>
    <footer className="bg-emerald-950 px-6 py-10 text-sm text-emerald-100/80"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><span>© {new Date().getFullYear()} Your Store · Store name coming soon</span><span>Preview storefront · Checkout is not yet enabled</span></div></footer>
  </div>;
}
