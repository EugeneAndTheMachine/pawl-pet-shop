import ReactMarkdown, { type Components } from 'react-markdown'
import { Link } from 'react-router'

// Answers come from an AI model, so they are treated as untrusted: react-markdown never renders raw HTML,
// images are dropped, and only links inside Pawl ("/...") are clickable. Any other link is shown as plain text.
function isInternal(href: string) {
  return href.startsWith('/') && !href.startsWith('//')
}

function components(onNavigate: () => void): Components {
  return {
    p: ({ children }) => <p className="leading-relaxed [&+*]:mt-2">{children}</p>,
    ul: ({ children }) => <ul className="mt-1.5 list-disc space-y-1 pl-5 marker:text-brand [&+*]:mt-2">{children}</ul>,
    ol: ({ children }) => <ol className="mt-1.5 list-decimal space-y-1 pl-5 marker:font-semibold [&+*]:mt-2">{children}</ol>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    h1: ({ children }) => <p className="font-semibold">{children}</p>,
    h2: ({ children }) => <p className="font-semibold">{children}</p>,
    h3: ({ children }) => <p className="font-semibold">{children}</p>,
    code: ({ children }) => <code className="rounded bg-cream px-1 font-mono text-[0.9em]">{children}</code>,
    img: () => null,
    a: ({ href = '', children }) =>
      isInternal(href) ? (
        <Link to={href} onClick={onNavigate} className="font-medium text-brand-strong underline underline-offset-2 hover:text-brand-deep">
          {children}
        </Link>
      ) : (
        <span>{children}</span>
      ),
  }
}

export function ChatMarkdown({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  return (
    <ReactMarkdown components={components(onNavigate)} skipHtml>
      {text}
    </ReactMarkdown>
  )
}
