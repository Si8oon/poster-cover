// components/screens/SettingsScreen.tsx
'use client';

import { useState } from 'react';
import { THEMES } from '@/lib/themes';
import { useTheme } from '@/lib/useTheme';
import { useUser } from '@/lib/useUser';
import {
  clearPosts,
  clearWelcomeFlag,
  clearDesktopNavFlag,
  resetEverything,
  getStorageSummary,
} from '@/lib/storage';

type Props = {
  onResetWelcome?: () => void;
};

const MOTION_LABEL: Record<string, string> = {
  none: 'Still',
  breathing: 'Breathing motion',
  floating: 'Floating motion',
};

export default function SettingsScreen({ onResetWelcome }: Props) {
  const { theme, setTheme } = useTheme();
  const { name, setName } = useUser();
  const [toast, setToast] = useState<string | null>(null);
  const [draftName, setDraftName] = useState(name);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleClearPosts = () => {
    if (!confirm('Delete ALL saved posts? This cannot be undone.')) return;
    clearPosts();
    showToast('All posts cleared');
  };

  const handleReplayWelcome = () => {
    clearWelcomeFlag();
    showToast('Welcome tour will show on next refresh');
    onResetWelcome?.();
  };

  const handleReplayNav = () => {
    clearDesktopNavFlag();
    showToast('Nav animation will replay on next refresh');
  };

  const handleFactoryReset = () => {
    if (
      !confirm(
        'FACTORY RESET will delete all posts, settings, and preferences. Continue?'
      )
    )
      return;
    resetEverything();
    showToast('Resetting…');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const saveName = () => {
    setName(draftName);
    showToast('Name saved');
  };

  const summary = getStorageSummary();

  return (
    <div className="px-5 py-6 fade-in">
      <h2 className="text-2xl font-bold">Settings</h2>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
        Make it yours
      </p>

      <section className="mt-8">
        <h3
          className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Your name
        </h3>
        <div
          className="rounded-2xl p-3 flex gap-2"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveName();
            }}
            placeholder="Enter your name"
            maxLength={30}
            className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />
          <button
            onClick={saveName}
            className="px-4 rounded-xl text-xs font-semibold active:scale-95 transition"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Save
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          Used to greet you on the home screen
        </p>
      </section>

      <section className="mt-8">
        <h3
          className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Theme
        </h3>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Each theme also sets a default motion for new posts
        </p>

        <div className="space-y-3">
          {THEMES.map((t) => {
            const isActive = theme === t.id;
            const motionLabel = MOTION_LABEL[t.defaultMotion.type] ?? 'Still';
            const hasMotion = t.defaultMotion.type !== 'none';

            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="w-full text-left p-4 rounded-2xl transition-all active:scale-[0.98]"
                style={{
                  background: isActive ? 'var(--card-hover)' : 'var(--card)',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{t.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{t.name}</p>
                      {isActive && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: 'var(--accent)',
                            color: 'var(--accent-fg)',
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs mt-1 leading-relaxed"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t.tagline}
                    </p>
                    {hasMotion && (
                      <p
                        className="text-[10px] mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        🎬 {motionLabel}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h3
          className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Onboarding
        </h3>
        <div className="space-y-2">
          <SettingButton
            title="Show intro tour again"
            sub="Replay the welcome screens"
            onClick={handleReplayWelcome}
          />
          <SettingButton
            title="Replay nav animation"
            sub="Bring back the desktop dock intro"
            onClick={handleReplayNav}
          />
        </div>
      </section>

      <section className="mt-8">
        <h3
          className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Your data
        </h3>

        <div
          className="rounded-2xl p-4 mb-3 grid grid-cols-2 gap-3 text-xs"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <Stat label="Saved posts" value={String(summary.posts)} />
          <Stat label="Theme" value={summary.theme} />
          <Stat label="Welcome seen" value={summary.welcomeDone ? 'yes' : 'no'} />
          <Stat label="Nav animation" value={summary.navSeen ? 'seen' : 'pending'} />
        </div>

        <SettingButton
          title="Clear all posts"
          sub="Delete every saved design. Cannot be undone."
          danger
          onClick={handleClearPosts}
        />
      </section>

      <section className="mt-8">
        <h3
          className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: '#ef4444' }}
        >
          ⚠ Danger zone
        </h3>
        <button
          onClick={handleFactoryReset}
          className="w-full text-left p-4 rounded-2xl transition active:scale-[0.98]"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
          }}
        >
          <p className="font-semibold text-sm" style={{ color: '#ef4444' }}>
            Factory reset
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Delete everything — posts, theme, welcome state — and start fresh.
          </p>
        </button>
      </section>

      <section className="mt-8">
        <h3
          className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          About
        </h3>
        <div
          className="rounded-2xl p-4 text-sm"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p style={{ color: 'var(--text-muted)' }}>
            Version 0.3 — Built with Next.js, Konva, Tailwind.
          </p>
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 toast-in">
          <div
            className="px-5 py-3 rounded-2xl text-sm font-medium shadow-lg"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingButton({
  title,
  sub,
  onClick,
  danger = false,
}: {
  title: string;
  sub: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-2xl transition active:scale-[0.98]"
      style={{
        background: danger ? 'rgba(239, 68, 68, 0.06)' : 'var(--card)',
        border: `1px solid ${
          danger ? 'rgba(239, 68, 68, 0.25)' : 'var(--border)'
        }`,
      }}
    >
      <p
        className="font-semibold text-sm"
        style={{ color: danger ? '#ef4444' : 'var(--text)' }}
      >
        {title}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        {sub}
      </p>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>
      <p className="text-sm font-semibold mt-0.5 capitalize">{value}</p>
    </div>
  );
}