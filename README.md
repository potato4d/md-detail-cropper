# MDCardCropper

マスターデュエルのカード詳細画面のスクリーンショットから、カード画像を切り抜くための Web ツールです。

## Features

- スクリーンショットを選択してカード画像を切り抜き
- クリップボードから貼り付けた画像の切り抜き
- 複数画像のクロップ履歴とまとめてダウンロード
- Steam 版の拡大画像向けクロップオプション
- Chrome Built-in AI によるカード名の自動判別とダウンロードファイル名の自動生成

## カード名の自動判別

画像の切り抜きが完了すると、切り抜き画像内のカード名領域を再度切り抜き、Chrome Built-in AI の Prompt API に OCR を依頼します。判別が完了した画像は、以後のダウンロード時にカード名ベースのファイル名を使います。

Chrome Built-in AI が利用できない環境や、判別が完了する前にダウンロードした場合は、従来どおり `cropped_YYYYMMDD_HHmmss.png` 形式のファイル名になります。

Prompt API の対応状況や有効化方法は Chrome for Developers のドキュメントを参照してください。

- https://developer.chrome.com/docs/ai/prompt-api

## Supported Screenshots

現状正式サポートは Steam 版およびスマートフォン版のスクリーンショットです。うまく切り抜けない場合は、スクリーンショットを添えて作者まで連絡してください。

## Development

このリポジトリは pnpm を使用します。

```sh
pnpm install
pnpm run dev
```

### Commands

```sh
pnpm run dev      # 開発サーバーを起動
pnpm run build    # TypeScript と Vite の本番ビルド
pnpm run lint     # ESLint
pnpm run format   # Biome で src をフォーマット
pnpm run preview  # ビルド済みアプリをプレビュー
```
