import PreviewForm from './PreviewForm'

export default function PreviewPage({ schema }) {
  const schemaSignature = JSON.stringify(schema)

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{schema.title}</h1>
        {schema.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{schema.description}</p>}
      </div>
      <PreviewForm key={schemaSignature} schema={schema} />
    </section>
  )
}
