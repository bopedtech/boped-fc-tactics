import { Link } from "react-router-dom";
import { Facebook, Twitter, Youtube, Mail, MapPin, Phone } from "lucide-react";
import bopedLogo from "@/assets/logo-boped.png";
const Footer = () => {
  return <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img src={bopedLogo} alt="Boped" className="h-12 w-12 rounded-full object-cover" />
            <p className="text-sm text-muted-foreground">
              © 2025 Boped. All rights reserved. Powered by BopedFCTactics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">Liên kết</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/database" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cơ sở dữ liệu cầu thủ
                </Link>
              </li>
              <li>
                <Link to="/builder" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Squad Builder
                </Link>
              </li>
              <li>
                <Link to="/my-squads" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Đội hình của tôi
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Trang cá nhân
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@boped.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">Theo dõi chúng tôi</h3>
            <div className="flex gap-3">
              <a href="#" className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Facebook className="h-5 w-5 text-primary" />
              </a>
              <a href="#" className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Twitter className="h-5 w-5 text-primary" />
              </a>
              <a href="#" className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Youtube className="h-5 w-5 text-primary" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Boped. All rights reserved. Powered by BopedFCTactics.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;