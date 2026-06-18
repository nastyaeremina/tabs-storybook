import { useState } from 'react';
import { type StoryObj, type Meta } from '@storybook/react';
import { Tabs, type TabItem } from './Tabs';

const sampleTabs: TabItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'store', label: 'Store' },
  { key: 'payment-links', label: 'Payment Links' },
  { key: 'services', label: 'Services' },
  { key: 'reports', label: 'Reports' },
];

const meta: Meta<typeof Tabs> = {
  title: 'Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: {
    tabs: sampleTabs,
    spacing: '12px',
    mobileBreakpoint: 480,
  },
  argTypes: {
    spacing: {
      description:
        'Leading inset of the bar — how far the first tab is indented from the left edge. Does NOT change the gap between tabs (that is a fixed 12px).',
      control: 'select',
      options: ['none', '8px', '12px', '16px', '20px', '24px'],
    },
    mobileBreakpoint: {
      description: 'Width in px below which tabs collapse into a dropdown',
      control: 'number',
    },
    activeTabKey: { control: false },
    onTabChange: { control: false },
    tabs: { control: false },
  },
  // Owns the active-tab state so every story (and the controls) is interactive.
  render: (args) => {
    const [active, setActive] = useState(args.tabs[0]?.key ?? '');
    return <Tabs {...args} activeTabKey={active} onTabChange={setActive} />;
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Resize the canvas to see all three responsive stages: full tabs → tabs that
 * don't fit collapse into a "N more" dropdown → below `mobileBreakpoint` the
 * whole bar becomes a dropdown selector. Also try the `spacing` control.
 */
export const Default: Story = {};

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      { key: 'invoice', label: 'Invoice' },
      { key: 'email', label: 'Email' },
      { key: 'checkout', label: 'Checkout', disabled: true },
      { key: 'summary', label: 'Summary' },
    ],
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: [
      { key: 'overview', label: 'Overview' },
      { key: 'invoices', label: 'Invoices' },
      { key: 'subscriptions', label: 'Subscriptions' },
      { key: 'store', label: 'Store' },
      { key: 'payment-links', label: 'Payment Links' },
      { key: 'services', label: 'Services' },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * All six spacing values side by side. "Spacing" only changes the leading
 * inset of the bar — the gap between tabs is a fixed 12px in every row.
 */
export const Spacing: Story = {
  render: () => {
    const [active, setActive] = useState('overview');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {(['none', '8px', '12px', '16px', '20px', '24px'] as const).map((s) => (
          <div key={s}>
            <div style={{ fontSize: 12, color: '#6B6F76', marginBottom: 4 }}>
              spacing="{s}"
            </div>
            <Tabs
              tabs={sampleTabs}
              activeTabKey={active}
              onTabChange={setActive}
              spacing={s}
            />
          </div>
        ))}
      </div>
    );
  },
};
