import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

const TOKENS = [
    { id: 'bitcoin', label: 'BTC', color: '#f7931a' },
    { id: 'ethereum', label: 'ETH', color: '#627eea' },
    { id: 'binancecoin', label: 'BNB', color: '#f3ba2f' },
];

const Web3Chart = () => {
    const [chartState, setChartState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const fetchMarketData = async () => {
            try {
                const responses = await Promise.all(
                    TOKENS.map((token) =>
                        fetch(
                            `https://api.coingecko.com/api/v3/coins/${token.id}/market_chart?vs_currency=usd&days=7`
                        ).then((res) => {
                            if (!res.ok) {
                                throw new Error(`Failed to load ${token.label} market data`);
                            }
                            return res.json();
                        })
                    )
                );

                if (cancelled) return;

                const labels = responses[0].prices.map(([timestamp]) => {
                    const date = new Date(timestamp);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                });

                setChartState({
                    labels,
                    datasets: TOKENS.map((token, index) => ({
                        label: `${token.label} (USD)`,
                        borderColor: token.color,
                        backgroundColor: token.color,
                        data: responses[index].prices.map(([, price]) => Number(price.toFixed(2))),
                        tension: 0.3,
                        fill: false,
                    })),
                });
                setError(null);
            } catch (fetchError) {
                if (!cancelled) {
                    setError(fetchError.message || 'Unable to load Web3 market chart');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchMarketData();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 w-full">
            <div className="flex items-center justify-between mb-4">
                <span className="font-medium uppercase text-gray-800">Web3 Token Prices (7 Days)</span>
                <span className="text-xs text-gray-500">Source: CoinGecko</span>
            </div>

            {loading && (
                <div className="h-64 flex items-center justify-center text-gray-500">
                    Loading Web3 chart...
                </div>
            )}

            {!loading && error && (
                <div className="h-64 flex items-center justify-center text-red-500 text-sm text-center px-4">
                    {error}
                </div>
            )}

            {!loading && !error && chartState && (
                <Line
                    data={chartState}
                    options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                            },
                        },
                        scales: {
                            y: {
                                ticks: {
                                    callback: (value) => `$${value}`,
                                },
                            },
                        },
                    }}
                />
            )}
        </div>
    );
};

export default Web3Chart;
