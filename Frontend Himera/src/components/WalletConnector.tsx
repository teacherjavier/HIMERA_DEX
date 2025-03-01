import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { ReactNode } from 'react'
import { injected } from 'wagmi/connectors'

interface WalletConnectorProps {
  children?: ReactNode
}

const WalletConnector = ({ children }: WalletConnectorProps) => {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="self-stretch rounded bg-[#3E3E3B] gap-1.5 whitespace-nowrap p-2"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
              </button>
    )
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="self-stretch rounded bg-[#138ACB] gap-1.5 px-1.5 py-2"
    >
      Connect Wallet
    </button>
  )
}

export default WalletConnector
