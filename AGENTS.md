# AGENTS.md

このリポジトリで作業するエージェント向けの指示です。

## 作業ルール

- 他のエージェントが同時に作業している可能性があります。コミット時は自分が編集したファイルだけを明示的に stage してください。
- 他人の未コミット変更や無関係なファイルを stage したり、切り戻したりしないでください。
- 破壊的な git 操作は、ユーザーから明示的に依頼された場合だけ実行してください。
- エージェントによるコミットの場合、Co-authored-by にエージェントの情報を記載してください。
- 該当する Skill がある場合は必要に応じて使用してください。
- サブエージェントは必要に応じて活用してください。

## プロジェクト概要

MDCardCropper は、マスターデュエルのカード詳細画面スクリーンショットからカード画像を切り抜く React + TypeScript + Vite アプリです。

主な機能:

- 画像ファイル選択またはクリップボード貼り付けからのカード画像切り抜き
- 複数画像のクロップ履歴とまとめてダウンロード
- Steam 版の拡大画像向けクロップオプション
- Chrome Built-in AI Prompt API によるカード名自動判別とダウンロードファイル名生成

## 開発コマンド

パッケージ管理には pnpm を使用します。

```sh
pnpm install
pnpm run dev
pnpm run build
pnpm run lint
pnpm run format
pnpm run preview
```

## 検証

コード変更後は、影響範囲に応じて以下を実行してください。

```sh
pnpm run build
pnpm run lint
```

依存関係を変更した場合は、追加で以下も確認してください。

```sh
pnpm install --frozen-lockfile
pnpm outdated --format table
```

このリポジトリでは `pnpm-workspace.yaml` で `minimumReleaseAge: 4320` を設定しています。依存更新時はこの設定を尊重してください。

## 実装メモ

- メインの UI と画像処理は `src/App.tsx` にあります。
- Chrome Built-in AI の型は `@types/dom-chromium-ai` と `src/vite-env.d.ts` の参照で提供されています。
- Chrome Built-in AI が利用できない場合でも、従来のタイムスタンプベースのファイル名にフォールバックする設計です。
