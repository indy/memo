import { useEffect, useState } from "preact/hooks";

export default function CryptoAssets({ }) {
    type Crypto = {
        bitcoinPrice: number;
        ethereumPrice: number;
        solanaPrice: number;
        curvePrice: number;
        bitcoinQuantity: number;
        ethereumQuantity: number;
        solanaQuantity: number;
        curveQuantity: number;
        dollarsSpent: number;
    };

    /*
trezor:
9146.68 USDC
10.92821 ETH
0.95652791 BTC

inderjit.eth:
2200.99 USDC
0.15168 ETH
9947.00097CRV

coinbase:
1854.143791 USDC
18.576184405 SOL
    */

    const dollarsOnChain = 9146.68 + 2200.99 + 1854.143791;

    const initialState: Crypto = {
        bitcoinPrice: 0,
        ethereumPrice: 0,
        solanaPrice: 0,
        curvePrice: 0,
        bitcoinQuantity: 0.95652791,
        ethereumQuantity: 10.92821 + 0.15168,
        solanaQuantity: 18.574,
        curveQuantity: 9946.99,
        dollarsSpent: 95130.05 - dollarsOnChain
    };
    let [localState, setLocalState] = useState(initialState);

    useEffect(() => {
        const normalUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,curve-dao-token&vs_currencies=usd';

        // const normalUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd';

        try {
            Promise.all([fetch(normalUrl)])
                .then(([response1]) => {
                    return Promise.all([response1.json()]);
                })
                .then(([data]) => {
                    console.log(data);
                    setLocalState({
                        ...localState,
                        bitcoinPrice: data.bitcoin.usd,
                        ethereumPrice: data.ethereum.usd,
                        solanaPrice: data.solana.usd,
                        curvePrice: data['curve-dao-token'].usd
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
    const crvValue = localState.curvePrice * localState.curveQuantity;

    const totalValue = btcValue + ethValue + solValue + crvValue;
    const profitPercentage = (100 / localState.dollarsSpent) * totalValue;

    const btcPct = (100 / totalValue) * btcValue;
    const ethPct = (100 / totalValue) * ethValue;
    const solPct = (100 / totalValue) * solValue;
    const crvPct = (100 / totalValue) * crvValue;

    return (
        <div class="c-crypto-assets">
            <div>{pad("Spent", 9)} {pad(asUSD(localState.dollarsSpent), 12)}</div>
            <div>{pad("Value", 9)} {pad(asUSD(totalValue), 12)}</div>
            <div>{pad("Profit", 9)} {pad(asUSD(totalValue - localState.dollarsSpent), 12)} {pad(`(${fixed2(profitPercentage - 100)}%)`, 13)}</div>

            <div class="crypto-assets-v-spacer"></div>

            {info("BTC", localState.bitcoinPrice, localState.bitcoinQuantity)}
            {info("ETH", localState.ethereumPrice, localState.ethereumQuantity)}
            {info("SOL", localState.solanaPrice, localState.solanaQuantity)}
            {info("CRV", localState.curvePrice, localState.curveQuantity)}

            <div class="crypto-assets-v-spacer"></div>

            <div>{percent("BTC", btcPct)} {percent("ETH", ethPct)}</div>
            <div>{percent("SOL", solPct)} {percent("CRV", crvPct)}</div>

            <div class="crypto-assets-v-spacer"></div>

            {allIn("BTC", localState.bitcoinPrice, totalValue)}
        </div>
    )
}
