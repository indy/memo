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
        solanaQuantity: 0.06532819
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


    let btcValue = localState.bitcoinPrice * localState.bitcoinQuantity;
    let ethValue = localState.ethereumPrice * localState.ethereumQuantity;
    let solValue = localState.solanaPrice * localState.solanaQuantity;
    let totalValue = btcValue + ethValue + solValue;

    function toDollars(n: number): string {
        return "$" + Number(n).toFixed(2);
    }
    function fixed2(n: number): string {
        return Number(n).toFixed(2);
    }

    return (
        <div class="c-crypto-assets">
            <div>Total {toDollars(totalValue)}</div>
            <div>{toDollars(btcValue)} ({fixed2(localState.bitcoinQuantity)} BTC @ {toDollars(localState.bitcoinPrice)}) </div>
            <div>{toDollars(ethValue)} ({fixed2(localState.ethereumQuantity)} ETH @ {toDollars(localState.ethereumPrice)}) </div>
            <div>{toDollars(solValue)} ({fixed2(localState.solanaQuantity)} SOL @ {toDollars(localState.solanaPrice)}) </div>
        </div>
    )
}
