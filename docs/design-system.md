# Design System — Airbnb User

## Màu sắc

| Token | Giá trị | Dùng cho |
|---|---|---|
| Brand | `#FF385C` | Logo, nút chính, links, hover |
| Brand dark | `#d90b3e` | Hover nút chính |
| Foreground | `#222222` | Chữ chính, tiêu đề |
| Secondary | `#717171` | Chữ phụ, mô tả, metadata |
| Border | `#DDDDDD` | Viền phân chia |
| Background | `#ffffff` | Nền chính |
| Surface | `#F7F7F7` | Nền section, footer |
| Skeleton | `#e0e0e0` | Loading skeleton |

## Typography

- Font chính: Geist Sans hoặc system font.
- Headings: fontWeight 600–700.
- Body: fontSize 14–16px, lineHeight 1.5.

## Spacing & Layout

- Container maxWidth: 1280px.
- Padding trang: `px-4 sm:px-6 lg:px-10`.
- Gap nhất quán: `gap-4` hoặc `gap-6`.

## Border & Shadow

- Border radius: 12px cho card, 8px cho input, 24px cho nút pills.
- Shadow: `shadow-sm` hoặc `shadow-[0_2px_8px_rgba(0,0,0,0.08)]`.

## Animation

- Duration: 150–250ms.
- Easing: ease-in-out.
- Chỉ dùng cho hover, focus, transition cơ bản.

## Component Patterns

- Card: ảnh trên, nội dung dưới, không có viền, bo góc 12px.
- Button chính: bg brand, text white, borderRadius-full.
- Input: border-gray-300, borderRadius-lg, focus ring brand.

## Responsive Breakpoints

- Mobile: < 640px — 2 cột grid.
- Tablet: 640–1024px — 3–4 cột.
- Desktop: > 1024px — 4–6 cột.
