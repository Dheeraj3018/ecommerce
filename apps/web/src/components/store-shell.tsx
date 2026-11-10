import Link from "next/link";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}

export function StoreHeader({ dark = false }: { dark?: boolean }) {
  return <header className={dark ? "store-header store-header-dark" : "store-header"}>
    <div className="store-header-inner">
      <Link href="/" className="store-wordmark" aria-label="Your Store home">
        <span className="store-wordmark-icon" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="none"><path d="M20 3 37 20 20 37 3 20 20 3Z" stroke="currentColor" strokeWidth="1.5"/><path d="M12 20h16M20 12v16" stroke="currentColor" strokeWidth="1.5"/><circle cx="20" cy="20" r="3" fill="currentColor"/></svg>
        </span>
        <span>yourstore<span className="store-wordmark-period">.</span></span>
      </Link>
      <nav className="store-nav" aria-label="Main navigation">
        <Link href="/products">The collection</Link>
        <Link href="/wholesale">For businesses</Link>
        <Link href="/account">My account</Link>
      </nav>
      <div className="store-header-actions">
        <Link href="/cart" className="store-cart-link" aria-label="View shopping cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6H19a2 2 0 0 0 2-1.6L22 8H6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="21" r="1"/><circle cx="19" cy="21" r="1"/></svg>
          <span>Cart</span>
        </Link>
        <Link href="/products" className="store-header-shop">Shop now <span aria-hidden="true"><Arrow diagonal/></span></Link>
        <details className="store-mobile-menu">
          <summary aria-label="Open menu"><span/><span/><span/></summary>
          <nav aria-label="Mobile navigation">
            <Link href="/products">The collection</Link>
            <Link href="/wholesale">For businesses</Link>
            <Link href="/account">My account</Link>
            <Link href="/cart">Shopping cart</Link>
            <Link href="/login">Sign in</Link>
          </nav>
        </details>
      </div>
    </div>
  </header>;
}

export function StoreFooter() {
  return <footer className="store-footer">
    <div className="store-footer-inner">
      <div className="store-footer-top"><span className="store-footer-brand">Good things, <em>every day.</em></span><Link href="/products" className="store-footer-cta">Explore the collection <Arrow diagonal/></Link></div>
      <div className="store-footer-bottom">
        <p>yourstore<span aria-hidden="true">.</span> <span className="store-footer-divider">/</span> An evolving collection of daily essentials.</p>
        <nav aria-label="Footer navigation"><Link href="/products">Products</Link><Link href="/wholesale">Wholesale</Link><Link href="/account">Account</Link><Link href="/admin">Admin</Link></nav>
        <span>Preview store · Checkout not yet live</span>
      </div>
    </div>
  </footer>;
}

export function LinkArrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span className="link-arrow-icon"><Arrow diagonal={diagonal}/></span>;
}
