const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://web-trivia.web.app'
const SITE_NAME = 'Web Trivia'

interface Props {
  title: string
  description: string
  path?: string
}

export function PageMeta({ title, description, path = '' }: Props) {
  const fullTitle = `${title} | ${SITE_NAME}`
  const url = `${SITE_URL}${path}`

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <link rel="canonical" href={url} />
    </>
  )
}
