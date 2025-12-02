interface ParagraphProps {
  text: string
  className?: string
}

export function Paragraph({ text, className = '' }: ParagraphProps) {
  return <p className={className}>{text}</p>
}
