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
    isConnecting,
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
          <Button
            className="min-h-[3rem] min-w-[14rem] border bg-white text-primary hover:bg-gray-100"
            translate="no"
            disabled={isConnecting}
          >
            Connect Wallet
            <RiArrowDownSLine size={20} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[14rem]">
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
        <Button
          className="min-h-[3rem] min-w-[14rem] border bg-white text-primary hover:bg-gray-100"
          translate="no"
        >
          <div className="flex w-full flex-row items-center justify-between gap-2">
            <div className="flex flex-col items-start">
              <div className="text-sm font-bold">{activeAccount.name}</div>
              <div className="font-mono text-xs">
                {truncateHash(
                  encodeAddress(
                    activeAccount.address,
                    activeChain?.ss58Prefix || 42,
                  ),
                  8,
                )}
              </div>
            </div>
            <FiChevronDown className="shrink-0" size={22} aria-hidden="true" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="no-scrollbar max-h-[40vh] min-w-[14rem] overflow-scroll"
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
                  <div className="flex items-center gap-2 text-sm font-bold">
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
