import { HiOutlineExternalLink } from "react-icons/hi"
import Logo from "@/assets/text-black.svg"
export const Footer = () => {
  return (
    <footer className="mt-4 flex w-full flex-col items-center justify-center gap-2">
      <div>
        <div className="flex flex-row gap-2 text-black opacity-65 hover:cursor-pointer hover:opacity-80">
          <a href="https://use.ink/" target="_blank" rel="noreferrer">
            <div>Proudly built with</div>
          </a>
          <a href="https://use.ink/" target="_blank" rel="noreferrer">
            <img src={Logo} alt="Squid" className="h-5" />
          </a>
          <a href="https://popnetwork.xyz/">
            <div>& deployed on POP Network</div>
          </a>
        </div>
      </div>

      <div className="flex w-full flex-row flex-wrap items-center justify-center gap-4">
        <a
          href={"https://use.ink/"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1 text-center text-sm text-gray-600 hover:text-gray-800"
        >
          ink! Documentation <HiOutlineExternalLink />
        </a>

        <a
          href={"https://github.com/use-ink/link"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1 text-center text-sm text-gray-600 hover:text-gray-800"
        >
          GitHub <HiOutlineExternalLink />
        </a>
        <a
          href={"https://onboard.popnetwork.xyz/"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1 text-center text-sm text-gray-600 hover:text-gray-800"
        >
          Token Faucet <HiOutlineExternalLink />
        </a>
        <a
          href={"https://www.netlify.com/"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1 text-center text-sm text-gray-600 hover:text-gray-800 md:absolute md:right-1"
        >
          This site is powered by Netlify <HiOutlineExternalLink />
        </a>
      </div>
    </footer>
  )
}
