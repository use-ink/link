import { HiOutlineExternalLink } from "react-icons/hi"

export const Footer = () => {
  return (
    <footer className="flex flex-row items-center justify-center gap-4">
      <a
        href={"https://use.ink/"}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-1 text-center text-sm text-gray-600 hover:text-gray-800"
      >
        ink! Documentation <HiOutlineExternalLink />
      </a>

      <a
        href={"https://github.com/paritytech/link"}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-1 text-center text-sm text-gray-600 hover:text-gray-800"
      >
        GitHub <HiOutlineExternalLink />
      </a>

      <a
        href={"https://use.ink/faucet/"}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-1 text-center text-sm text-gray-600 hover:text-gray-800"
      >
        Token Faucet <HiOutlineExternalLink />
      </a>
    </footer>
  )
}
