import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { ROUND_SIZE, BASE_SIZE } from "./utils/constants";
import clsx from "clsx";
import {
  DownloadIcon,
  ImageIcon,
  InfoIcon,
  MoonIcon,
  SunIcon,
} from "./FeatherIcons";

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

const App: React.FC = () => {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark" | null) || "light",
  );
  const [fullImageUrl, setFullImageUrl] = useState<string>("");
  const [croppedImageURL, setCroppedImageURL] = useState<string>("");
  const [generatedImageURLs, setGeneratedImageURLs] = useState<string[]>([]);

  const handleChangeFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) {
        return;
      }
      const [file] = e.target.files;
      if (!file) {
        return;
      }
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const image = new Image();
      image.src = URL.createObjectURL(file);
      setFullImageUrl(image.src);
      image.onload = () => {
        if (!context) {
          return;
        }

        // 縦横比が 16:9 でない場合は、横幅を維持したまま、下が残るようにクロップしたデータを生成する。correctionedImage という名前で格納する。
        const RATIO = image.width / BASE_SIZE.width;
        console.log({
          RATIO,
        });
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
          image,
          176 * RATIO,
          image.height - 1216 * RATIO,
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
          setCroppedImageURL(URL.createObjectURL(blob));
          setGeneratedImageURLs((prev) => [URL.createObjectURL(blob), ...prev]);
        });
      };
    },
    [],
  );

  const handleClickDownload = useCallback(() => {
    const anchor = document.createElement("a");
    anchor.href = croppedImageURL;
    anchor.download = `cropped_${dayjs().format("YYYYMMDD_HHmmss")}.png`;
    anchor.click();
  }, [croppedImageURL]);

  return (
    <div className="container max-w-screen-md mx-auto py-8 flex flex-col gap-6">
      <div className="font-bold text-center flex items-center justify-between">
        <div className="flex flex-col gap-2 justify-start items-start">
          <h1 className="text-2xl">MDCardCropper</h1>
          <p className="text-xs font-normal">
            マスターデュエルカード画像クロップツール
          </p>
        </div>
        <button
          type="button"
          className="leading-none appearance-none"
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

      <div className="flex gap-4">
        <div className="relative w-3/4">
          <input
            type="file"
            className="absolute left-0 top-0 w-full h-full opacity-0 z-20 cursor-pointer"
            onInput={handleChangeFile}
          />
          {
            <div className="w-[576px] h-[324px] relative z-10">
              <img
                src={fullImageUrl || ""}
                className={clsx([
                  "rounded overflow-hidden transition-opacity duration-300 relative z-20",
                  fullImageUrl ? "opacity-100" : "opacity-0",
                ])}
                alt=""
              />
              <div
                className={clsx(
                  "absolute left-0 top-0 w-full h-full rounded overflow-hidden text-lg flex flex-col items-center justify-center gap-2 leading-none",
                  fullImageUrl
                    ? "bg-gray-600 dark:bg-gray-200"
                    : "bg-gray-200 dark:bg-gray-600",
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
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <div className="w-[176px] h-[257px] relative">
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
            <div className="mt-[2px]">
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
        <div className="flex flex-col gap-2">
          <h2 className="font-bold">クロップ履歴</h2>
          <p className="text-xs">
            まとまった画像が必要な場合は、一通り切り抜いてからダウンロードすると便利です。再読込でクリアされます。
          </p>
        </div>
        <ul className="flex gap-4 flex-nowrap">
          {generatedImageURLs.map((url, index) => (
            <li key={index} className="generated-image">
              <a
                className="w-20 h-[116px] relative block leading-none"
                href={url}
                target="_blank"
              >
                <img src={url} className="rounded-sm overflow-hidden" alt="" />
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

      <section className="bg-gray-100 dark:bg-gray-700 rounded p-6 flex flex-col gap-4">
        <h2 className="font-bold text-gray-800 dark:text-gray-50 flex gap-2 items-center justify-start">
          <InfoIcon />
          このツールについて
        </h2>
        <p className="text-sm leading-loose">
          マスターデュエルのカード詳細画面のスクリーンショットから、カード画像を切り抜くためのツールです。
          <br />
          ひとまず正式にサポートしているのは Steam 版のみとなりますが、16:9
          で撮影されたスクリーンショットであれば、解像度に依存せず自動的に切り抜きます。
        </p>
      </section>

      <section className="text-right flex justify-end items-end">
        <a
          href="https://twitter.com/share?ref_src=twsrc%5Etfw"
          className="twitter-share-button text-sm"
          data-show-count="false"
        >
          Tweet
        </a>
      </section>

      <footer className="text-center text-sm">
        &copy; 2024{" "}
        <a href="https://x.com/potato4d" className="underline">
          @potato4d
        </a>
      </footer>
    </div>
  );
};

export default App;
