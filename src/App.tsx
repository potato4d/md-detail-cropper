import dayjs from "dayjs";
import { useCallback, useState } from "react"
import { ROUND_SIZE, BASE_SIZE } from "./utils/constants";
import clsx from 'clsx';

function drawRoundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  context.clip();
}

const MoonIcon: React.FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-moon w-5 h-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
  )
}

const SunIcon: React.FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-sun w-5 h-5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
  )
}

const App: React.FC = () => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>((localStorage.getItem('theme') as 'light' | 'dark' | null) || 'light')
  const [fullImageUrl, setFullImageUrl] = useState<string>('')
  const [croppedImageURL, setCroppedImageURL] = useState<string>('')

  const handleChangeFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }
    const [file] = e.target.files;
    if (!file) {
      return;
    }
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = new Image();
    image.src = URL.createObjectURL(file);
    setFullImageUrl(image.src);
    image.onload = () => {
      if (!context) {
        return;
      }

      const RATIO = image.width / BASE_SIZE.width;
      console.log({
        RATIO
      })
      canvas.width = BASE_SIZE.crop.width * RATIO;
      canvas.height = BASE_SIZE.crop.height * RATIO;

      context.fillStyle = 'rgba(255,255,255,0)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      drawRoundedRect(context, 0, 0, canvas.width, canvas.height, ROUND_SIZE * RATIO);
      context.fillStyle = 'rgba(255,255,255,0)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 176 * RATIO, 224 * RATIO, 596 * RATIO, 869 * RATIO, 0 * RATIO, 0 * RATIO, 596 * RATIO, 869 * RATIO);

      canvas.toBlob((blob) => {
        if (!blob) {
          return;
        }
        setCroppedImageURL(URL.createObjectURL(blob));
      });
    };
  }, []);

  const handleClickDownload = useCallback(() => {
    const anchor = document.createElement('a');
    anchor.href = croppedImageURL;
    anchor.download = `cropped_${dayjs().format('YYYYMMDD_HHmmss')}.png`;
    anchor.click();
  }, [croppedImageURL]);

  return (
    <div className='container max-w-screen-md mx-auto py-8 flex flex-col gap-6'>
      <h1 className="text-xl font-bold text-center flex items-center justify-between">
        <span>マスターデュエルカード画像クロップツール</span>
        <button type="button" onClick={() => {
          setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
          localStorage.setItem('theme', colorScheme === 'light' ? 'dark' : 'light');
          document.querySelector('html')!.style.transition = 'all 0.2s ease';
          document.querySelector('html')!.classList.toggle('dark');
        }}>
          {
            colorScheme === 'light' ? (
              <SunIcon />
              ) : (
              <MoonIcon />
            )
          }
        </button>
      </h1>

      <div className="flex gap-4">
        <div className="relative w-3/4">
          <input type="file" className="absolute left-0 top-0 w-full h-full opacity-0 z-20 cursor-pointer" onInput={handleChangeFile} />
          {
            <div className="w-[576px] h-[324px] relative">
              <img src={fullImageUrl || ""} className={clsx([
                "rounded overflow-hidden transition-opacity duration-300 relative z-20",
                fullImageUrl ? 'opacity-100' : 'opacity-0'
              ])} alt="" />
              <div className={clsx(
                "absolute left-0 top-0 w-full h-full rounded overflow-hidden text-lg flex flex-col items-center justify-center gap-2",
                fullImageUrl ? 'bg-gray-600 dark:bg-gray-200' : 'bg-gray-200 dark:bg-gray-600'
              )}>
                {
                  !fullImageUrl && (
                    <>
                      <span className="block text-lg font-bold">ここに画像をドラッグ&ドロップ</span>
                      <span className="block text-sm">またはクリックでファイルを選択</span>
                    </>
                  )
                }
              </div>
            </div>
          }
        </div>
        <div className="flex-1">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <div className="w-[176px] h-[257px] relative">
                <img src={croppedImageURL || 'https://placeholder.com/596x869'} className={clsx([
                  "rounded overflow-hidden transition-opacity duration-300 relative z-20",
                  fullImageUrl ? 'opacity-100' : 'opacity-0'
                ])} alt="" />
                <div className={clsx([
                  "absolute left-0 top-0 w-full h-full rounded overflow-hidden text-lg flex flex-col items-center justify-center gap-2",
                  croppedImageURL ? 'bg-gray-600 dark:bg-gray-200' : 'bg-gray-200 dark:bg-gray-600'
                ])} />
              </div>
            </div>
            <div>
              <button type="button" onClick={handleClickDownload} className="py-2 w-full flex items-center justify-center h-12 px-4 rounded appearance-none transition-all bg-blue-500 hover:bg-blue-600 text-white font-bold">Download</button>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-gray-100 dark:bg-gray-700 rounded p-6 flex flex-col gap-2">
        <h2 className="font-bold text-gray-800 dark:text-gray-50">ℹ このツールについて</h2>
        <p className="text-sm leading-loose">
          マスターデュエルのカード詳細画面のスクリーンショットから、カード画像を切り抜くためのツールです。<br />
          ひとまず正式にサポートしているのは Steam 版のみとなりますが、16:9 で撮影されたスクリーンショットであれば、解像度に依存せず自動的に切り抜きます。
        </p>
      </section>

      <section className="text-right flex justify-end items-end">
        <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" className="twitter-share-button" data-show-count="false">Tweet</a>
      </section>

      <footer className="text-center text-sm">
        &copy; 2024 <a href="https://x.com/potato4d" className="underline">@potato4d</a>
      </footer>
    </div>
  )
}

export default App
