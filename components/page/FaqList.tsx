import { JsonLd, faqPageJsonLd, type FaqItem } from "@/lib/jsonld";

export function FaqList({ url, items }: { url: string; items: readonly FaqItem[] }) {
  return (
    <section id="faq">
      <h2>Questions</h2>
      {items.map((item) => (
        <div key={item.question}>
          <h3>{item.question}</h3>
          <p>{item.answer}</p>
        </div>
      ))}
      <JsonLd data={faqPageJsonLd({ url, items })} />
    </section>
  );
}
