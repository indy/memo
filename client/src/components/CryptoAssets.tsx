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


    const btcValue = localState.bitcoinPrice * localState.bitcoinQuantity;
    const ethValue = localState.ethereumPrice * localState.ethereumQuantity;
    const solValue = localState.solanaPrice * localState.solanaQuantity;
    const totalValue = btcValue + ethValue + solValue;

    function toUSD(n: number): string {
        return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }
    function fixed2(n: number): string {
        return Number(n).toFixed(2);
    }

    function maxBtc() {
        let max = 0;
        if (localState.bitcoinPrice > 0) {
            max = totalValue / localState.bitcoinPrice;
        }

        return fixed2(max);
    }

    function maxEth() {
        let max = 0;
        if (localState.ethereumPrice > 0) {
            max = totalValue / localState.ethereumPrice;
        }

        return fixed2(max);
    }

    function pad(s: string, pstart: number) {
        let sp = s.padStart(pstart);
        return (<span class="ws-pre">{sp}</span>);
    }

    function info(coin: string) {
        let value: number = 0;
        let quantity: number = 0;
        let price: number = 0;

        switch(coin) {
            case "BTC":
                value = localState.bitcoinPrice * localState.bitcoinQuantity;
                quantity = localState.bitcoinQuantity;
                price = localState.bitcoinPrice;
                break;
            case "ETH":
                value = localState.ethereumPrice * localState.ethereumQuantity;
                quantity = localState.ethereumQuantity;
                price = localState.ethereumPrice;
                break;
            case "SOL":
                value = localState.solanaPrice * localState.solanaQuantity;
                quantity = localState.solanaQuantity;
                price = localState.solanaPrice;
                break;
        };

        return (
            <div>{pad(toUSD(value), 10)} ({pad(fixed2(quantity), 5)} {coin} @ {pad(toUSD(price), 10)})</div>
        )
    }

    return (
        <div class="c-crypto-assets">
            <div>Total : {pad(toUSD(totalValue), 11)}</div>
            <div>Profit: {pad(toUSD(totalValue - localState.dollarsSpent), 11)}</div>
            <div class="crypto-assets-v-spacer"></div>
            { info("BTC") }
            { info("ETH") }
            { info("SOL") }
            <div class="crypto-assets-v-spacer"></div>
            <div>Potential Max BTC: {pad(maxBtc(), 5)}</div>
            <div>Potential Max ETH: {pad(maxEth(), 5)}</div>
        </div>
    )
}
