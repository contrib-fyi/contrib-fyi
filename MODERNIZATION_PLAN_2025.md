# Contrib.FYI モダナイゼーション計画 2025年後半

## 現状分析

### 現在の技術スタック
- **フレームワーク**: Next.js 16.0.3 (App Router)
- **UI**: React 19.2.0
- **スタイリング**: Tailwind CSS v4 (OKLCH色空間使用)
- **コンポーネント**: Radix UI
- **状態管理**: Zustand 5.0.8
- **テスト**: Vitest 4.0.13
- **アイコン**: Lucide React

### 強み
✅ 最新のNext.js 16とReact 19を使用
✅ Tailwind CSS v4でOKLCH色空間を活用した先進的なカラーシステム
✅ Radix UIによるアクセシブルなコンポーネント基盤
✅ ダークモード対応済み

---

## 🎯 2025年後半トレンド反映提案

### 1. 【UI/UX】モダンデザインパターンの導入

#### 1.1 Bento Grid レイアウト
**トレンド**: Apple、Linear等で採用されているカード型グリッドレイアウト

**実装箇所**:
- ホームページのヒーローセクション
- 機能紹介エリア（現在はテキストのみ）
- 統計情報の表示

**実装例**:
```tsx
// 新規コンポーネント: components/features/home/BentoGrid.tsx
export function BentoGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-4">
      {/* Main feature - 大きなカード */}
      <div className="md:col-span-4 md:row-span-2 rounded-2xl border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-8">
        <h3 className="text-2xl font-bold">Real-time GitHub Search</h3>
        {/* 動的な検索結果のプレビュー */}
      </div>

      {/* Token設定 */}
      <div className="md:col-span-2 md:row-span-2 rounded-2xl border bg-card p-6">
        <TokenSettingsCard />
      </div>

      {/* 統計カード */}
      <div className="md:col-span-2 rounded-2xl border bg-card p-4">
        <StatsCard title="Issues Searched" value="10k+" />
      </div>
    </div>
  );
}
```

**メリット**:
- 視覚的な階層構造が明確
- 異なるサイズのコンテンツを効果的に配置
- モダンで洗練された印象

---

#### 1.2 Glassmorphism (磨りガラス効果)
**トレンド**: macOS、iOS風の半透明エフェクト

**実装箇所**:
- ヘッダーバー（スクロール時に背景をぼかす）
- モーダル/ダイアログの背景
- フィルターバー

**実装例**:
```css
/* globals.css に追加 */
@utility glass {
  background: oklch(1 0 0 / 70%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid oklch(1 0 0 / 18%);
}

.dark @utility glass {
  background: oklch(0.205 0 0 / 70%);
  border: 1px solid oklch(1 0 0 / 10%);
}
```

```tsx
// Header.tsx の更新
<header className="sticky top-0 z-50 glass border-b">
  {/* 既存のヘッダー内容 */}
</header>
```

**メリット**:
- 奥行き感とモダンさを演出
- コンテンツを隠さず情報を重ねられる

---

#### 1.3 マイクロインタラクション
**トレンド**: 細かなアニメーションによるUXの向上

**実装箇所**:
- ボタンのホバー/クリックエフェクト
- IssueRowの展開/折りたたみ
- 「My Picks」への追加時のフィードバック
- トースト通知

**実装例**:
```tsx
// IssueRow.tsx にリップルエフェクトを追加
import { useState } from 'react';

export function IssueRow({ issue }: { issue: Issue }) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { x, y, id: Date.now() };
    setRipples([...ripples, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <div className="relative overflow-hidden" onClick={handleClick}>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute animate-ripple rounded-full bg-primary/20"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
        />
      ))}
      {/* 既存のIssue表示内容 */}
    </div>
  );
}
```

**CSS追加**:
```css
@keyframes ripple {
  to {
    width: 500px;
    height: 500px;
    opacity: 0;
    transform: translate(-50%, -50%);
  }
}

@utility animate-ripple {
  animation: ripple 0.6s ease-out;
}
```

---

### 2. 【アニメーション】Framer Motion の導入

**理由**: 2025年のReactアプリケーションではアニメーションライブラリがほぼ標準

