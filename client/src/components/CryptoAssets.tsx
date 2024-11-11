import { useEffect, useState } from "preact/hooks";

export default function CryptoAssets({}) {
    type Crypto = {
        bitcoinPrice: number;
        ethereumPrice: number;
        solanaPrice: number;
        degenPrice: number;
        bitcoinQuantity: number;
        ethereumQuantity: number;
        solanaQuantity: number;
        degenQuantity: number;
        dollarsSpent: number;
    };

    const baseEth = 2.988;
    const lidoEth = 16.87269948;
    const trezorEth = 0.090052062259163808;
    const inderjitEth = 0.185630544632905656;
    const rEth = (1.26088 * 1.09205);
    const coinbaseEth = 0.06351165;

    const initialState: Crypto = {
        bitcoinPrice: 0,
        ethereumPrice: 0,
        solanaPrice: 0,
        degenPrice: 0,
        bitcoinQuantity: 0.95652791,
        ethereumQuantity: lidoEth + trezorEth + inderjitEth + rEth + coinbaseEth + baseEth,
        solanaQuantity: 4.786,
        degenQuantity: 894508.0667673037,
        dollarsSpent: 91867.47
    };
    let [localState, setLocalState] = useState(initialState);

    useEffect(() => {
        try {
            const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,degen-base&vs_currencies=usd';
            fetch(url).then((response) => {
                if (!response.ok) {
                    throw new Error(`Unable to fetch price`);
                }
                response.json().then((data) => {
                    setLocalState({
                        ...localState,
                        bitcoinPrice: data.bitcoin.usd,
                        ethereumPrice: data.ethereum.usd,
                        solanaPrice: data.solana.usd,
                        degenPrice: data["degen-base"].usd
                    })
                });
            });
        } catch (error: any) {
            console.error('Error:', error.message);
        }
    }, []);


    function asUSD(n: number): string {
        return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }
    function asCents(n: number): string {
        return `${n}`.slice(0, 8) + "¢";
    }
    function fixed2(n: number): string {
        return Number(n).toFixed(2);
    }

    function allIn(coin: string, price: number, totalValue: number) {
        let max = 0;
        if (price > 0) {
            max = totalValue / price;
        }

        let val = fixed2(max);

        return <div>Potential Max {coin}: {pad(val, 6)}</div>
    }

    function pad(s: string, longest: number) {
        let sp = s.padStart(longest);
        return (<span class="ws-pre">{sp}</span>);
    }

    // pad the s text to longest length, if s is longer than longest use orText instead (assuming that orText.length <= longest)
    function padOr(s: string, longest: number, orText: string) {
        let t = s.length <= longest ? s : orText;
        let sp = t.padStart(longest);
        return (<span class="ws-pre">{sp}</span>);
    }

    function info(coin: string, price: number, quantity: number) {
        let value = price * quantity;

        let q = fixed2(quantity);
        let p = price > 1 ? asUSD(price) : asCents(price);
        let v = asUSD(value);

        return (
            <div>{padOr(q, 5, "many")} {coin} @{pad(p, 11)} = {pad(v, 11)}</div>
        )
    }

    function percent(coin: string, p: number) {
        return <span>{coin} {fixed2(p)}%</span>
    }

    const btcValue = localState.bitcoinPrice * localState.bitcoinQuantity;
    const ethValue = localState.ethereumPrice * localState.ethereumQuantity;
    const solValue = localState.solanaPrice * localState.solanaQuantity;
    const dgnValue = localState.degenPrice * localState.degenQuantity;
    const totalValue = btcValue + ethValue + solValue + dgnValue;
    const profitPercentage = (100 / localState.dollarsSpent) * totalValue;

    const btcPct = (100 / totalValue) * btcValue;
    const ethPct = (100 / totalValue) * ethValue;
    const solPct = (100 / totalValue) * solValue;
    const dgnPct = (100 / totalValue) * dgnValue;

    return (
        <div class="c-crypto-assets">
            <div>{pad("Spent", 9)} {pad(asUSD(localState.dollarsSpent), 12)}</div>
            <div>{pad("Value", 9)} {pad(asUSD(totalValue), 12)}</div>
            <div>{pad("Profit", 9)} {pad(asUSD(totalValue - localState.dollarsSpent), 12)} {pad(`(${fixed2(profitPercentage - 100)}%)`, 13)}</div>
            <div class="crypto-assets-v-spacer"></div>
            { info("BTC", localState.bitcoinPrice, localState.bitcoinQuantity) }
            { info("ETH", localState.ethereumPrice, localState.ethereumQuantity) }
            { info("SOL", localState.solanaPrice, localState.solanaQuantity) }
            { info("DGN", localState.degenPrice, localState.degenQuantity) }
            <div class="crypto-assets-v-spacer"></div>
            <div>| {percent("BTC", btcPct)} | {percent("SOL", solPct)} |</div>
            <div>| {percent("ETH", ethPct)} | {percent("DGN", dgnPct)} |</div>
            <div class="crypto-assets-v-spacer"></div>
            { allIn("BTC", localState.bitcoinPrice, totalValue) }
            { allIn("ETH", localState.ethereumPrice, totalValue) }
        </div>
    )
}
