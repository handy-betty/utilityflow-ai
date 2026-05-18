export default function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="page-title">{title}</h2>
      <p className="page-subtitle">{subtitle}</p>
    </div>
  );
}
