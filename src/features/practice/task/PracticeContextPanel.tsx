import type { CanonicalPracticeContext } from '../../../content/schema'
import { SectionRenderer } from '../../lesson/SectionRenderer'

export function PracticeContextPanel({ lessonId, context }: { lessonId: string; context: CanonicalPracticeContext }) {
  return (
    <section aria-label={context.title} className="space-y-4 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-sky-300">Bộ dữ kiện công việc · chỉ dùng cho lượt này</p>
        <h3 className="mt-2 text-xl font-black">{context.title}</h3>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {context.artifacts.map((artifact) => (
          <div key={artifact.id} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <SectionRenderer lessonId={lessonId} section={artifact} headingLevel={4} />
          </div>
        ))}
      </div>
    </section>
  )
}
