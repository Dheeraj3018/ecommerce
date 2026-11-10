import Link from "next/link";
import { StoreHeader, StoreFooter, LinkArrow } from "@/components/store-shell";

const collections = [
  { number: "01", title: "Appalam & Vadagam", descriptor: "The familiar, reimagined.", tone: "rice", href: "/products", symbol: "grain" },
  { number: "02", title: "Masalas & Spice Mixes", descriptor: "A little more flavour.", tone: "spice", href: "/products", symbol: "spice" },
  { number: "03", title: "Thokku & Organic Foods", descriptor: "Slow-made goodness.", tone: "thokku", href: "/products", symbol: "leaf" },
  { number: "04", title: "Home & Everyday", descriptor: "Essentials worth choosing.", tone: "home", href: "/products", symbol: "sun" },
] as const;

function ProductSculpture({ kind }: { kind: "grain" | "spice" | "leaf" | "sun" }) {
  if (kind === "grain") return <svg className="collection-illustration" viewBox="0 0 280 280" fill="none" aria-hidden="true"><circle cx="140" cy="145" r="92" fill="#E4CFA7"/><circle cx="140" cy="145" r="72" fill="#F7F0D9" stroke="#CFB98D" strokeWidth="2"/>{Array.from({length:12},(_,i)=><g key={i} transform={`rotate(${i*30} 140 145)`}><ellipse cx="140" cy="92" rx="10" ry="25" fill="#E6CE9D" stroke="#BC9F70"/><path d="M140 81v25" stroke="#B39B70"/></g>)}<circle cx="140" cy="145" r="27" fill="#E9D7B4"/><circle cx="140" cy="145" r="15" fill="#DCC59F"/></svg>;
  if (kind === "spice") return <svg className="collection-illustration" viewBox="0 0 280 280" fill="none" aria-hidden="true"><ellipse cx="140" cy="215" rx="104" ry="19" fill="#733E2D" opacity=".15"/><path d="M53 136c0-49 39-89 87-89s87 40 87 89v45c0 35-39 65-87 65s-87-30-87-65v-45Z" fill="#C37B51"/><ellipse cx="140" cy="134" rx="87" ry="51" fill="#D89160"/><ellipse cx="140" cy="132" rx="72" ry="39" fill="#AD4A2B"/><path d="M95 120c21-22 70-23 94-4" stroke="#E0A06A" strokeWidth="5" strokeLinecap="round"/><path d="M106 138c25-9 45-8 68 4" stroke="#87391D" strokeWidth="6" strokeLinecap="round"/><path d="M148 69c12-19 28-22 40-17" stroke="#6A7B42" strokeWidth="5" strokeLinecap="round"/></svg>;
  if (kind === "leaf") return <svg className="collection-illustration" viewBox="0 0 280 280" fill="none" aria-hidden="true"><ellipse cx="140" cy="234" rx="100" ry="17" fill="#223E25" opacity=".12"/><path d="M80 92h120l-12 126c-1 17-95 17-96 0L80 92Z" fill="#9E4B2E"/><ellipse cx="140" cy="93" rx="63" ry="20" fill="#BF7954"/><ellipse cx="140" cy="94" rx="50" ry="14" fill="#7D3325"/><path d="M141 92C107 52 97 25 116 22c24-3 37 45 25 70Z" fill="#628753"/><path d="M145 94c3-51 25-77 45-67 12 28-21 62-45 67Z" fill="#97AD6C"/><path d="M141 92c-3-21-11-37-22-50m26 52 30-48" stroke="#D0DC9D" strokeWidth="3"/><path d="M88 129h104" stroke="#D69E7E" opacity=".55"/></svg>;
  return <svg className="collection-illustration" viewBox="0 0 280 280" fill="none" aria-hidden="true"><circle cx="140" cy="140" r="93" fill="#D5E8E0"/><path d="M140 56v21M140 203v21M56 140h21M203 140h21M82 82l15 15m86 86 15 15m0-116-15 15m-86 86-15 15" stroke="#B68C55" strokeWidth="6" strokeLinecap="round"/><circle cx="140" cy="140" r="48" fill="#F0CA8D"/><path d="M112 141c0-14 12-25 26-25" stroke="#FFF0CA" strokeWidth="9" strokeLinecap="round"/></svg>;
}

