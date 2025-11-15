import { Link } from "react-router-dom";
import { Facebook, Twitter, Youtube, Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import bopedLogo from "@/assets/bopedfctactics-logo.png";
import bopedDevLogo from "@/assets/boped-developer-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={bopedLogo} alt="Boped FC Tactics" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h3 className="font-bold text-foreground">Boped FC Tactics</h3>
                <p className="text-xs text-muted-foreground">Đồng hành cùng FC Mobile</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nền tảng hàng đầu về cơ sở dữ liệu cầu thủ, công cụ xây dựng đội hình và tin tức FC Mobile. 
              Giúp game thủ tối ưu đội hình và nâng cao trải nghiệm chơi game.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">Liên Kết Nhanh</h3>
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
                <Link to="/news" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Bảng tin
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Trang cá nhân
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">Thông Tin Liên Hệ</h3>
            <ul className="space-y-3">
              <li>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Hà Nội, Việt Nam</span>
                </div>
              </li>
              <li>
                <div className="text-sm">
                  <span className="text-muted-foreground">Hotline:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href="tel:+84942225766" className="text-foreground hover:text-primary transition-colors">
                      0942225766
                    </a>
                  </div>
                </div>
              </li>
              <li>
                <div className="text-sm">
                  <span className="text-muted-foreground">Email liên hệ:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href="mailto:contact@boped.com" className="text-foreground hover:text-primary transition-colors">
                      contact@boped.com
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Connect */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">Kết Nối Với Chúng Tôi</h3>
            <div className="space-y-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center flex-shrink-0">
                  <Facebook className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-foreground">Facebook</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center flex-shrink-0">
                  <Twitter className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-foreground">Twitter</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center flex-shrink-0">
                  <Youtube className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-foreground">Youtube</span>
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              Theo dõi chúng tôi để cập nhật thông tin mới nhất về FC Mobile và các chương trình ưu đãi.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border/40">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <img src={bopedDevLogo} alt="Boped" className="h-10 w-10 rounded-full object-cover" />
              <span className="text-sm text-muted-foreground">
                Website được phát triển bởi <span className="text-primary font-semibold">Boped</span>
              </span>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            © 2025 Boped FC Tactics. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
