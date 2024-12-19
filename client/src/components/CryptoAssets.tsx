import { useEffect, useState } from "preact/hooks";

export default function CryptoAssets({ }) {
    type Crypto = {
        bitcoinPrice: number;
        ethereumPrice: number;
        solanaPrice: number;
        degenPrice: number;
        flokiPrice: number;
        pepePrice: number;
        virtualsPrice: number;
        bitcoinQuantity: number;
        ethereumQuantity: number;
        solanaQuantity: number;
        degenQuantity: number;
        flokiQuantity: number;
        pepeQuantity: number;
        virtualsQuantity: number;
        dollarsSpent: number;
    };

    const lidoEth = 16.88722044;
    const trezorEth = 0.090052062259163808;
    const inderjitEth = 0.1602;

    const dollarsOnChain = 401.37;

    const initialState: Crypto = {
        bitcoinPrice: 0,
        ethereumPrice: 0,
        solanaPrice: 0,
        degenPrice: 0,
        flokiPrice: 0,
        pepePrice: 0,
        virtualsPrice: 0,
        bitcoinQuantity: 0.95652791,
        ethereumQuantity: lidoEth + trezorEth + inderjitEth,
        solanaQuantity: 18.574,
        degenQuantity: 894508.066767304,
        flokiQuantity: 8313048.56841304,
        pepeQuantity: 93757832.6482039,
        virtualsQuantity: 1820.307110530838810757,
        dollarsSpent: 95130.05 - dollarsOnChain
    };
    let [localState, setLocalState] = useState(initialState);

    useEffect(() => {
        const platformId = "base";
        const virtualsContractAddress = "0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b";
        const virtualsUrl = `https://api.coingecko.com/api/v3/simple/token_price/${platformId}?contract_addresses=${virtualsContractAddress}&vs_currencies=usd`;

        const normalUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,virtuals-base,degen-base,pepe,floki&vs_currencies=usd';

        try {
            Promise.all([fetch(normalUrl), fetch(virtualsUrl)])
                .then(([response1, response2]) => {
                    return Promise.all([response1.json(), response2.json()]);
                })
                .then(([data, virtualsData]) => {
                    setLocalState({
                        ...localState,
                        bitcoinPrice: data.bitcoin.usd,
                        ethereumPrice: data.ethereum.usd,
                        solanaPrice: data.solana.usd,
                        degenPrice: data["degen-base"].usd,
                        flokiPrice: data.floki.usd,
                        pepePrice: data.pepe.usd,
                        virtualsPrice: virtualsData[virtualsContractAddress].usd
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

            return (
                <div>{pad(q, 5)} {coin} @{pad(p, 11)} = {pad(v, 11)}</div>
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
    const dgnValue = localState.degenPrice * localState.degenQuantity;
    const flokiValue = localState.flokiPrice * localState.flokiQuantity;
    const pepeValue = localState.pepePrice * localState.pepeQuantity;
    const virtualsValue = localState.virtualsPrice * localState.virtualsQuantity;

    const totalValue = btcValue + ethValue + solValue + dgnValue + flokiValue + pepeValue + virtualsValue;
    const profitPercentage = (100 / localState.dollarsSpent) * totalValue;

    const btcPct = (100 / totalValue) * btcValue;
    const ethPct = (100 / totalValue) * ethValue;
    const solPct = (100 / totalValue) * solValue;
    const dgnPct = (100 / totalValue) * dgnValue;
    const flokiPct = (100 / totalValue) * flokiValue;
    const pepePct = (100 / totalValue) * pepeValue;
    const virtualsPct = (100 / totalValue) * virtualsValue;

    return (
        <div class="c-crypto-assets">
            <div>{pad("Spent", 9)} {pad(asUSD(localState.dollarsSpent), 12)}</div>
            <div>{pad("Value", 9)} {pad(asUSD(totalValue), 12)}</div>
            <div>{pad("Profit", 9)} {pad(asUSD(totalValue - localState.dollarsSpent), 12)} {pad(`(${fixed2(profitPercentage - 100)}%)`, 13)}</div>

            <div class="crypto-assets-v-spacer"></div>

            {info("BTC", localState.bitcoinPrice, localState.bitcoinQuantity)}
            {info("ETH", localState.ethereumPrice, localState.ethereumQuantity)}
            {info("SOL", localState.solanaPrice, localState.solanaQuantity)}
            {info("DGN", localState.degenPrice, localState.degenQuantity)}
            {info("FLOKI", localState.flokiPrice, localState.flokiQuantity)}
            {info("PEPE", localState.pepePrice, localState.pepeQuantity)}
            {info("VIRTS", localState.virtualsPrice, localState.virtualsQuantity)}

            <div class="crypto-assets-v-spacer"></div>

            <div>{percent("BTC", btcPct)} {percent("ETH", ethPct)}</div>
            <div>{percent("SOL", solPct)} {percent("DGN", dgnPct)}</div>
            <div>{percent("FLOKI", flokiPct)} {percent("PEPE", pepePct)}</div>
            <div>{percent("VIRTS", virtualsPct)} </div>

            <div class="crypto-assets-v-spacer"></div>

            {allIn("BTC", localState.bitcoinPrice, totalValue)}
            {allIn("ETH", localState.ethereumPrice, totalValue)}
        </div>
    )
}
