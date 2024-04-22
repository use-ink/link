import { FC, useState } from "react"

import { encodeAddress } from "@polkadot/util-crypto"
import {
  SubstrateWalletPlatform,
  allSubstrateWallets,
  isWalletInstalled,
  useInkathon,
} from "@scio-labs/use-inkathon"
import { AiOutlineCheckCircle, AiOutlineDisconnect } from "react-icons/ai"
import { FiChevronDown, FiExternalLink } from "react-icons/fi"
import { RiArrowDownSLine } from "react-icons/ri"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { truncateHash } from "@/utils/truncate-hash"

export const ConnectButton: FC = () => {
  const {
    activeChain,
    connect,
    disconnect,
    activeAccount,
    accounts,
    setActiveAccount,
  } = useInkathon()

  // Sort installed wallets first
  const [browserWallets] = useState([
    ...allSubstrateWallets.filter(
      (w) =>
        w.platforms.includes(SubstrateWalletPlatform.Browser) &&
        isWalletInstalled(w),
    ),
    ...allSubstrateWallets.filter(
      (w) =>
        w.platforms.includes(SubstrateWalletPlatform.Browser) &&
        !isWalletInstalled(w),
    ),
  ])

  // Connect Button
  if (!activeAccount)
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex min-w-[14rem] flex-row items-center gap-4 rounded  bg-ink-shadow   text-lg text-white hover:cursor-pointer">
            <div className="border-r-2 border-white px-2 py-2">
              <RiArrowDownSLine size={20} aria-hidden="true" />
            </div>
            <div>Connect Wallet</div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[14rem] border-2 border-ink-border">
          {!activeAccount &&
            browserWallets.map((w) =>
              isWalletInstalled(w) ? (
                <DropdownMenuItem
                  key={w.id}
                  className="cursor-pointer"
                  onClick={() => {
                    void connect?.(undefined, w)
                  }}
                >
                  {w.name}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem key={w.id} className="opacity-50">
                  <a href={w.urls.website}>
                    <div className="align-center flex justify-start gap-2">
                      <p>{w.name}</p>
                      <FiExternalLink size={16} />
                    </div>
                    <p>Not installed</p>
                  </a>
                </DropdownMenuItem>
              ),
            )}
        </DropdownMenuContent>
      </DropdownMenu>
    )

  // Account Menu & Disconnect Button
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="">
        <div className="flex min-w-[14rem] flex-row items-center gap-4 rounded  bg-ink-shadow   text-lg text-white hover:cursor-pointer">
          <div className="border-r-2 border-white px-2 py-2">
            <RiArrowDownSLine size={20} aria-hidden="true" />
          </div>
          <div>{activeAccount.name}</div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="no-scrollbar max-h-[40vh] min-w-[14rem] overflow-scroll border-2 border-ink-border"
      >
        {(accounts || []).map((acc) => {
          const encodedAddress = encodeAddress(
            acc.address,
            activeChain?.ss58Prefix || 42,
          )
          const truncatedEncodedAddress = truncateHash(encodedAddress, 10)

          return (
            <DropdownMenuItem
              key={encodedAddress}
              disabled={acc.address === activeAccount?.address}
              className={
                acc.address !== activeAccount?.address ? "cursor-pointer" : ""
              }
              onClick={() => {
                setActiveAccount?.(acc)
              }}
            >
              <div className="flex w-full items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-lg font-bold text-ink-text">
                    {acc.name}
                  </div>

                  <p className="font-mono text-xs">{truncatedEncodedAddress}</p>
                </div>
                {acc.address === activeAccount?.address && (
                  <AiOutlineCheckCircle className="shrink-0" size={15} />
                )}
              </div>
            </DropdownMenuItem>
          )
        })}

        {/* Disconnect Button */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => disconnect?.()}
        >
          <div className="flex gap-2">
            <AiOutlineDisconnect size={18} />
            Disconnect
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
