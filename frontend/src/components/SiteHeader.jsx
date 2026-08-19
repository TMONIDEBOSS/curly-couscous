import { Link } from "react-router-dom";
import BrandMark from "./BrandMark";
import "./SiteHeader.css";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link to="/" className="logo">
        <BrandMark size={34} />
        <div className="logo-text">
          <span className="logo-word">KindGuard</span>
          <span className="logo-tag">SME SHIELD PROGRAM</span>
        </div>
      </Link>
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/premium">Premium</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      <Link className="nav-cta" to="/">Scan your site</Link>
    </header>
  );
}
