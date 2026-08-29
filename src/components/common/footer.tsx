import Link from "next/link";

const LOGO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg";

const features = [
  {
    icon: "⌕",
    title: "Tìm chỗ ở",
    description:
      "Tìm kiếm phòng theo địa điểm, ngày và số lượng khách.",
  },
  {
    icon: "✓",
    title: "Đặt phòng trực tuyến",
    description:
      "Kiểm tra lịch trống và đặt phòng nhanh chóng.",
  },
  {
    icon: "⌂",
    title: "Quản lý chuyến đi",
    description:
      "Xem, cập nhật hoặc hủy booking trong hồ sơ.",
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-[#f7f7f7]">
      <div className="container-airbnb py-10 sm:py-12">
        {/* Các chức năng nổi bật */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xl font-bold text-brand">
                  {feature.icon}
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">
                    {feature.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-secondary">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nội dung footer */}
        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              aria-label="Về trang chủ Airbnb"
              className="inline-flex"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_URL}
                alt="Airbnb"
                width={120}
                height={38}
                className="h-9 w-auto"
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-secondary">
              Khám phá chỗ ở phù hợp, đặt phòng trực tuyến
              và quản lý toàn bộ chuyến đi của bạn.
            </p>
          </div>

          <FooterColumn
            title="Khám phá"
            links={[
              {
                label: "Trang chủ",
                href: "/",
              },
              {
                label: "Tất cả phòng",
                href: "/rooms?page=1",
              },
              {
                label: "Tất cả địa điểm",
                href: "/locations",
              },
            ]}
          />

          <FooterColumn
            title="Chuyến đi"
            links={[
              {
                label: "Tìm kiếm chỗ ở",
                href: "/#home-search",
              },
              {
                label: "Booking của tôi",
                href: "/profile",
              },
              {
                label: "Quản lý chuyến đi",
                href: "/profile",
              },
            ]}
          />

          <FooterColumn
            title="Tài khoản"
            links={[
              {
                label: "Hồ sơ cá nhân",
                href: "/profile",
              },
              {
                label: "Cập nhật hồ sơ",
                href: "/profile",
              },
              {
                label: "Đổi ảnh đại diện",
                href: "/profile",
              },
            ]}
          />
        </div>

        {/* Thanh dưới cùng */}
        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-sm text-secondary sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 Airbnb Clone. Tìm kiếm và đặt chỗ ở
            trực tuyến.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="font-medium text-foreground">
              ◉ Tiếng Việt (VN)
            </span>

            <span className="font-medium text-foreground">
              $ USD
            </span>

            <Link
              href="/profile"
              className="font-medium text-foreground transition hover:text-brand"
            >
              Chuyến đi của bạn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

function FooterColumn({
  title,
  links,
}: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">
        {title}
      </h3>

      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <Link
              href={link.href}
              className="text-sm text-secondary transition hover:text-brand hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}