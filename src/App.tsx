import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { ROUND_SIZE, BASE_SIZE } from "./utils/constants";
import clsx from "clsx";
import {
  DownloadIcon,
  ImageIcon,
  InfoIcon,
  MoonIcon,
  SunIcon,
} from "./FeatherIcons";
import { Logo } from "./Logo";

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height,
  );
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  context.clip();
}

async function cropImage(image: HTMLImageElement): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    image.onload = () => {
      if (!context) {
        return;
      }

      const copiedImage = document.createElement("canvas");
      const copiedContext = copiedImage.getContext("2d");

      if (!copiedContext) {
        return;
      }

      if (image.height / image.width < 0.56) {
        copiedImage.height = image.height;
        copiedImage.width = (image.height / 9) * 16;
        copiedContext.drawImage(
          image,
          (image.width - copiedImage.width) / 2,
          0 + (26 * copiedImage.width) / BASE_SIZE.width,
          copiedImage.width,
          copiedImage.height,
          0,
          0,
          copiedImage.width,
          copiedImage.height,
        );
      } else {
        copiedImage.width = image.width;
        copiedImage.height = image.height;
        copiedContext.drawImage(image, 0, 0);
      }

      const RATIO = copiedImage.width / BASE_SIZE.width;
      canvas.width = BASE_SIZE.crop.width * RATIO;
      canvas.height = BASE_SIZE.crop.height * RATIO;

      context.fillStyle = "rgba(255,255,255,0)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      drawRoundedRect(
        context,
        0,
        0,
        canvas.width,
        canvas.height,
        ROUND_SIZE * RATIO,
      );
      context.fillStyle = "rgba(255,255,255,0)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        copiedImage,
        176 * RATIO,
        copiedImage.height - 1216 * RATIO,
        596 * RATIO,
        869 * RATIO,
        0 * RATIO,
        0 * RATIO,
        596 * RATIO,
        869 * RATIO,
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          return;
        }
        resolve(URL.createObjectURL(blob));
      });
    }
  })
}

