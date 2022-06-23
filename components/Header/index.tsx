import Link from "next/link";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { toast } from "react-toastify";

export default function Header() {
  const wallet = useWallet();

  useEffect(() => {
    if (wallet.connecting) {
      toast.dismiss("wallet-disconnected");
    }

    if (wallet.connected) {
      toast.info("Wallet connected!", { toastId: "wallet-connected" });
    }

    if (wallet.disconnecting) {
      toast.dismiss("wallet-connected");
      toast.info("Wallet disconnected!", { toastId: "wallet-disconnected" });
    }
  }, [wallet]);

  return (
    <header className="header">
      <Link href="/" passHref>
        <a className="text-primary-main text-3xl font-medium underline underline-offset-2 hover:text-secondary-main transition-all duration-150 ease-linear hidden sm:block">
          Film Feed
        </a>
      </Link>

      <Link href="/" passHref>
        <a className="text-primary-main text-3xl font-medium underline underline-offset-2 hover:text-secondary-main transition-all duration-150 ease-linear sm:hidden">
          F-Feed
        </a>
      </Link>

      <WalletMultiButton className="bg-primary-main hover:bg-primary-dark rounded-sm" />
    </header>
  );
}