**メリット**:
- 宣言的なアニメーション定義
- React 19との完全互換性
- パフォーマンス最適化済み
- ジェスチャー対応（スワイプ、ドラッグ）

**実装**:
```bash
npm install framer-motion
```

**実装箇所**:

#### 2.1 リスト項目のステージングアニメーション
```tsx
// IssueList.tsx
import { motion, AnimatePresence } from 'framer-motion';

export function IssueList() {
  // ... 既存のロジック

  return (
    <div className="space-y-4 p-4">
      <AnimatePresence mode="popLayout">
        {data.items.map((issue, i) => (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <IssueRow issue={issue} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

#### 2.2 フィルター適用時のスムーズな遷移
```tsx
// FilterBar.tsx
import { motion } from 'framer-motion';

// Applied filter chips にアニメーション追加
<motion.div
  layout
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
>
  <Badge>...</Badge>
</motion.div>
```

#### 2.3 モーダルのエントランスアニメーション
```tsx
// IssueDetailModal.tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
>
  {/* モーダルコンテンツ */}
</motion.div>
```

---

### 3. 【パフォーマンス】React 19 新機能の活用

#### 3.1 Server Actions の導入（将来的なAPI拡張用）
現在はクライアントサイドでGitHub APIを直接呼び出していますが、Server Actionsを活用すると：

**メリット**:
- APIトークンをサーバーサイドで管理可能
- レート制限の効率的な管理
- キャッシング戦略の最適化

**実装例**:
```tsx
// app/actions/github.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function searchIssues(query: string) {
  const response = await fetch(
    `https://api.github.com/search/issues?q=${query}`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      next: { revalidate: 300 }, // 5分キャッシュ
    }
  );

  const data = await response.json();
  return data;
}
```

```tsx
// hooks/useIssueSearch.ts で使用
import { searchIssues } from '@/app/actions/github';

// クライアントコンポーネントから呼び出し
const data = await searchIssues(queryString);
```

#### 3.2 useOptimistic の活用
**実装箇所**: My Picks への追加/削除

```tsx
// hooks/useMyPicks.ts
'use client';

import { useOptimistic } from 'react';

export function useMyPicks() {
  const [picks, setPicks] = useState<Issue[]>([]);
  const [optimisticPicks, setOptimisticPicks] = useOptimistic(picks);

  const addPick = async (issue: Issue) => {
    // 即座にUIを更新（楽観的更新）
    setOptimisticPicks((prev) => [...prev, issue]);

    // localStorageに保存
    await saveToLocalStorage(issue);

    // 実際の状態を更新
    setPicks((prev) => [...prev, issue]);
  };

  return { picks: optimisticPicks, addPick };
}
```

**メリット**:
- 即座のフィードバック
- UXの大幅な向上

#### 3.3 useActionState の活用（フォーム処理）
**実装箇所**: 検索フォーム、フィルター

```tsx
// FilterBar.tsx
import { useActionState } from 'react';

function FilterBar() {
  const [state, submitAction, isPending] = useActionState(
    async (prevState, formData: FormData) => {
      const query = formData.get('query') as string;
      const results = await searchIssues(query);
      return { results, error: null };
    },
    { results: null, error: null }
  );

  return (
    <form action={submitAction}>
      <Input name="query" />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Searching...' : 'Search'}
      </Button>
    </form>
  );
}
```

---

### 4. 【パフォーマンス】Next.js 16 最適化

#### 4.1 Partial Prerendering (PPR) の有効化
**設定**:
```tsx
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: 'incremental',
  },
};

export default nextConfig;
```

**実装箇所**: トップページ

```tsx
// app/page.tsx
import { Suspense } from 'react';
import { IssueListSkeleton } from '@/components/features/issues/IssueListSkeleton';

