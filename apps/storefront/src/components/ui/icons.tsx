import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>
)
export const CartIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" /><circle cx="10" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /></Svg>
)
export const UserIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Svg>
)
export const MenuIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Svg>
)
export const CloseIcon = (p: IconProps) => (
  <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>
)
export const ChevronRightIcon = (p: IconProps) => (
  <Svg {...p}><path d="m9 6 6 6-6 6" /></Svg>
)
export const ChevronLeftIcon = (p: IconProps) => (
  <Svg {...p}><path d="m15 6-6 6 6 6" /></Svg>
)
export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>
)
export const PlusIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
)
export const MinusIcon = (p: IconProps) => (
  <Svg {...p}><path d="M5 12h14" /></Svg>
)
export const TrashIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Svg>
)
export const FilterIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 6h16M7 12h10M10 18h4" /></Svg>
)
export const TruckIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></Svg>
)
export const WalletIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M16 15h2" /></Svg>
)
export const RefreshIcon = (p: IconProps) => (
  <Svg {...p}><path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4" /></Svg>
)
export const ShieldIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 3 5 6v6c0 4.4 3 7.8 7 9 4-1.2 7-4.6 7-9V6z" /><path d="m9 12 2 2 4-4" /></Svg>
)
export const CheckIcon = (p: IconProps) => (
  <Svg {...p}><path d="m5 12 5 5L20 7" /></Svg>
)
export const CopyIcon = (p: IconProps) => (
  <Svg {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></Svg>
)
export const ClockIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
)
export const AlertIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.5" /></Svg>
)
export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></Svg>
)
export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></Svg>
)
export const MailIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Svg>
)
export const MapPinIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11" /><circle cx="12" cy="10" r="2.5" /></Svg>
)
export const ChatIcon = (p: IconProps) => (
  <Svg {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12Z" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" strokeWidth={2.6} /></Svg>
)
export const SendIcon = (p: IconProps) => (
  <Svg {...p}><path d="M5 12h13M12 5l7 7-7 7" /></Svg>
)

// Filled shapes
export function PawIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" {...p}>
      <ellipse cx="6" cy="9.5" rx="2.2" ry="2.8" transform="rotate(-20 6 9.5)" />
      <ellipse cx="10" cy="5.5" rx="2.2" ry="3" />
      <ellipse cx="14.8" cy="5.8" rx="2.2" ry="3" transform="rotate(10 14.8 5.8)" />
      <ellipse cx="18.6" cy="10" rx="2" ry="2.6" transform="rotate(25 18.6 10)" />
      <path d="M12.2 11.5c-3.2 0-6.2 3.6-6.2 6.2 0 2 1.6 2.8 3.2 2.5 1.2-.2 2-.8 3-.8s1.8.6 3 .8c1.6.3 3.2-.5 3.2-2.5 0-2.6-3-6.2-6.2-6.2" />
    </svg>
  )
}

export function CatIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 4v6.5A7 7 0 0 0 12 18a7 7 0 0 0 7-7.5V4l-4 3.5a7.5 7.5 0 0 0-6 0z" />
      <path d="M9.5 11.5h.01M14.5 11.5h.01M11 14.5l1 .7 1-.7" />
    </Svg>
  )
}

export function DogIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 5 4.5 6.5 5 12l2.2-1.2M16 5l3.5 1.5L19 12l-2.2-1.2" />
      <path d="M7.2 9.5C7.2 6.9 9.3 5 12 5s4.8 1.9 4.8 4.5V14a4.8 4.8 0 0 1-9.6 0z" />
      <path d="M10 11h.01M14 11h.01M11 15h2l-1 1.2z" />
    </Svg>
  )
}

export function FacebookIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" {...p}>
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21z" />
    </svg>
  )
}

export function InstagramIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.2 6.8h.01" />
    </Svg>
  )
}

export function YoutubeIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" {...p}>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8M10 15V9l5.2 3z" />
    </svg>
  )
}

export function TiktokIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" {...p}>
      <path d="M16.6 3h-3.2v12.2a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V9.3a6 6 0 1 0 5.1 5.9V9a7.4 7.4 0 0 0 4.4 1.4V7.2a4.4 4.4 0 0 1-4.4-4.2" />
    </svg>
  )
}
