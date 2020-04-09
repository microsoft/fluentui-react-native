import unified from 'unified'
import parse from 'remark-parse'
import remark2react from 'remark-react'

export default function(md: string) {
  return unified()
    .use(parse as any)
    .use(remark2react)
    .processSync(md).contents
}
