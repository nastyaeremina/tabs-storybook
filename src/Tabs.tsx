import * as React from 'react';

/**
 * Leading inset of the tab bar — how far the first tab is indented from the
 * bar's left edge, so its label can line up with content below.
 *
 * NOTE: this is NOT the gap between tabs. The inter-tab gap is fixed at 12px;
 * only the leading inset changes with this prop.
 */
export type TabSpacing = 'none' | '8px' | '12px' | '16px' | '20px' | '24px';

const SPACING_PX: Record<TabSpacing, number> = {
  none: 0,
  '8px': 8,
  '12px': 12,
  '16px': 16,
  '20px': 20,
  '24px': 24,
};

/** Fixed gap between adjacent tabs — identical across every spacing value. */
const TAB_GAP = 12;

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
  disabled?: boolean;
  badge?: React.ReactNode;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  /** Key of the currently active tab. */
  activeTabKey: T;
  onTabChange: (newValue: T) => void;
  /**
   * Leading inset of the bar (Figma "Spacing"). Indents the first tab from the
   * left edge. Defaults to "12px". Does NOT change the gap between tabs.
   */
  spacing?: TabSpacing;
  /** Width in px below which tabs collapse into a mobile dropdown selector. */
  mobileBreakpoint?: number;
  className?: string;
}

const DEFAULT_MOBILE_BREAKPOINT = 480;

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TabButton<T extends string>({
  tab,
  active,
  onSelect,
}: {
  tab: TabItem<T>;
  active: boolean;
  onSelect: (key: T) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={tab.disabled}
      onClick={() => !tab.disabled && onSelect(tab.key)}
      className={[
        'relative flex h-full shrink-0 items-center justify-center gap-1.5',
        'border-none bg-transparent px-2 text-sm font-normal transition-colors',
        tab.disabled
          ? 'cursor-default text-text-disabled'
          : active
            ? 'cursor-pointer text-text-primary'
            : 'cursor-pointer text-text-secondary hover:bg-tab-hover',
      ].join(' ')}
    >
      {tab.label}
      {tab.badge}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-px bg-text-primary" />
      )}
    </button>
  );
}

/**
 * Unified Tabs — single 1px-underline tab pattern.
 *
 * - 1px active indicator (#212B36) flush with the bar's bottom border
 * - Active label #212B36, inactive #6B6F76 (Figma Tab spec)
 * - Fixed 12px gap between tabs; each tab has 8px horizontal padding
 * - `spacing` controls the bar's leading inset (none / 8 / 12 / 16 / 20 / 24px)
 * - Tabs that don't fit collapse into a "N more" dropdown
 * - Below `mobileBreakpoint` the bar becomes a dropdown selector
 */
export function Tabs<T extends string = string>({
  tabs,
  activeTabKey,
  onTabChange,
  spacing = '12px',
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
  className,
}: TabsProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = React.useState(tabs.length);
  const [isMobile, setIsMobile] = React.useState(false);
  const [overflowOpen, setOverflowOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const width = container.clientWidth;

      // Before layout (width 0) show everything; the observer re-runs once the
      // bar has a real width. Collapsing at width 0 would wrongly hide tabs.
      if (width === 0) {
        setIsMobile(false);
        setVisibleCount(tabs.length);
        return;
      }

      setIsMobile(width < mobileBreakpoint);

      const items = Array.from(
        container.querySelectorAll<HTMLElement>('[data-tab-measure]'),
      );
      if (!items.length) return;

      const morePill = 88; // reserved width for the "N more" trigger
      let used = 0;
      let count = 0;
      for (let i = 0; i < items.length; i++) {
        const next = items[i].offsetWidth + (i > 0 ? TAB_GAP : 0);
        const reserve = i < items.length - 1 ? morePill + TAB_GAP : 0;
        if (used + next + reserve > width) break;
        used += next;
        count++;
      }
      setVisibleCount(Math.max(1, count));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [tabs, mobileBreakpoint]);

  if (isMobile) {
    return (
      <select
        className={[
          'h-12 w-full border-0 border-b border-solid border-tab-border',
          'bg-transparent px-2 text-sm text-text-primary',
          className ?? '',
        ].join(' ')}
        value={activeTabKey}
        onChange={(e) => onTabChange(e.target.value as T)}
      >
        {tabs.map((tab) => (
          <option key={tab.key} value={tab.key} disabled={tab.disabled}>
            {tab.label}
          </option>
        ))}
      </select>
    );
  }

  const visibleTabs = tabs.slice(0, visibleCount);
  const overflowTabs = tabs.slice(visibleCount);

  return (
    <div
      ref={containerRef}
      role="tablist"
      style={{ paddingLeft: SPACING_PX[spacing], gap: TAB_GAP }}
      className={[
        'relative flex h-12 items-center border-0 border-b border-solid border-tab-border',
        className ?? '',
      ].join(' ')}
    >
      {/* Hidden full set used purely for width measurement. */}
      <div
        aria-hidden
        style={{ gap: TAB_GAP }}
        className="pointer-events-none invisible absolute flex h-full items-center"
      >
        {tabs.map((tab) => (
          <span
            key={tab.key}
            data-tab-measure
            className="flex items-center gap-1.5 px-2 text-sm"
          >
            {tab.label}
            {tab.badge}
          </span>
        ))}
      </div>

      {visibleTabs.map((tab) => (
        <TabButton
          key={tab.key}
          tab={tab}
          active={tab.key === activeTabKey}
          onSelect={onTabChange}
        />
      ))}

      {overflowTabs.length > 0 && (
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOverflowOpen((o) => !o)}
            className="flex h-full items-center gap-1 border-none bg-transparent cursor-pointer px-1 text-sm font-normal text-text-secondary"
          >
            {overflowTabs.length} more
            <ChevronDown />
          </button>
          {overflowOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-solid border-tab-border bg-white py-1 shadow-lg">
              {overflowTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  disabled={tab.disabled}
                  onClick={() => {
                    if (tab.disabled) return;
                    onTabChange(tab.key);
                    setOverflowOpen(false);
                  }}
                  className={[
                    'flex w-full items-center gap-1.5 border-none bg-transparent',
                    'cursor-pointer px-3 py-2 text-left text-sm',
                    tab.disabled ? 'text-text-disabled' : 'text-text-primary',
                    tab.key === activeTabKey ? 'bg-[#EFF1F4]' : '',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
