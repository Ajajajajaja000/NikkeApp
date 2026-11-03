export type PageId = "home" | "nikkes" | "teams" | "settings";

const items: Array<{ id: PageId; icon: string; label: string }> = [
  { id: "home", icon: "⌂", label: "ホーム" },
  { id: "nikkes", icon: "◇", label: "ニケ" },
  { id: "teams", icon: "⌘", label: "編成" },
  { id: "settings", icon: "⚙", label: "設定" },
];

export function BottomNav({ page, onChange }: { page: PageId; onChange: (page: PageId) => void }) {
  return (
    <nav className="bottom-nav" aria-label="メインメニュー">
      {items.map((item) => (
        <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => onChange(item.id)} aria-current={page === item.id ? "page" : undefined}>
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
