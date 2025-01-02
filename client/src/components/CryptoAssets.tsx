import { useEffect, useState } from "preact/hooks";

export default function CryptoAssets({ }) {
    type Crypto = {
        aavePrice: number;
        arcPrice: number;
        bitcoinPrice: number;
        ethereumPrice: number;
        pepePrice: number;
        solanaPrice: number;
        uniswapPrice: number;
        virtualsPrice: number;
        aaveQuantity: number;
        arcQuantity: number;
        bitcoinQuantity: number;
        ethereumQuantity: number;
        pepeQuantity: number;
        solanaQuantity: number;
        uniswapQuantity: number;
        virtualsQuantity: number;
        dollarsSpent: number;
    };

    const lidoEth = 16.88722044;
    const trezorEth = 0.090052062259163808;
    const inderjitEth = 0.1602;

    const dollarsOnChain = 0;

    const initialState: Crypto = {
        aavePrice: 0,
        arcPrice: 0,
        bitcoinPrice: 0,
        ethereumPrice: 0,
        pepePrice: 0,
        solanaPrice: 0,
        uniswapPrice: 0,
        virtualsPrice: 0,
        aaveQuantity: 9.0632,
        arcQuantity: 33302.986054464345122858,
        bitcoinQuantity: 0.95652791,
        ethereumQuantity: lidoEth + trezorEth + inderjitEth,
        pepeQuantity: 93757832.6482039,
        solanaQuantity: 18.574,
        uniswapQuantity: 290.6725,
        virtualsQuantity: 2521.7137,
        dollarsSpent: 95130.05 - dollarsOnChain
    };
    let [localState, setLocalState] = useState(initialState);

    function tokenPriceUrl(network: string, address: string): string {
        const resUrl = `https://api.coingecko.com/api/v3/simple/token_price/${network}?contract_addresses=${address}&vs_currencies=usd`;
        return resUrl;
    }

    useEffect(() => {
        const baseId = "base";
        const ethId = "ethereum";
        const arcContractAddress = "0xc82e3db60a52cf7529253b4ec688f631aad9e7c2";
        const virtualsContractAddress = "0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b";
        const normalUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,aave,uniswap,pepe&vs_currencies=usd';

        try {
            Promise.all([fetch(normalUrl),
                         fetch(tokenPriceUrl(baseId, virtualsContractAddress)),
                         fetch(tokenPriceUrl(ethId, arcContractAddress))])
                .then(([response1, response2, response3]) => {
                    return Promise.all([response1.json(), response2.json(), response3.json()]);
                })
                .then(([data, virtualsData, arcData]) => {
                    setLocalState({
                        ...localState,
                        aavePrice: data.aave.usd,
                        arcPrice: arcData[arcContractAddress].usd,
                        bitcoinPrice: data.bitcoin.usd,
                        ethereumPrice: data.ethereum.usd,
                        pepePrice: data.pepe.usd,
                        solanaPrice: data.solana.usd,
                        uniswapPrice: data.uniswap.usd,
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

    const aaveValue = localState.aavePrice * localState.aaveQuantity;
    const arcValue = localState.arcPrice * localState.arcQuantity;
    const btcValue = localState.bitcoinPrice * localState.bitcoinQuantity;
    const ethValue = localState.ethereumPrice * localState.ethereumQuantity;
    const pepeValue = localState.pepePrice * localState.pepeQuantity;
    const solValue = localState.solanaPrice * localState.solanaQuantity;
    const uniswapValue = localState.uniswapPrice * localState.uniswapQuantity;
    const virtualsValue = localState.virtualsPrice * localState.virtualsQuantity;

    const totalValue = arcValue + btcValue + ethValue + solValue + uniswapValue + aaveValue + pepeValue + virtualsValue;
    const profitPercentage = (100 / localState.dollarsSpent) * totalValue;

    const aavePct = (100 / totalValue) * aaveValue;
    const arcPct = (100 / totalValue) * arcValue;
    const btcPct = (100 / totalValue) * btcValue;
    const ethPct = (100 / totalValue) * ethValue;
    const pepePct = (100 / totalValue) * pepeValue;
    const solPct = (100 / totalValue) * solValue;
    const uniswapPct = (100 / totalValue) * uniswapValue;
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
            {info("VIRTS", localState.virtualsPrice, localState.virtualsQuantity)}
            {info("ARC", localState.arcPrice, localState.arcQuantity)}
            {info("UNI", localState.uniswapPrice, localState.uniswapQuantity)}
            {info("AAVE", localState.aavePrice, localState.aaveQuantity)}
            {info("PEPE", localState.pepePrice, localState.pepeQuantity)}

            <div class="crypto-assets-v-spacer"></div>

            <div>{percent("BTC", btcPct)} {percent("ETH", ethPct)}</div>
            <div>{percent("SOL", solPct)} {percent("PEPE", pepePct)}</div>
            <div>{percent("VIRTS", virtualsPct)} {percent("ARC", arcPct)}</div>
            <div>{percent("UNI", uniswapPct)} {percent("AAVE", aavePct)}</div>

            <div class="crypto-assets-v-spacer"></div>

            {allIn("BTC", localState.bitcoinPrice, totalValue)}
            {allIn("ETH", localState.ethereumPrice, totalValue)}
        </div>
    )
}
