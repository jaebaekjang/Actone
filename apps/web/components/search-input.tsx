import { Search } from "lucide-react";

export function SearchInput({
  action = "/search",
  defaultValue = "",
  placeholder = "제목, 내용, 태그 검색",
  hiddenFields,
}: {
  action?: string;
  defaultValue?: string;
  placeholder?: string;
  hiddenFields?: Record<string, string>;
}) {
  return (
    <form action={action} className="relative w-full">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none"
      />
    </form>
  );
}
