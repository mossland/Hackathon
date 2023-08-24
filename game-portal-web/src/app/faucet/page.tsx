import dynamic from "next/dynamic";

export default function FaucetPage() {
    const FaucetPanel = dynamic(() => import('./FaucetPanel'), { ssr: false });
    return (
        <FaucetPanel />
    );
}