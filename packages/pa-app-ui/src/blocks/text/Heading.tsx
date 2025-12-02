interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  text: string
  className?: string
}

export function Heading({ level = 2, text, className = '' }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  return <Tag className={className}>{text}</Tag>
}
