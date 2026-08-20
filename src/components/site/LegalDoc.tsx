import { Link } from "@tanstack/react-router";
import { type LegalPolicy } from "@/legal/policies";

function ContactLine({ label, value }: { label: string; value: string }) {
  const isEmail = value.includes("@");

  return (
    <div className="flex flex-col gap-1 rounded border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {isEmail ? (
        <a className="text-sm font-semibold text-navy hover:text-gold" href={`mailto:${value}`}>
          {value}
        </a>
      ) : (
        <span className="text-sm font-semibold text-navy">{value}</span>
      )}
    </div>
  );
}

export function LegalDoc({ policy }: { policy: LegalPolicy }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
      <div className="mb-8 border-b border-border pb-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gold">The Eagle's Eye Media</p>
        <h1 className="font-serif text-3xl font-black text-navy sm:text-4xl">{policy.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{policy.summary}</p>
      </div>

      <dl className="mb-8 grid gap-3 sm:grid-cols-3">
        {policy.meta.map((item) => (
          <div key={item.label} className="rounded border border-border bg-muted/35 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</dt>
            <dd className="mt-1 text-sm font-semibold text-navy">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-8">
        {policy.sections.map((section) => (
          <section key={section.title} className="border-b border-border pb-8 last:border-b-0">
            <h2 className="font-serif text-xl font-black text-navy">{section.title}</h2>
            {section.body?.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-7 text-muted-foreground">
                {paragraph}
              </p>
            ))}
            {section.items ? (
              <ul className="mt-4 grid gap-2">
                {section.items.map((item) => (
                  <li key={item} className="rounded border border-border bg-card px-4 py-3 text-sm leading-6 text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            {section.table ? (
              <div className="mt-4 overflow-x-auto rounded border border-border">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="bg-muted text-navy">
                    <tr>
                      {section.table.headers.map((header) => (
                        <th key={header} className="px-4 py-3 font-bold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row) => (
                      <tr key={row.join("-")} className="border-t border-border">
                        {row.map((cell) => (
                          <td key={cell} className="px-4 py-3 align-top text-muted-foreground">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        ))}
      </div>

      <section className="mt-10 space-y-3">
        <h2 className="font-serif text-xl font-black text-navy">Contact</h2>
        {policy.contacts.map((contact) => (
          <ContactLine key={contact.label} label={contact.label} value={contact.value} />
        ))}
      </section>

      <div className="mt-10">
        <Link to="/legal" className="text-sm font-semibold text-navy hover:text-gold">
          Back to Legal
        </Link>
      </div>
    </main>
  );
}