const App: React.FC = () => {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark" | null) || "light",
  );
  const [fullImageUrl, setFullImageUrl] = useState<string>("");
  const [croppedImageURL, setCroppedImageURL] = useState<string>("");
  const [generatedImageURLs, setGeneratedImageURLs] = useState<string[]>([]);

  useEffect(() => {
    async function onPaste(event: ClipboardEvent) {
      const items = event.clipboardData?.items;
      const imageUrls: string[] = [];
      if (!items || items.length === 0) {
        return;
      }

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile(); // Blob オブジェクトとして画像を取得
          if(!blob) {
            continue;
          }
          imageUrls.push(URL.createObjectURL(blob));
        }
      }
      const result = await Promise.all(imageUrls.map(async (url) => {
        const image = new Image();
        image.src = url;
        setFullImageUrl(image.src);
        const croppedUrl = await cropImage(image);
        return croppedUrl;
      }));
      setCroppedImageURL(result[result.length - 1] as string);
      setGeneratedImageURLs((prev) => [...result, ...prev]);
    }
    document.addEventListener('paste', onPaste);
    return () => {
      document.removeEventListener('paste', onPaste);
    }
  }, []);

  const handleChangeFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) {
        return;
      }
      if (!e.target.files.length) {
        return;
      }
      const result = await Promise.all(Array.from(e.target.files).map((file) => {
        return new Promise<string>((resolve, reject) => {
          if (!file) {
            return reject();
          }
          const image = new Image();
          image.src = URL.createObjectURL(file);
          setFullImageUrl(image.src);
          cropImage(image)
          .then((url) => resolve(url))
        })
      }));
      setCroppedImageURL(result[result.length - 1] as string);
      setGeneratedImageURLs((prev) => [...result, ...prev]);
    },
    [],
  );

  const handleClickDownload = useCallback(() => {
    const anchor = document.createElement("a");
    anchor.href = croppedImageURL;
    anchor.download = `cropped_${dayjs().format("YYYYMMDD_HHmmss")}.png`;
    anchor.click();
  }, [croppedImageURL]);

  const handleClickGeneratedImageDownload = useCallback((e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const anchor = e.currentTarget.cloneNode(true) as HTMLAnchorElement;
    anchor.download = `cropped_${dayjs().format("YYYYMMDD_HHmmss")}.png`;
    anchor.click();
  }, []);

  return (
    <div className="container max-w-screen-md mx-auto py-8 flex flex-col gap-6">
      <div className="relative font-bold text-center flex items-start md:items-center justify-between mx-4 md:mx-0">
        <div className="flex flex-col gap-2 justify-start items-start">
          <h1
            className={clsx([
              "text-2xl flex items-center justify-start gap-1",
              colorScheme === "light" ? "text-gray-800" : "text-white",
            ])}
          >
            <Logo className="w-8 h-8" />
            MDCardCropper
          </h1>
          <p className="text-xs font-normal">
            マスターデュエルのカード画像をワンタップでお手軽切り抜き
          </p>
        </div>
        <button
          type="button"
          className="leading-none appearance-none absolute md:relative right-0 md:right-auto top-0 md:top-auto"
          onClick={() => {
            setColorScheme(colorScheme === "light" ? "dark" : "light");
            localStorage.setItem(
              "theme",
              colorScheme === "light" ? "dark" : "light",
            );
            document.querySelector("html")!.style.transition = "all 0.2s ease";
            document.querySelector("html")!.classList.toggle("dark");
          }}
        >
          {colorScheme === "light" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div className="flex gap-4 flex-col md:flex-row mx-4 md:mx-0">
        <div className="relative w-full md:w-3/4">
          <input
            type="file"
            multiple={true}
            className="absolute left-0 top-0 w-full h-full opacity-0 z-20 cursor-pointer"
            onInput={handleChangeFile}
          />
          {
            <div className="w-full md:w-[576px] h-[56.25vw] md:h-[324px] relative z-10 transition-all duration-300 ease-out shadow-md shadow-blue-50 dark:shadow-gray-900">
              <img
                src={fullImageUrl || ""}
                className={clsx([
                  "rounded overflow-hidden transition-opacity duration-300 relative z-20 w-full h-full object-cover",
                  fullImageUrl ? "opacity-100" : "opacity-0",
                ])}
                alt=""
              />
              <div
                className={clsx(
                  "absolute left-0 top-0 w-full h-full rounded overflow-hidden text-lg flex flex-col items-center justify-center gap-2 leading-none",
                  fullImageUrl
                    ? "bg-gray-500 dark:bg-gray-200"
                    : "bg-gray-200 dark:bg-gray-500",
                )}
              >
                {!fullImageUrl && (
                  <>
                    <ImageIcon />
                    <span className="block text-lg font-bold mt-2">
                      ここに画像をドラッグ&ドロップ
                    </span>
                    <span className="block text-sm">
                      またはクリックでファイルを選択
                    </span>
                  </>
                )}
              </div>
            </div>
          }
        </div>
        <div className="flex-1">
          <div className="flex flex-col gap-0 md:gap-4">
            <div className="w-full">
              <div className="hidden md:block w-[176px] h-[257px] relative transition-all duration-300 ease-out shadow-md shadow-blue-50 dark:shadow-gray-900">
                <img
                  src={croppedImageURL || ""}
                  onClick={() => {
                    window.open(croppedImageURL);
                  }}
                  className={clsx([
                    "rounded overflow-hidden transition-opacity duration-300 relative z-20 cursor-pointer",
                    fullImageUrl ? "opacity-100" : "opacity-0",
                  ])}
                  alt=""
                />
                <div
                  className={clsx([
                    "absolute left-0 top-0 w-full h-full rounded overflow-hidden text-lg flex flex-col items-center justify-center gap-2",
                    croppedImageURL
                      ? "bg-gray-600 dark:bg-gray-200"
                      : "bg-gray-200 dark:bg-gray-600",
                  ])}
                />
              </div>
            </div>
            <div className="mt-[2px] transition-all duration-300 ease-out shadow-md shadow-blue-50 dark:shadow-gray-900">
              <button
                type="button"
                onClick={handleClickDownload}
                className={clsx([
                  "download-button leading-none py-2 w-full flex items-center justify-center h-12 px-4 rounded appearance-none transition-all  text-white font-bold",
                  croppedImageURL
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "pointer-events-none user-select-none bg-gray-300 dark:bg-gray-800 cursor-not-allowed",
                ])}
              >
                <DownloadIcon />
                <span className="inline-block ml-1">Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 mx-4 md:mx-0">
          <h2 className="font-bold">クロップ履歴</h2>
          <p className="text-xs">
            まとまった画像が必要な場合は、ひと通り切り抜いてからダウンロードすると便利です。再読み込みでクリアされます。
          </p>
        </div>
        <ul className="mx-4 flex gap-4 flex-nowrap">
          {generatedImageURLs.map((url) => (
            <li key={url} className="generated-image shadow-xl">
              {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
              <a
                className="w-20 h-[116px] relative block leading-none rounded-sm overflow-hidden"
                href={url}
                target="_blank"
                onClick={handleClickGeneratedImageDownload}
              >
                <img src={url} className="rounded-sm overflow-hidden" alt="" />
                <div className="generated-image-shadow opacity-0 transition-opacity duration-200 ease-out absolute left-0 top-0 w-full h-full bg-[#00000066] text-white flex items-center justify-center">
                  <DownloadIcon className="text-white w-6 h-6 transition-transform duration-200 ease-out" />
                </div>
              </a>
            </li>
          ))}
          {generatedImageURLs.length === 0 && (
            <li className="w-full text-xs px-4 h-[116px] flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-400">
                クロップ履歴はありません
              </span>
            </li>
          )}
        </ul>
      </section>

      <section className="mx-4 md:mx-0 bg-gray-100 dark:bg-gray-700 rounded p-6 flex flex-col gap-4 transition-all duration-300 ease-out shadow-md shadow-blue-50 dark:shadow-gray-900">
        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-50 flex gap-1.5 items-center justify-start">
          <InfoIcon />
          このツールについて
        </h2>
        <p className="text-sm leading-loose">
          マスターデュエルのカード詳細画面のスクリーンショットから、カード画像を切り抜くためのツールです。
          <br />
          現状正式サポートは Steam 並びにスマートフォン版となります。もしうまく動作しない場合、スクリーンショットを添えて{" "}
          <a
            href="https://x.com/potato4d"
            target="_blank"
            className="underline"
          >
            @potato4d
          </a>{" "}
          までご連絡ください。
        </p>
      </section>

      <section className="text-right flex justify-end items-end h-5 mx-4 md:mx-0">
        <a
          href="https://twitter.com/share?ref_src=twsrc%5Etfw"
          className="twitter-share-button text-sm"
          data-show-count="false"
        >
          <span className="hidden">Post</span>
        </a>
      </section>

      <details className="text-sm mx-4 md:mx-0">
        <summary className="mb-4">
          <h2 className="inline-flex cursor-pointer font-bold text-gray-800 dark:text-gray-50 gap-2 items-center justify-start">
            更新情報
          </h2>
        </summary>
        <ul className="list-disc list-inside flex flex-col gap-2">
          <li>2024/10/28: スマートフォンにもデザインを最適化しました。</li>
          <li>2024/10/12: クリップボードからの貼り付けに対応しました。</li>
          <li>2024/02/15: 複数画像のまとめてのクロップに対応しました。</li>
          <li>2024/01/01: 試験版となる v0.1.0 をリリースしました。</li>
        </ul>
      </details>

      <footer className="text-center text-sm">&copy; 2024 @potato4d</footer>
    </div>
  );
};

export default App;
