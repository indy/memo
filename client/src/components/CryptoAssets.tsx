import { useEffect, useState } from "preact/hooks";

export default function CryptoAssets({ }) {
    type Crypto = {
        bitcoinPrice: number;
        ethereumPrice: number;
        solanaPrice: number;
        bitcoinQuantity: number;
        ethereumQuantity: number;
        solanaQuantity: number;
        dollarsSpent: number;
    };

    const lidoEth = 16.88722044;
    const trezorEth = 0.090052062259163808;
    const inderjitEth = 0.1602;

    const dollarsOnChain = 7011.03;

    const initialState: Crypto = {
        bitcoinPrice: 0,
        ethereumPrice: 0,
        solanaPrice: 0,
        bitcoinQuantity: 0.95652791,
        ethereumQuantity: lidoEth + trezorEth + inderjitEth,
        solanaQuantity: 18.574,
        dollarsSpent: 95130.05 - dollarsOnChain
    };
    let [localState, setLocalState] = useState(initialState);

    useEffect(() => {
        const normalUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd';

        try {
            Promise.all([fetch(normalUrl)])
                .then(([response1]) => {
                    return Promise.all([response1.json()]);
                })
                .then(([data]) => {
                    setLocalState({
                        ...localState,
                        bitcoinPrice: data.bitcoin.usd,
                        ethereumPrice: data.ethereum.usd,
                        solanaPrice: data.solana.usd,
                    })
                })
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

    function info(coin: string, price: number, quantity: number) {
        let value = price * quantity;

        if (quantity < 100) {
            let q = fixed2(quantity);
            let p = price > 1 ? asUSD(price) : asCents(price);
            let v = asUSD(value);

            let qpad = 5;
            if (coin.length > 3) {
                qpad = 5 - (coin.length - 3);
            }

            return (
                <div>{pad(q, qpad)} {coin} @{pad(p, 11)} = {pad(v, 11)}</div>
            )
        } else {
            let p = price > 1 ? asUSD(price) : asCents(price);
            let v = asUSD(value);

            return (
                <div>&#8734; {pad(coin, 7)} @{pad(p, 11)} = {pad(v, 11)}</div>
            )
        }
    }

    function percent(coin: string, p: number) {
        let q = fixed2(p);
        return <span>{pad(coin, 6)} {pad(q, 5)}%</span>
    }

    const btcValue = localState.bitcoinPrice * localState.bitcoinQuantity;
    const ethValue = localState.ethereumPrice * localState.ethereumQuantity;
    const solValue = localState.solanaPrice * localState.solanaQuantity;

    const totalValue = btcValue + ethValue + solValue;
    const profitPercentage = (100 / localState.dollarsSpent) * totalValue;

    const btcPct = (100 / totalValue) * btcValue;
    const ethPct = (100 / totalValue) * ethValue;
    const solPct = (100 / totalValue) * solValue;

    return (
        <div class="c-crypto-assets">
            <div>{pad("Spent", 9)} {pad(asUSD(localState.dollarsSpent), 12)}</div>
            <div>{pad("Value", 9)} {pad(asUSD(totalValue), 12)}</div>
            <div>{pad("Profit", 9)} {pad(asUSD(totalValue - localState.dollarsSpent), 12)} {pad(`(${fixed2(profitPercentage - 100)}%)`, 13)}</div>

            <div class="crypto-assets-v-spacer"></div>

            {info("BTC", localState.bitcoinPrice, localState.bitcoinQuantity)}
            {info("ETH", localState.ethereumPrice, localState.ethereumQuantity)}
            {info("SOL", localState.solanaPrice, localState.solanaQuantity)}

            <div class="crypto-assets-v-spacer"></div>

            <div>{percent("BTC", btcPct)} {percent("ETH", ethPct)}</div>
            <div>{percent("SOL", solPct)}</div>

            <div class="crypto-assets-v-spacer"></div>

            {allIn("BTC", localState.bitcoinPrice, totalValue)}
            {allIn("ETH", localState.ethereumPrice, totalValue)}
        </div>
    )
}
