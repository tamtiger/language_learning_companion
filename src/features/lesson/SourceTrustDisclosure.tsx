import type { AuthoritativeSource, SourceProvenance } from '../../content/schema'

const SOURCE_ORIGIN_LABELS: Record<SourceProvenance['origin'], string> = {
  original: 'Nội dung nguyên bản',
  adapted: 'Nội dung đã điều chỉnh',
  synthetic: 'Tình huống mô phỏng'
}

const REUSE_MODE_LABELS: Record<AuthoritativeSource['reuseMode'], string> = {
  'reference-only': 'Chỉ dùng làm tài liệu tham khảo',
  quoted: 'Có trích dẫn từ nguồn',
  adapted: 'Có nội dung điều chỉnh từ nguồn',
  redistributed: 'Được phép phân phối lại theo điều khoản nguồn'
}

function displayDate(value: string): string {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

export function SourceTrustDisclosure({ section, headingTag }: {
  section: { provenance?: SourceProvenance; resolvedSources?: AuthoritativeSource[] }
  headingTag: 'h3' | 'h4' | 'h5'
}) {
  if (!section.provenance || !section.resolvedSources?.length) return null
  const SourceHeading = headingTag
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-200">
          {SOURCE_ORIGIN_LABELS[section.provenance.origin]}
        </p>
        {section.provenance.adaptationNote && (
          <p className="mt-2 text-sm leading-6 text-zinc-300">{section.provenance.adaptationNote}</p>
        )}
      </div>
      <details className="rounded-xl border border-zinc-700 bg-zinc-950/50 open:border-purple-500/50">
        <summary className="min-h-11 cursor-pointer px-4 py-3 font-bold text-purple-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400">
          Nguồn và quyền sử dụng
        </summary>
        <div className="space-y-4 border-t border-zinc-800 p-4">
          {section.resolvedSources.map((source) => (
            <article key={source.sourceId} className="min-w-0 rounded-lg border border-zinc-800 p-4">
              <SourceHeading className="break-words font-bold text-zinc-100">{source.title}</SourceHeading>
              <dl className="mt-3 grid gap-2 text-sm text-zinc-300 sm:grid-cols-[max-content_minmax(0,1fr)]">
                <dt className="font-semibold text-zinc-400">Đơn vị phát hành</dt>
                <dd className="break-words">{source.publisher}</dd>
                <dt className="font-semibold text-zinc-400">Phiên bản</dt>
                <dd className="break-words">{source.versionOrPublishedAt}</dd>
                <dt className="font-semibold text-zinc-400">Vị trí tham chiếu</dt>
                <dd className="break-words">{source.exactLocation}</dd>
                <dt className="font-semibold text-zinc-400">Ngày truy cập</dt>
                <dd>{displayDate(source.accessedAt)}</dd>
                <dt className="font-semibold text-zinc-400">Cách sử dụng</dt>
                <dd>{REUSE_MODE_LABELS[source.reuseMode]}</dd>
              </dl>
              {source.requiredAttribution && (
                <p className="mt-3 break-words text-xs leading-5 text-zinc-400">
                  Ghi nguồn: {source.requiredAttribution}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
                <a href={source.canonicalUrl} target="_blank" rel="noreferrer"
                  className="break-words text-cyan-300 underline decoration-cyan-500/50 underline-offset-4">
                  Mở nguồn tham khảo — cần Internet
                </a>
                <a href={source.licenseIdOrRightsUrl} target="_blank" rel="noreferrer"
                  className="break-words text-zinc-300 underline decoration-zinc-600 underline-offset-4">
                  Xem quyền và điều khoản sử dụng — cần Internet
                </a>
              </div>
            </article>
          ))}
        </div>
      </details>
    </div>
  )
}
