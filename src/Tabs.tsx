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

// Exact ChevronDown from the design system (assemblycom/design-system icons).
function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        fill="currentColor"
        d="M10.011 14.69a.93.93 0 0 1-.669-.273l-7.496-7.5c-.323-.332-.41-.914 0-1.324s.977-.344 1.325 0 6.84 6.836 6.84 6.836l6.836-6.842c.32-.318.927-.39 1.32.002.337.338.416.913 0 1.33l-7.5 7.498a.9.9 0 0 1-.656.273"
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
        'relative flex h-full self-stretch shrink-0 items-center justify-center gap-1.5',
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
        <span className="absolute -bottom-px left-0 right-0 h-px bg-text-primary" />
      )}
    </button>
  );
}

/**
 * Mobile rendering — a dropdown button showing the active tab, opening a menu
 * (Tasks-app FilterButtonsGroupSelector pattern). Not a native <select>.
 */
function MobileTabsBar<T extends string>({
  tabs,
  activeTabKey,
  onTabChange,
  leadingInset,
}: {
  tabs: TabItem<T>[];
  activeTabKey: T;
  onTabChange: (key: T) => void;
  leadingInset: number;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeLabel = tabs.find((t) => t.key === activeTabKey)?.label ?? '';

  return (
    <div
      ref={ref}
      style={{ paddingLeft: leadingInset }}
      className="relative flex h-12 items-center border-0 border-b border-solid border-tab-border"
    >
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 border-none bg-transparent cursor-pointer px-2 text-sm font-normal text-text-primary"
        >
          {activeLabel}
          <ChevronDown />
        </button>
        {open && (
          <div
            role="listbox"
            className="absolute left-0 top-full z-10 mt-1 min-w-[160px] rounded border border-solid border-tab-border bg-white py-1 shadow-popover-50"
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="option"
                aria-selected={tab.key === activeTabKey}
                disabled={tab.disabled}
                onClick={() => {
                  if (tab.disabled) return;
                  onTabChange(tab.key);
                  setOpen(false);
                }}
                className={[
                  'flex h-8 w-full items-center gap-3 border-none bg-transparent',
                  'cursor-pointer px-3 text-left text-sm hover:bg-tab-hover',
                  tab.disabled ? 'text-text-disabled' : 'text-text-primary',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Unified Tabs — single 1px-underline tab pattern.
 *
 * - 48px bar height (1px bottom border)
 * - 1px active indicator (#212B36) flush with the bar's bottom border
 * - Active label #212B36, inactive #6B6F76 (Figma Tab spec)
 * - Fixed 12px gap between tabs; each tab has 8px horizontal padding
 * - `spacing` controls the bar's leading inset (none / 8 / 12 / 16 / 20 / 24px)
 * - Tabs that don't fit collapse into a "N more" dropdown (32px menu items)
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
  // The wrapper is always mounted (select OR tablist render inside it), so the
  // ResizeObserver keeps firing even after switching to/from mobile.
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = React.useState(tabs.length);
  const [isMobile, setIsMobile] = React.useState(false);
  const [overflowOpen, setOverflowOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const compute = (width: number) => {
      // Ignore non-positive widths (pre-layout / detached); keep current state
      // so tabs are never wrongly collapsed before a real measurement.
      if (!width) return;

      if (width < mobileBreakpoint) {
        setIsMobile(true);
        return;
      }
      setIsMobile(false);

      const items = Array.from(
        wrapper.querySelectorAll<HTMLElement>('[data-tab-measure]'),
      );
      if (!items.length) return;

      const morePill = 88; // reserved width for the "N more" trigger
      const available = width - SPACING_PX[spacing];
      let used = 0;
      let count = 0;
      for (let i = 0; i < items.length; i++) {
        const next = items[i].offsetWidth + (i > 0 ? TAB_GAP : 0);
        const reserve = i < items.length - 1 ? morePill + TAB_GAP : 0;
        if (used + next + reserve > available) break;
        used += next;
        count++;
      }
      setVisibleCount(Math.max(1, count));
    };

    compute(wrapper.clientWidth);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) compute(entry.contentRect.width);
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [tabs, spacing, mobileBreakpoint]);

  const visibleTabs = tabs.slice(0, visibleCount);
  const overflowTabs = tabs.slice(visibleCount);

  return (
    <div ref={wrapperRef} className={['relative w-full', className ?? ''].join(' ')}>
      {/* Hidden full set used purely for width measurement (always present). */}
      <div
        aria-hidden
        style={{ gap: TAB_GAP }}
        className="pointer-events-none invisible absolute flex items-center"
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

      {isMobile ? (
        <MobileTabsBar
          tabs={tabs}
          activeTabKey={activeTabKey}
          onTabChange={onTabChange}
          leadingInset={SPACING_PX[spacing]}
        />
      ) : (
        <div
          role="tablist"
          style={{ paddingLeft: SPACING_PX[spacing], gap: TAB_GAP }}
          className="relative flex h-12 items-center border-0 border-b border-solid border-tab-border"
        >
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
                <div className="absolute left-0 top-full z-10 mt-1 min-w-[160px] rounded border border-solid border-tab-border bg-white py-1 shadow-popover-50">
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
                        'flex h-8 w-full items-center gap-3 border-none bg-transparent',
                        'cursor-pointer px-3 text-left text-sm hover:bg-tab-hover',
                        tab.disabled ? 'text-text-disabled' : 'text-text-primary',
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
      )}
    </div>
  );
}