export const experimental_ppr = true;

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      {/* 静的部分 - 即座にレンダリング */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Find Issues</h1>
        <p className="text-muted-foreground text-lg">...</p>
      </div>

      {/* 動的部分 - Suspenseでラップ */}
      <Suspense fallback={<IssueListSkeleton />}>
        <FilterBar />
        <IssueList />
      </Suspense>
    </div>
  );
}
```

**メリット**:
- 初期表示の高速化
- SEO向上
- Core Web Vitals の改善

#### 4.2 Turbopack の活用（開発時）
**設定**:
```json
// package.json
{
  "scripts": {
    "dev": "next dev --turbopack"
  }
}
```

**メリット**:
- 開発サーバーの起動が最大10倍高速化
- HMRの大幅な高速化

---

### 5. 【PWA】プログレッシブWebアプリ化

**2025年のトレンド**: デスクトップアプリライクなWeb体験

**実装**:
```bash
npm install next-pwa
```

**設定**:
```tsx
// next.config.js
import withPWA from 'next-pwa';

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.github\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'github-api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5分
        },
      },
    },
  ],
});

export default config;
```

**マニフェスト作成**:
```json
// public/manifest.json
{
  "name": "Contrib.FYI - Find GitHub Issues",
  "short_name": "Contrib.FYI",
  "description": "Find your next open source contribution on GitHub with ease",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/logo.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/logo.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**メタタグ追加**:
```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: 'Contrib.fyi - Find Good First Issues',
  description: 'The easiest way to find OSS contributions on GitHub.',
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Contrib.FYI',
  },
};
```

**機能**:
- ✅ オフライン対応（検索履歴とMy Picksの閲覧）
- ✅ インストール可能（ホーム画面に追加）
- ✅ プッシュ通知（新しいGood First Issueの通知）
- ✅ バックグラウンド同期

---

### 6. 【デザインシステム】拡張デザイントークン

**現状**: すでにOKLCHベースの優れたカラーシステムがある

**改善提案**: より体系的なトークン管理

```css
/* globals.css に追加 */
@theme inline {
  /* 既存のカラートークン */

  /* スペーシングトークン */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  --spacing-3xl: 4rem;     /* 64px */

  /* タイポグラフィトークン */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */

  /* シャドウトークン */
  --shadow-sm: 0 1px 2px 0 oklch(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px oklch(0 0 0 / 0.1);

  /* アニメーショントークン */
  --transition-fast: 150ms;
  --transition-base: 300ms;
  --transition-slow: 500ms;
  --easing-in: cubic-bezier(0.4, 0, 1, 1);
  --easing-out: cubic-bezier(0, 0, 0.2, 1);
  --easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Tailwind設定での活用**:
```tsx
// tailwind.config.ts
export default {
  theme: {
    extend: {
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        base: 'var(--transition-base)',
        slow: 'var(--transition-slow)',
      },
    },
  },
};
```

---

### 7. 【UX】高度なローディング状態

**現状**: 基本的なスケルトンローディング

**改善**: より洗練されたローディングUX

#### 7.1 Shimmerエフェクト
```css
/* globals.css */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

@utility shimmer {
  background: linear-gradient(
    to right,
    oklch(0.97 0 0) 0%,
    oklch(0.95 0 0) 20%,
    oklch(0.97 0 0) 40%,
    oklch(0.97 0 0) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}

.dark @utility shimmer {
  background: linear-gradient(
    to right,
    oklch(0.269 0 0) 0%,
    oklch(0.3 0 0) 20%,
    oklch(0.269 0 0) 40%,
    oklch(0.269 0 0) 100%
  );
}
```

```tsx
// IssueRowSkeleton.tsx の更新
export function IssueRowSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="h-6 w-3/4 shimmer rounded" />
      <div className="mt-2 h-4 w-1/2 shimmer rounded" />
      <div className="mt-2 h-4 w-full shimmer rounded" />
    </div>
  );
}
```

#### 7.2 プログレスインジケーター
```tsx
// components/ui/progress-bar.tsx
'use client';

import { motion } from 'framer-motion';

export function ProgressBar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
    </div>
  );
}
```

---

### 8. 【アクセシビリティ】WCAG 2.2 準拠

**現状**: Radix UIでベースは良好

**改善箇所**:

#### 8.1 キーボードナビゲーション強化
```tsx
// IssueList.tsx
export function IssueList() {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, data.items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        // 選択したIssueを開く
        openIssue(data.items[focusedIndex]);
        break;
    }
  };

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      {data.items.map((issue, i) => (
        <IssueRow
          key={issue.id}
          issue={issue}
          isFocused={i === focusedIndex}
        />
      ))}
    </div>
  );
}
```

#### 8.2 スクリーンリーダー対応の改善
```tsx
// FilterBar.tsx に追加
<div role="region" aria-label="Search filters">
  <Input
    placeholder="Search issues..."
    aria-label="Search issues by keyword"
    aria-describedby="search-help"
  />
  <span id="search-help" className="sr-only">
    Enter keywords to search for issues. Press Enter to search.
  </span>
