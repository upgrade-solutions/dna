import styles from './Paragraph.module.css'

interface ParagraphProps {
  text: string
  className?: string
}

export function Paragraph({ text, className = '' }: ParagraphProps) {
  return <p className={`${styles.paragraph} ${className}`}>{text}</p>
}
