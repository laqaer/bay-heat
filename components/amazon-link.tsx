type AmazonLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function AmazonAffiliateLink({ href, children }: AmazonLinkProps) {
  return (
    <a
      href={href}
      rel="sponsored noopener noreferrer"
      target="_blank"
      className="text-[var(--rust)] underline decoration-[color-mix(in_srgb,var(--rust)_35%,transparent)] underline-offset-[3px] hover:decoration-[var(--rust)]"
    >
      {children}
    </a>
  );
}
