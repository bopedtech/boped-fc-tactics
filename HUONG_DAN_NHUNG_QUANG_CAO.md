# Hướng dẫn Nhúng Quảng cáo Google AdSense

## Bước 1: Đăng ký Google AdSense

1. Truy cập [Google AdSense](https://www.google.com/adsense/)
2. Đăng ký tài khoản với website của bạn
3. Chờ Google phê duyệt (thường 1-3 ngày)

## Bước 2: Lấy Mã AdSense và Ad Unit IDs

Sau khi được phê duyệt:

1. Vào **AdSense Dashboard** → **Quảng cáo** → **Theo trang web**
2. Tạo các **Ad Units**:
   - **Native Ad** (cho danh sách cầu thủ)
   - **Display Ad 300x250** (cho trang chi tiết)
   - **Anchor Ad** (quảng cáo neo phía dưới)
   - **Multiplex Ad** (nếu muốn)

3. Sao chép **Ad Unit ID** (dạng `ca-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)

## Bước 3: Thêm Mã AdSense Script vào Website

### 3.1. Thêm Script AdSense vào `index.html`

Mở file `index.html` và thêm script này vào `<head>`:

```html
<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
```

**Thay `ca-pub-XXXXXXXXXXXXXXXX` bằng Publisher ID của bạn.**

## Bước 4: Cập nhật Components với Mã Quảng cáo Thật

### 4.1. Banner Ad (300x250) - File: `src/components/ads/BannerAd.tsx`

Thay thế phần `<Card>` bằng:

```tsx
export const BannerAd = ({ adUnitId = 'YOUR_BANNER_AD_UNIT_ID', size = '300x250', className = '' }: BannerAdProps) => {
  const dimensions = {
    '300x250': { width: 300, height: 250 },
    '728x90': { width: 728, height: 90 },
    '320x50': { width: 320, height: 50 },
  };

  const { width, height } = dimensions[size];

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className={`text-center ${className}`}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'inline-block', width: `${width}px`, height: `${height}px` }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={adUnitId}
      />
    </div>
  );
};
```

### 4.2. Native Ad (Trong danh sách) - File: `src/components/ads/NativeAdCard.tsx`

```tsx
export const NativeAdCard = ({ adUnitId = 'YOUR_NATIVE_AD_UNIT_ID' }: NativeAdCardProps) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="relative">
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="fluid"
        data-ad-layout-key="-6t+ed+2i-1n-4w"
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={adUnitId}
      />
    </div>
  );
};
```

### 4.3. Anchor Ad (Neo phía dưới) - File: `src/components/ads/AnchorAd.tsx`

**Anchor Ad được Google tự động quản lý**. Thêm vào `index.html`:

```html
<script>
  (adsbygoogle = window.adsbygoogle || []).push({
    google_ad_client: "ca-pub-XXXXXXXXXXXXXXXX",
    enable_page_level_ads: true,
    overlays: {bottom: true}
  });
</script>
```

**Hoặc** bật **Auto Ads** trong AdSense Dashboard (khuyến nghị).

## Bước 5: Thử nghiệm

1. Deploy website lên môi trường production
2. Vào AdSense Dashboard → **Trang web** → Kiểm tra trạng thái ads
3. **Lưu ý:** Trong môi trường dev (localhost), ads sẽ không hiển thị

## Bước 6: Tối ưu hóa Doanh thu

### Sử dụng Ad Mediation (Tùy chọn)

1. Vào AdSense → **Tối ưu hóa** → **Ad Mediation**
2. Kết nối các mạng khác (Meta Audience Network, v.v.)
3. Google sẽ tự động chọn mạng trả giá cao nhất

## Vị trí Hiện tại của Ads (Đã tích hợp)

✅ **Trang Database** (`src/pages/Database.tsx`):
- Native Ad mỗi 15 cầu thủ
- Anchor Ad ở dưới (FREE tier)

✅ **Trang Chi tiết Cầu thủ** (`src/components/PlayerDetailDialog.tsx`):
- Banner Ad 300x250 dưới thẻ cầu thủ
- Affiliate Links (nếu có)

✅ **Trang chủ** (`src/pages/Index.tsx`):
- Anchor Ad ở dưới (FREE tier)

## Affiliate Marketing (Doanh thu bổ sung)

Đăng ký các chương trình:
- [Accesstrade](https://www.accesstrade.vn/)
- [Shopee Affiliate](https://affiliate.shopee.vn/)
- [Lazada Affiliate](https://affliate.lazada.vn/)

Thêm sản phẩm vào bảng `player_merchandise` trong Supabase.

## Lưu ý quan trọng

1. **Không click vào ads của chính bạn** - Google sẽ ban tài khoản
2. **Tuân thủ chính sách AdSense** - Không đặt ads quá gần nút/link
3. **Premium users không thấy ads** - Logic đã được tích hợp qua `UserTierContext`
4. **Test trên production** - Localhost không hiển thị ads thật

## Liên hệ hỗ trợ

- [Google AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community](https://support.google.com/adsense/community)
