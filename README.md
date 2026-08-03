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

## Deployment

本番環境は GitHub 連携の Cloudflare Pages で配信します。

| 項目 | 設定値 |
| --- | --- |
| Production branch | `master` |
| Build command | `pnpm run build` |
| Build output directory | `dist` |
| Root directory | 未指定（repository root） |
| Node.js | `22.x` |
| Custom domain | `crop.ygotools.com` |

`master` への push を起点に Cloudflare Pages が自動でビルド・デプロイします。Preview branch builds が有効な場合、同一リポジトリの Pull Request では Preview Deployment が作成されます。

デプロイ障害時は Cloudflare Pages で直前の正常なデプロイへロールバックします。Firebase Hosting を停止するまでは、緊急時に `crop.ygotools.com` の CNAME を `ygo-crop.web.app` へ戻すことでも移行前の旧環境へ切り戻せます。再度 Pages へ戻す場合は、CNAME を `md-detail-cropper.pages.dev` へ変更し、その後 Pages 側のカスタムドメインが Active になるまで確認します。
