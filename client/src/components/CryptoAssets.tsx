import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

export default function CryptoAssets({}) {
    type Crypto = {
        bitcoinPrice: number;
        ethereumPrice: number;
        solanaPrice: number;
        bitcoinQuantity: number;
        ethereumQuantity: number;
        solanaQuantity: number;
        dollarsSpent: number;
    };

    const lidoEth = 16.5;
    const trezorEth = 0.090052062259163808;
    const inderjitEth = 0.185630544632905656;
    const rEth = (1.26088 * 1.09205);
    const coinbaseEth = 0.06351165;

    const initialState: Crypto = {
        bitcoinPrice: 0,
        ethereumPrice: 0,
        solanaPrice: 0,
        bitcoinQuantity: 0.95652791,
        ethereumQuantity: lidoEth + trezorEth + inderjitEth + rEth + coinbaseEth,
        solanaQuantity: 0.06532819,
        dollarsSpent: 91229.42,
    };
    let [localState, setLocalState] = useState(initialState);

    useEffect(() => {
        try {
            const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd';
            fetch(url).then((response) => {
                if (!response.ok) {
                    throw new Error(`Unable to fetch price`);
                }
                response.json().then((data) => {
                    setLocalState({
                        ...localState,
                        bitcoinPrice: data.bitcoin.usd,
                        ethereumPrice: data.ethereum.usd,
                        solanaPrice: data.solana.usd
                    })
                });
            });
        } catch (error: any) {
            console.error('Error:', error.message);
        }
    }, []);


    function toUSD(n: number): string {
        return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
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

    function pad(s: string, pstart: number) {
        let sp = s.padStart(pstart);
        return (<span class="ws-pre">{sp}</span>);
    }

    function info(coin: string, price: number, quantity: number) {
        let value = price * quantity;
        return (
            <div>{pad(fixed2(quantity), 5)} {coin} @ {pad(toUSD(price), 10)} = {pad(toUSD(value), 10)}</div>
        )
    }

    function percent(coin: string, p: number) {
        return <span>{coin} {fixed2(p)}%</span>
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
            <div>Total : {pad(toUSD(totalValue), 11)}</div>
            <div>Profit: {pad(toUSD(totalValue - localState.dollarsSpent), 11)} ({pad(fixed2(profitPercentage - 100), 5)}%)</div>
            <div class="crypto-assets-v-spacer"></div>
            { info("BTC", localState.bitcoinPrice, localState.bitcoinQuantity) }
            { info("ETH", localState.ethereumPrice, localState.ethereumQuantity) }
            { info("SOL", localState.solanaPrice, localState.solanaQuantity) }
            <div class="crypto-assets-v-spacer"></div>
            <div>{percent("BTC", btcPct)} | {percent("ETH", ethPct)} | {percent("SOL", solPct)}</div>
            <div class="crypto-assets-v-spacer"></div>
            { allIn("BTC", localState.bitcoinPrice, totalValue) }
            { allIn("ETH", localState.ethereumPrice, totalValue) }
            { allIn("SOL", localState.solanaPrice, totalValue) }
        </div>
    )
}
