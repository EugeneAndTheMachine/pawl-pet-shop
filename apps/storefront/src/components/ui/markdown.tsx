import ReactMarkdown, { type Components } from 'react-markdown'
import { Link } from 'react-router'
import remarkGfm from 'remark-gfm'

// Only for the team's own static Markdown. react-markdown builds React elements and never injects raw HTML.
const components: Components = {
  h1: ({ children }) => <h1 className="font-display text-3xl text-brand sm:text-4xl">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-8 text-xl font-bold">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-6 text-lg font-semibold">{children}</h3>,
  p: ({ children }) => <p className="mt-3 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mt-3 list-disc space-y-1.5 pl-6 leading-relaxed marker:text-brand">{children}</ul>,
  ol: ({ children }) => <ol className="mt-3 list-decimal space-y-1.5 pl-6 leading-relaxed marker:font-semibold marker:text-accent">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-ink-soft">{children}</em>,
  code: ({ children }) => <code className="rounded bg-cream px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>,
  a: ({ href = '', children }) =>
    href.startsWith('/') ? (
      <Link to={href} className="font-medium text-brand-strong underline underline-offset-2 hover:text-brand-deep">
        {children}
      </Link>
    ) : (
      <a href={href} target="_blank" rel="noreferrer" className="font-medium text-brand-strong underline underline-offset-2 hover:text-brand-deep">
        {children}
      </a>
    ),
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[32rem] text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-cream">{children}</thead>,
  th: ({ children }) => <th className="px-4 py-2.5 font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-t border-line px-4 py-2.5 align-top">{children}</td>,
}

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  )
}
