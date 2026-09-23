// components/screens/SettingsScreen.tsx
'use client';

import { useEffect, useState } from 'react';
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
import {
  WORLD_STYLES,
  ENERGY_LEVELS,
  getWorld,
  saveWorld,
  clearWorld,
  type UserWorld,
  type EnergyLevel,
  DEFAULT_WORLD,
} from '@/lib/world';

type Props = {
  onResetWelcome?: () => void;
};

export default function SettingsScreen({ onResetWelcome }: Props) {
  const { theme, setTheme } = useTheme();
  const { name, setName } = useUser();
  const [toast, setToast] = useState<string | null>(null);
  const [draftName, setDraftName] = useState(name);
  const [world, setWorld] = useState<UserWorld>(DEFAULT_WORLD);

  useEffect(() => {
    setWorld(getWorld());
  }, []);

  const updateWorld = (patch: Partial<UserWorld>) => {
    setWorld((w) => {
      const next = { ...w, ...patch };
      saveWorld(next);
      return next;
    });
  };

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
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}>
          Your name
        </h3>
        <div className="rounded-2xl p-3 flex gap-2"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveName(); }}
            placeholder="Enter your name"
            maxLength={30}
            className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          <button onClick={saveName}
            className="px-4 rounded-xl text-xs font-semibold active:scale-95 transition"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            Save
          </button>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}>
          Theme
        </h3>
        <div className="space-y-3">
          {THEMES.map((t) => {
            const isActive = theme === t.id;
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
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{t.name}</p>
                      {isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {t.tagline}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Your World */}
      <section className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}>
          🎨 Welcome world
        </h3>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          The vibe of your welcome page
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {WORLD_STYLES.map((s) => {
            const active = world.style === s.id;
            return (
              <button
                key={s.id}
                onClick={() => updateWorld({ style: s.id })}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 p-3 transition active:scale-95"
                style={{
                  background: active ? `${world.accentColor}22` : 'var(--card)',
                  border: active
                    ? `2px solid ${world.accentColor}`
                    : '1px solid var(--border)',
                }}
              >
                <span className="text-3xl">{s.emoji}</span>
                <span className="text-sm font-bold">{s.label}</span>
                <span className="text-[10px] text-center leading-tight" style={{ color: 'var(--text-muted)' }}>
                  {s.description}
                </span>
              </button>
            );
          })}
        </div>

        {world.style === 'butterflies' && (
          <div className="grid grid-cols-3 gap-2">
            {ENERGY_LEVELS.map((e) => {
              const active = world.energy === e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => updateWorld({ energy: e.id })}
                  className="py-2 rounded-xl flex flex-col items-center gap-0.5 transition active:scale-95"
                  style={{
                    background: active ? `${world.accentColor}22` : 'var(--card)',
                    border: active
                      ? `2px solid ${world.accentColor}`
                      : '1px solid var(--border)',
                  }}
                >
                  <span className="text-lg">{e.emoji}</span>
                  <span className="text-[10px] font-semibold">{e.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={() => {
            clearWorld();
            setWorld(DEFAULT_WORLD);
            showToast('World reset');
          }}
          className="mt-3 w-full py-2 rounded-xl text-xs font-semibold"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          Reset welcome world
        </button>
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}>
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
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}>
          Your data
        </h3>
        <div className="rounded-2xl p-4 mb-3 grid grid-cols-2 gap-3 text-xs"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
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
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: '#ef4444' }}>
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
            Delete everything — posts, theme, world — and start fresh.
          </p>
        </button>
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}>
          About
        </h3>
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: `linear-gradient(135deg, ${world.accentColor}, ${world.accentColor}99)` }}>
              🎨
            </div>
            <div>
              <p className="font-bold">Made for the loud ones</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Version 1.0 · A creative space
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            This is a small tool for people who make things. No login, no tracking, no
            'please upgrade to continue'. Your posts live on your device — make as much
            as you want, forever.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--text-muted)' }}>
            Inspired by everyone who ever wanted to make something loud and didn't have
            the tools. Now you do. 👑
          </p>
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 toast-in">
          <div className="px-5 py-3 rounded-2xl text-sm font-medium shadow-lg"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingButton({
  title, sub, onClick, danger = false,
}: {
  title: string; sub: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-2xl transition active:scale-[0.98]"
      style={{
        background: danger ? 'rgba(239, 68, 68, 0.06)' : 'var(--card)',
        border: `1px solid ${danger ? 'rgba(239, 68, 68, 0.25)' : 'var(--border)'}`,
      }}
    >
      <p className="font-semibold text-sm" style={{ color: danger ? '#ef4444' : 'var(--text)' }}>
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
      <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p className="text-sm font-semibold mt-0.5 capitalize">{value}</p>
    </div>
  );
}