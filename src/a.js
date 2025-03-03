<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crypto Tracker</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- React and ReactDOM -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <!-- Babel for JSX -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- Chart.js for visualizations -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        
        /* Dark mode scrollbar */
        .dark ::-webkit-scrollbar-track {
            background: #374151;
        }
        .dark ::-webkit-scrollbar-thumb {
            background: #6B7280;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
            background: #9CA3AF;
        }
        
        /* Loading animation */
        @keyframes pulse {
            0%, 100% {
                opacity: 0.5;
            }
            50% {
                opacity: 0.8;
            }
        }
        .loading-pulse {
            animation: pulse 1.5s ease-in-out infinite;
        }
        
        /* Shimmer effect */
        @keyframes shimmer {
            0% {
                background-position: -468px 0;
            }
            100% {
                background-position: 468px 0;
            }
        }
        .shimmer {
            background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
            background-size: 800px 104px;
            animation: shimmer 1.5s infinite linear;
        }
        
        .dark .shimmer {
            background: linear-gradient(to right, #374151 8%, #4B5563 18%, #374151 33%);
        }
    </style>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        // Check for dark mode preference
        const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDarkMode);
        
        // Main App Component
        const App = () => {
            const [cryptoData, setCryptoData] = React.useState([]);
            const [loading, setLoading] = React.useState(true);
            const [error, setError] = React.useState(null);
            const [searchTerm, setSearchTerm] = React.useState('');
            const [sortConfig, setSortConfig] = React.useState({ key: 'market_cap_rank', direction: 'ascending' });
            const [selectedCryptos, setSelectedCryptos] = React.useState([]);
            const [comparingMode, setComparingMode] = React.useState(false);
            const [currency, setCurrency] = React.useState('inr');
            const [timeRange, setTimeRange] = React.useState('24h');
            const [page, setPage] = React.useState(1);
            
            const currencySymbols = {
                'inr': '₹',
                'usd': '$',
                'eur': '€',
                'gbp': '£',
                'jpy': '¥'
            };
            
            const timeRanges = {
                '1h': 'price_change_percentage_1h_in_currency',
                '24h': 'price_change_percentage_24h_in_currency',
                '7d': 'price_change_percentage_7d_in_currency',
                '30d': 'price_change_percentage_30d_in_currency',
            };
            
            const fetchCryptoData = async () => {
                setLoading(true);
                try {
                    const response = await fetch(
                        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=${page}&sparkline=false&price_change_percentage=1h,24h,7d,30d`
                    );
                    
                    if (!response.ok) {
                        throw new Error('API limit reached or network error');
                    }
                    
                    const data = await response.json();
                    setCryptoData(data);
                    setLoading(false);
                } catch (err) {
                    setError(err.message);
                    setLoading(false);
                }
            };
            
            React.useEffect(() => {
                fetchCryptoData();
                
                // Auto refresh every 2 minutes
                const intervalId = setInterval(fetchCryptoData, 120000);
                return () => clearInterval(intervalId);
            }, [currency, page]);
            
            const handleSort = (key) => {
                let direction = 'ascending';
                if (sortConfig.key === key && sortConfig.direction === 'ascending') {
                    direction = 'descending';
                }
                setSortConfig({ key, direction });
            };
            
            const sortedData = React.useMemo(() => {
                let sortableItems = [...cryptoData];
                if (sortConfig.key !== null) {
                    sortableItems.sort((a, b) => {
                        if (a[sortConfig.key] === null) return 1;
                        if (b[sortConfig.key] === null) return -1;
                        
                        let valueA = a[sortConfig.key];
                        let valueB = b[sortConfig.key];
                        
                        if (sortConfig.key === timeRanges[timeRange]) {
                            valueA = a.price_change_percentage_24h_in_currency;
                            valueB = b.price_change_percentage_24h_in_currency;
                        }
                        
                        if (valueA < valueB) {
                            return sortConfig.direction === 'ascending' ? -1 : 1;
                        }
                        if (valueA > valueB) {
                            return sortConfig.direction === 'ascending' ? 1 : -1;
                        }
                        return 0;
                    });
                }
                return sortableItems;
            }, [cryptoData, sortConfig, timeRange]);
            
            const filteredData = React.useMemo(() => {
                return sortedData.filter(coin => 
                    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }, [sortedData, searchTerm]);
            
            const toggleCryptoSelection = (crypto) => {
                if (selectedCryptos.some(c => c.id === crypto.id)) {
                    setSelectedCryptos(selectedCryptos.filter(c => c.id !== crypto.id));
                } else {
                    if (selectedCryptos.length < 4) {
                        setSelectedCryptos([...selectedCryptos, crypto]);
                    } else {
                        alert("Aap sirf 4 currencies ko compare kar sakte hain");
                    }
                }
            };
            
            const formatCurrency = (value) => {
                if (value === null || value === undefined) return 'N/A';
                
                // For very large numbers (billions)
                if (value >= 1000000000) {
                    return `${currencySymbols[currency]}${(value / 1000000000).toFixed(2)}B`;
                }
                // For millions
                else if (value >= 1000000) {
                    return `${currencySymbols[currency]}${(value / 1000000).toFixed(2)}M`;
                }
                // For thousands
                else if (value >= 1000) {
                    return `${currencySymbols[currency]}${(value / 1000).toFixed(2)}K`;
                }
                // For small numbers
                return `${currencySymbols[currency]}${value.toFixed(2)}`;
            };
            
            const renderPriceChange = (percentage) => {
                if (percentage === null || percentage === undefined) {
                    return <span className="text-gray-500">N/A</span>;
                }
                
                const textColorClass = percentage >= 0 
                    ? "text-green-500 dark:text-green-400" 
                    : "text-red-500 dark:text-red-400";
                    
                const arrow = percentage >= 0 ? "↑" : "↓";
                
                return (
                    <span className={`${textColorClass} font-semibold`}>
                        {arrow} {Math.abs(percentage).toFixed(2)}%
                    </span>
                );
            };
            
            // Comparison chart for selected cryptocurrencies
            const ComparisonChart = () => {
                const chartRef = React.useRef(null);
                const [chartInstance, setChartInstance] = React.useState(null);
                
                React.useEffect(() => {
                    if (chartRef.current && selectedCryptos.length > 0) {
                        // Destroy previous chart if exists
                        if (chartInstance) {
                            chartInstance.destroy();
                        }
                        
                        const ctx = chartRef.current.getContext('2d');
                        
                        const isDarkMode = document.documentElement.classList.contains('dark');
                        const textColor = isDarkMode ? '#E5E7EB' : '#374151';
                        const gridColor = isDarkMode ? 'rgba(229, 231, 235, 0.1)' : 'rgba(107, 114, 128, 0.1)';
                        
                        // Colors for different cryptocurrencies
                        const colors = [
                            'rgba(93, 92, 222, 0.8)',
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(255, 206, 86, 0.8)'
                        ];
                        
                        const datasets = selectedCryptos.map((crypto, index) => {
                            const timeRangeField = timeRanges[timeRange] || 'price_change_percentage_24h_in_currency';
                            const priceData = {
                                'Current Price': crypto.current_price,
                                '% Change': crypto[timeRangeField] || crypto.price_change_percentage_24h_in_currency,
                                'Market Cap': crypto.market_cap / 1000000000, // In billions
                                'Volume': crypto.total_volume / 1000000000 // In billions
                            };
                            
                            return {
                                label: crypto.name,
                                data: Object.values(priceData),
                                backgroundColor: colors[index % colors.length],
                                borderColor: colors[index % colors.length],
                                borderWidth: 1
                            };
                        });
                        
                        const newChart = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: ['Current Price', '% Change', 'Market Cap (B)', 'Volume (B)'],
                                datasets: datasets
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        ticks: {
                                            color: textColor
                                        },
                                        grid: {
                                            color: gridColor
                                        }
                                    },
                                    x: {
                                        ticks: {
                                            color: textColor
                                        },
                                        grid: {
                                            color: gridColor
                                        }
                                    }
                                },
                                plugins: {
                                    legend: {
                                        labels: {
                                            color: textColor
                                        }
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                let label = context.dataset.label || '';
                                                if (label) {
                                                    label += ': ';
                                                }
                                                if (context.parsed.y !== null) {
                                                    if (context.label === 'Current Price') {
                                                        label += currencySymbols[currency] + context.parsed.y.toFixed(2);
                                                    } else if (context.label === '% Change') {
                                                        label += context.parsed.y.toFixed(2) + '%';
                                                    } else {
                                                        label += context.parsed.y.toFixed(2) + 'B';
                                                    }
                                                }
                                                return label;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                        
                        setChartInstance(newChart);
                    }
                }, [selectedCryptos, timeRange, currency]);
                
                return (
                    <div className="mt-4 mb-8 h-64 sm:h-80 w-full">
                        <canvas ref={chartRef}></canvas>
                    </div>
                );
            };
            
            // Skeleton loading component
            const SkeletonLoader = () => {
                return Array(10).fill().map((_, index) => (
                    <tr key={index} className="border-b dark:border-gray-700">
                        <td className="px-2 py-3"><div className="shimmer h-6 w-6 rounded-full"></div></td>
                        <td className="px-4 py-3">
                            <div className="flex items-center">
                                <div className="shimmer h-8 w-8 rounded-full mr-2"></div>
                                <div>
                                    <div className="shimmer h-4 w-16 mb-1"></div>
                                    <div className="shimmer h-3 w-10"></div>
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-3"><div className="shimmer h-4 w-20"></div></td>
                        <td className="px-4 py-3"><div className="shimmer h-4 w-16"></div></td>
                        <td className="px-4 py-3"><div className="shimmer h-4 w-24"></div></td>
                        <td className="px-4 py-3"><div className="shimmer h-4 w-24"></div></td>
                    </tr>
                ));
            };
            
            return (
                <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-200">
                    {/* Header */}
                    <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md py-4">
                        <div className="container mx-auto px-4">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <h1 className="text-2xl font-bold mb-2 md:mb-0">CryptoTracker</h1>
                                <div className="flex items-center space-x-2">
                                    <select 
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-md px-3 py-1 text-sm border border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    >
                                        <option value="inr">INR (₹)</option>
                                        <option value="usd">USD ($)</option>
                                        <option value="eur">EUR (€)</option>
                                        <option value="gbp">GBP (£)</option>
                                        <option value="jpy">JPY (¥)</option>
                                    </select>
                                    
                                    <button 
                                        onClick={() => fetchCryptoData()}
                                        className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md px-3 py-1 text-sm transition"
                                    >
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>
                    
                    {/* Main Content */}
                    <main className="container mx-auto px-4 py-6">
                        {/* Search & Actions Bar */}
                        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Search cryptocurrency..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            
                            <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
                                <select 
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="1h">1 Hour</option>
                                    <option value="24h">24 Hours</option>
                                    <option value="7d">7 Days</option>
                                    <option value="30d">30 Days</option>
                                </select>
                                
                                <button 
                                    onClick={() => {
                                        if (selectedCryptos.length >= 2) {
                                            setComparingMode(!comparingMode);
                                        } else {
                                            alert("Tulna karne ke liye kam se kam 2 cryptocurrencies select kijiye");
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                                        selectedCryptos.length >= 2 
                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                            : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                                    }`}
                                    disabled={selectedCryptos.length < 2}
                                >
                                    {comparingMode ? 'Tulna Band Karein' : 'Tulna Karein'}
                                </button>
                            </div>
                        </div>
                        
                        {/* Selected Cryptocurrencies */}
                        {selectedCryptos.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-2">Selected Cryptocurrencies</h2>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCryptos.map(crypto => (
                                        <div 
                                            key={crypto.id}
                                            className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"
                                        >
                                            <img src={crypto.image} alt={crypto.name} className="w-5 h-5 mr-2" />
                                            <span className="text-sm font-medium mr-2">{crypto.name}</span>
                                            <button 
                                                onClick={() => toggleCryptoSelection(crypto)}
                                                className="text-gray-500 hover:text-red-500"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Comparison View */}
                        {comparingMode && selectedCryptos.length >= 2 && (
                            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                                <h2 className="text-xl font-bold mb-4">Cryptocurrency Comparison</h2>
                                <ComparisonChart />
                                
                                <div className="mt-4 overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-300 dark:border-gray-700">
                                                <th className="text-left px-4 py-2">Cryptocurrency</th>
                                                <th className="text-right px-4 py-2">Price</th>
                                                <th className="text-right px-4 py-2">
                                                    {timeRange === '1h' ? '1h Change' : 
                                                     timeRange === '7d' ? '7d Change' :
                                                     timeRange === '30d' ? '30d Change' : '24h Change'}
                                                </th>
                                                <th className="text-right px-4 py-2">Market Cap</th>
                                                <th className="text-right px-4 py-2">Volume (24h)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedCryptos.map(crypto => (
                                                <tr key={crypto.id} className="border-b dark:border-gray-700">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center">
                                                            <img src={crypto.image} alt={crypto.name} className="w-6 h-6 mr-2" />
                                                            <div>
                                                                <div className="font-medium">{crypto.name}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">{crypto.symbol}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-right px-4 py-3 font-medium">
                                                        {formatCurrency(crypto.current_price)}
                                                    </td>
                                                    <td className="text-right px-4 py-3">
                                                        {renderPriceChange(
                                                            timeRange === '1h' ? crypto.price_change_percentage_1h_in_currency :
                                                            timeRange === '7d' ? crypto.price_change_percentage_7d_in_currency :
                                                            timeRange === '30d' ? crypto.price_change_percentage_30d_in_currency :
                                                            crypto.price_change_percentage_24h_in_currency
                                                        )}
                                                    </td>
                                                    <td className="text-right px-4 py-3">
                                                        {formatCurrency(crypto.market_cap)}
                                                    </td>
                                                    <td className="text-right px-4 py-3">
                                                        {formatCurrency(crypto.total_volume)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        
                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                                <p>{error}</p>
                                <p className="text-sm mt-1">API limit reach ho gayi hai ya network error hai. Thodi der baad try karein.</p>
                            </div>
                        )}
                        
                        {/* Main Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Select
                                            </th>
                                            <th 
                                                scope="col" 
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort('name')}
                                            >
                                                Cryptocurrency
                                                {sortConfig.key === 'name' && (
                                                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                                                )}
                                            </th>
                                            <th 
                                                scope="col" 
                                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort('current_price')}
                                            >
                                                Price
                                                {sortConfig.key === 'current_price' && (
                                                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                                                )}
                                            </th>
                                            <th 
                                                scope="col" 
                                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort(timeRanges[timeRange])}
                                            >
                                                {timeRange === '1h' ? '1h' : 
                                                 timeRange === '7d' ? '7d' :
                                                 timeRange === '30d' ? '30d' : '24h'} 
                                                Change
                                                {sortConfig.key === timeRanges[timeRange] && (
                                                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                                                )}
                                            </th>
                                            <th 
                                                scope="col" 
                                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort('market_cap')}
                                            >
                                                Market Cap
                                                {sortConfig.key === 'market_cap' && (
                                                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                                                )}
                                            </th>
                                            <th 
                                                scope="col" 
                                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort('total_volume')}
                                            >
                                                Volume (24h)
                                                {sortConfig.key === 'total_volume' && (
                                                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                                                )}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {loading ? (
                                            <SkeletonLoader />
                                        ) : (
                                            filteredData.length > 0 ? (
                                                filteredData.map(crypto => (
                                                    <tr 
                                                        key={crypto.id} 
                                                        className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                                            selectedCryptos.some(c => c.id === crypto.id) 
                                                                ? 'bg-purple-50 dark:bg-purple-900 bg-opacity-40 dark:bg-opacity-20' 
                                                                : ''
                                                        }`}
                                                    >
                                                        <td className="px-2 py-3 whitespace-nowrap">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={selectedCryptos.some(c => c.id === crypto.id)}
                                                                onChange={() => toggleCryptoSelection(crypto)}
                                                                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <img src={crypto.image} alt={crypto.name} className="w-8 h-8 mr-3" />
                                                                <div>
                                                                    <div className="font-medium">{crypto.name}</div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">{crypto.symbol}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right font-medium">
                                                            {formatCurrency(crypto.current_price)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                                            {renderPriceChange(
                                                                timeRange === '1h' ? crypto.price_change_percentage_1h_in_currency :
                                                                timeRange === '7d' ? crypto.price_change_percentage_7d_in_currency :
                                                                timeRange === '30d' ? crypto.price_change_percentage_30d_in_currency :
                                                                crypto.price_change_percentage_24h_in_currency
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                                            {formatCurrency(crypto.market_cap)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                                            {formatCurrency(crypto.total_volume)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                        Koi cryptocurrency nahi mili. Search term badal kar try karein.
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination */}
                            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                                            page === 1
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Page <span className="font-medium">{page}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button
                                                onClick={() => setPage(Math.max(1, page - 1))}
                                                disabled={page === 1}
                                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                                                    page === 1
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                                                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                <span className="sr-only">Previous</span>
                                                ←
                                            </button>
                                            {Array.from({ length: 3 }, (_, i) => Math.max(1, page - 1) + i).map(pageNum => (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                                                        page === pageNum
                                                            ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-300'
                                                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setPage(page + 1)}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 text-sm font-medium bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <span className="sr-only">Next</span>
                                                →
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                    
                    {/* Footer */}
                    <footer className="bg-gray-100 dark:bg-gray-800 py-4 mt-8">
                        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
                            <p>Data provided by CoinGecko API</p>
                            <p className="mt-1">© {new Date().getFullYear()} CryptoTracker. All rights reserved.</p>
                        </div>
                    </footer>
                </div>
            );
        };
        
        // Render the app
        const root = document.getElementById('root');
        ReactDOM.render(<App />, root);
    </script>
</body>
</html>