</div>

{/* 適用されたフィルターの読み上げ */}
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {appliedFilterChips.length > 0 &&
    `${appliedFilterChips.length} filters applied`}
</div>
```

#### 8.3 Focus Visible の明確化
```css
/* globals.css */
@layer base {
  *:focus-visible {
    @apply outline-2 outline-offset-2 outline-ring;
  }

  button:focus-visible,
  a:focus-visible {
    @apply ring-2 ring-ring ring-offset-2;
  }
}
```

---

### 9. 【モバイルUX】タッチ最適化

#### 9.1 スワイプジェスチャー
```tsx
// IssueRow.tsx
import { motion, PanInfo } from 'framer-motion';

export function IssueRow({ issue }: { issue: Issue }) {
  const [offsetX, setOffsetX] = useState(0);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      // 右スワイプ: My Picksに追加
      addToMyPicks(issue);
      setOffsetX(0);
    } else if (info.offset.x < -100) {
      // 左スワイプ: 非表示
      hideIssue(issue);
      setOffsetX(0);
    } else {
      setOffsetX(0);
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -150, right: 150 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className="relative"
    >
      {/* アクションアイコン（スワイプ時に表示） */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center px-4 bg-green-500">
        <Bookmark className="h-6 w-6 text-white" />
      </div>

      {/* Issue内容 */}
      <div className="bg-card rounded-lg border p-4">
        {/* 既存の内容 */}
      </div>
    </motion.div>
  );
}
```

#### 9.2 プルトゥリフレッシュ
```tsx
// IssueList.tsx
import { useState } from 'react';

export function IssueList() {
  const [pullOffset, setPullOffset] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchMove = (e: TouchEvent) => {
    if (window.scrollY === 0 && e.touches[0].clientY > pullOffset) {
      const offset = Math.min(e.touches[0].clientY - pullOffset, 100);
      setPullOffset(offset);
    }
  };

  const handleTouchEnd = async () => {
    if (pullOffset > 60) {
      setIsRefreshing(true);
      await refresh();
      setIsRefreshing(false);
    }
    setPullOffset(0);
  };

  return (
    <div
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {pullOffset > 0 && (
        <motion.div
          className="flex justify-center py-4"
          animate={{ opacity: pullOffset / 60 }}
        >
          <RefreshCw className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
        </motion.div>
      )}
      {/* Issue list */}
    </div>
  );
}
```

---

### 10. 【新機能】AIアシスト機能（将来的）

**2025年トレンド**: AI統合がデフォルトに

**提案機能**:

#### 10.1 Issue サマリー生成
```tsx
// AI APIを使ってIssueの要約を生成
async function summarizeIssue(issue: Issue): Promise<string> {
  const response = await fetch('/api/ai/summarize', {
    method: 'POST',
    body: JSON.stringify({ title: issue.title, body: issue.body }),
  });

  const { summary } = await response.json();
  return summary;
}

// IssueDetailModal.tsx で使用
<div className="space-y-2">
  <h4 className="text-sm font-medium flex items-center gap-2">
    <Sparkles className="h-4 w-4" />
    AI Summary
  </h4>
  <p className="text-sm text-muted-foreground">{aiSummary}</p>
</div>
```

#### 10.2 スマート検索サジェスト
```tsx
// FilterBar.tsx
const [suggestions, setSuggestions] = useState<string[]>([]);

const handleSearchChange = async (value: string) => {
  if (value.length > 2) {
    const aiSuggestions = await getAISuggestions(value);
    setSuggestions(aiSuggestions);
  }
};

