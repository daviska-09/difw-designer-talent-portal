export function Linkify({ text, className }: { text: string; className?: string }) {
  const urlRegex = /https?:\/\/[^\s]+/g
  const parts: { text: string; isUrl: boolean }[] = []
  let lastIndex = 0
  let match
  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ text: text.slice(lastIndex, match.index), isUrl: false })
    parts.push({ text: match[0], isUrl: true })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), isUrl: false })

  if (parts.length === 0) {
    const href = /^https?:\/\//i.test(text) ? text : `https://${text}`
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{text}</a>
  }

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.isUrl
          ? <a key={i} href={part.text} target="_blank" rel="noopener noreferrer" className="underline">{part.text}</a>
          : <span key={i}>{part.text}</span>
      )}
    </span>
  )
}