export default function Home() {
  return <div className="store-site">
    <div className="store-announcement"><span className="announcement-dot"/> A new way to shop the everyday <span className="announcement-divider"/> Thoughtfully selected, all in one place</div>
    <StoreHeader/>
    <main>
      <section className="store-hero" aria-labelledby="hero-title">
        <div className="store-hero-copy">
          <div className="store-eyebrow hero-enter hero-enter-1"><span className="eyebrow-line"/> MADE FOR REAL LIFE <span className="eyebrow-index">01 / A MORE THOUGHTFUL STORE</span></div>
          <h1 id="hero-title" className="store-hero-title hero-enter hero-enter-2">A little more<br/><em>good</em> in every day<span className="store-title-dot">.</span></h1>
          <p className="store-hero-desc hero-enter hero-enter-3">From everyday rituals to the things that make a house feel like home. Discover a considered collection of food, home and lifestyle essentials.</p>
          <div className="store-hero-actions hero-enter hero-enter-4"><Link href="/products" className="store-cta-primary">Explore the collection <LinkArrow diagonal/></Link><Link href="/wholesale" className="store-cta-text">Shopping for business? <span aria-hidden="true">↗</span></Link></div>
          <div className="store-hero-bottom hero-enter hero-enter-5"><span><b>01 — 04</b> / CURATED CATEGORIES</span><span className="hero-scroll">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span></div>
        </div>
        <div className="store-hero-art" aria-label="Abstract sculptural still life of everyday essentials" role="img">
          <div className="art-sun"/>
          <div className="art-arch"/>
          <div className="art-shadow"/>
          <div className="art-bottle"><div className="art-bottle-neck"/><div className="art-bottle-cap"/><div className="art-bottle-label"><span>THE<br/>EVERYDAY<br/>EDIT</span><small>GOOD THINGS INSIDE</small></div></div>
          <div className="art-box"><div className="art-box-top"/><div className="art-box-front"><span>GOOD<br/>THINGS.</span><small>SELECTED FOR YOU</small></div></div>
          <div className="art-orbit"/>
          <span className="art-side-label">BETTER CHOICES / BRIGHTER DAYS</span>
          <span className="art-corner-number">01 / 04</span>
        </div>
      </section>
      <section className="store-trust-strip" aria-label="Our approach"><div className="store-trust-inner"><span>EVERYDAY ESSENTIALS, EXTRAORDINARY CARE</span><span className="strip-star" aria-hidden="true">✳</span><span>RETAIL & WHOLESALE</span><span className="strip-star" aria-hidden="true">✳</span><span>MADE TO FIT YOUR LIFE</span><span className="strip-star" aria-hidden="true">✳</span><span>SHOP ACROSS INDIA</span></div></section>
      <section className="store-collections-section" id="collections" aria-labelledby="collection-heading">
        <div className="store-section-heading"><div><p className="store-section-kicker"><span>01</span> / DISCOVER</p><h2 id="collection-heading">Something for<br/><em>every day.</em></h2></div><p>Big or small, it&apos;s the little things that make life better. Browse a collection made for the moments between.</p></div>
        <div className="store-collection-grid">{collections.map(item=><Link href={item.href} key={item.number} className={`store-collection-card tone-${item.tone}`}><div className="collection-top"><span>COLLECTION / {item.number}</span><span className="collection-arrow"><LinkArrow diagonal/></span></div><div className="collection-art"><ProductSculpture kind={item.symbol}/></div><div className="collection-bottom"><h3>{item.title}</h3><p>{item.descriptor}</p></div></Link>)}</div>
        <div className="collections-footer"><span>THOUGHTFULLY GATHERED. MADE FOR THE WAY YOU LIVE.</span><Link href="/products">View all products <span aria-hidden="true">↗</span></Link></div>
      </section>
      <section className="store-story" aria-labelledby="story-heading"><div className="story-decoration" aria-hidden="true"><span className="story-circle"/><span className="story-ribbon"/></div><div className="store-story-content"><p className="store-section-kicker"><span>02</span> / OUR PHILOSOPHY</p><h2 id="story-heading">The everyday<br/>deserves <em>better.</em></h2><p>Good shopping should feel simple. We bring together useful, familiar products and make room for new discoveries — all with clarity, care and convenience.</p><Link href="/products" className="store-cta-primary store-cta-dark">Find your favourites <LinkArrow diagonal/></Link></div><span className="story-marginalia">THE GOOD LIFE IS MADE OF LITTLE THINGS / EST. 2026</span></section>
      <section className="store-business" aria-labelledby="business-heading"><div className="business-number">03 / PARTNER WITH US</div><div className="business-content"><div><h2 id="business-heading">Good for your<br/><em>business, too.</em></h2></div><div><p>Buying for your shop or business? Apply for wholesale access to see eligible business pricing and minimum order quantities.</p><Link href="/wholesale" className="store-business-link">Explore wholesale <LinkArrow diagonal/></Link></div></div></section>
      <section className="store-last-cta"><p>THE RIGHT THINGS, RIGHT HERE</p><h2>Find what feels <em>right.</em></h2><Link href="/products" className="store-cta-primary">Start exploring <LinkArrow diagonal/></Link></section>
    </main>
    <StoreFooter/>
  </div>;
}