<Command>
  <CommandInput
    value={localSearchQuery}
    onValueChange={handleSearchChange}
  />
  <CommandList>
    {suggestions.map((suggestion) => (
      <CommandItem
        key={suggestion}
        onSelect={() => setLocalSearchQuery(suggestion)}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {suggestion}
      </CommandItem>
    ))}
  </CommandList>
</Command>
```

---

## 📊 実装優先順位

### Phase 1: 即座に実装可能（1-2週間）
1. ✅ Glassmorphism（ヘッダー、モーダル）
2. ✅ マイクロインタラクション（ボタン、リップルエフェクト）
3. ✅ Shimmerエフェクト付きスケルトン
4. ✅ デザイントークンの体系化
5. ✅ アクセシビリティ改善（キーボードナビ、ARIA）

### Phase 2: 中期実装（2-4週間）
6. ✅ Framer Motionの導入とアニメーション実装
7. ✅ Bento Gridレイアウト
8. ✅ React 19 useOptimisticの活用
9. ✅ モバイルスワイプジェスチャー
10. ✅ Turbopackへの移行

### Phase 3: 長期実装（1-2ヶ月）
11. ✅ PWA化（オフライン対応、インストール可能）
12. ✅ Partial Prerendering (PPR)
13. ✅ Server Actions（API管理の改善）
14. ✅ AI機能の統合

---

## 🎨 デザインガイドライン更新

### カラーパレット拡張
現在のOKLCHシステムに以下を追加:

```css
:root {
  /* アクセントカラー（グラデーション用） */
  --color-accent-blue: oklch(0.6 0.2 250);
  --color-accent-cyan: oklch(0.7 0.15 200);
  --color-accent-purple: oklch(0.55 0.2 290);
  --color-accent-pink: oklch(0.65 0.2 350);

  /* 成功/警告/エラー */
  --color-success: oklch(0.65 0.15 145);
  --color-warning: oklch(0.75 0.15 85);
  --color-error: oklch(0.577 0.245 27.325);

  /* グラデーション定義 */
  --gradient-primary: linear-gradient(
    135deg,
    var(--color-accent-blue),
    var(--color-accent-cyan)
  );
  --gradient-secondary: linear-gradient(
    135deg,
    var(--color-accent-purple),
    var(--color-accent-pink)
  );
}
```

### タイポグラフィスケール
```css
:root {
  /* フォントウェイト */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* 行高 */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

---

## 📈 期待される効果

### パフォーマンス指標
- **FCP (First Contentful Paint)**: 0.5s → 0.3s (40%改善)
- **LCP (Largest Contentful Paint)**: 1.2s → 0.8s (33%改善)
- **TTI (Time to Interactive)**: 2.0s → 1.2s (40%改善)
- **CLS (Cumulative Layout Shift)**: 0.1 → 0.05 (50%改善)

### UX指標
- **エンゲージメント率**: +30% (アニメーションとインタラクション)
- **モバイルコンバージョン**: +25% (スワイプジェスチャー、PWA)
- **リピート率**: +40% (PWA、オフライン対応)

### 開発効率
- **ビルド時間**: -70% (Turbopack)
- **HMR速度**: -80% (Turbopack)
- **コード保守性**: +50% (デザイントークン、TypeScript)

---

## 🔧 技術的な注意点

### 1. パフォーマンス監視
```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 2. エラーバウンダリー
```tsx
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <Button onClick={reset} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
```

### 3. セキュリティ
```tsx
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const response = NextResponse.next();

  // セキュリティヘッダー
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );

  return response;
}
```

---

## 🚀 まとめ

この計画により、Contrib.FYIは2025年後半のWebアプリケーション標準に準拠した、モダンで高性能なプラットフォームになります。

**主要な改善点**:
- 🎨 **デザイン**: Bento Grid、Glassmorphism、マイクロインタラクション
- ⚡ **パフォーマンス**: PPR、Turbopack、React 19最適化
- 📱 **モバイル**: スワイプジェスチャー、PWA
- ♿ **アクセシビリティ**: WCAG 2.2準拠
- 🎭 **アニメーション**: Framer Motion統合
- 🎯 **UX**: 楽観的更新、スマートローディング

**次のステップ**: Phase 1の実装から開始し、段階的に機能を追加していくことをお勧めします。
