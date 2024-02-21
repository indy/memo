import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

export default function CryptoAssets({}) {
    type Crypto = {
        bitcoinPrice: number;
        ethereumPrice: number;
        bitcoinQuantity: number;
        ethereumQuantity: number;
    };

    let initialState: Crypto = {
        bitcoinPrice: 0,
        ethereumPrice: 0,
        bitcoinQuantity: 1.29474647135881,
        ethereumQuantity: 10.071847688774 + 1.75791463 + 0.08430548 + 0.05470321 + (1.26088 * 1.09205),
    };
    let [localState, setLocalState] = useState(initialState);

    useEffect(() => {
        try {
            const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd';
            fetch(url).then((response) => {
                if (!response.ok) {
                    throw new Error(`Unable to fetch price`);
                }
                response.json().then((data) => {
                    setLocalState({
                        ...localState,
                        bitcoinPrice: data.bitcoin.usd,
                        ethereumPrice: data.ethereum.usd
                    })
                });
            });
        } catch (error: any) {
            console.error('Error:', error.message);
        }
    }, []);


    let btcValue = localState.bitcoinPrice * localState.bitcoinQuantity;
    let ethValue = localState.ethereumPrice * localState.ethereumQuantity;
    let totalValue = btcValue + ethValue;

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
        </div>
    )
}
