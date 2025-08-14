import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement } from 'chart.js/auto';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    ArcElement
);

interface ResearchAnalytics {
    id: number;
    projectId: number;
    projectTitle: string;
    startDate: string;
    endDate: string;
    actualEndDate: string;
    completionRate: number;
    durationDays: number;
    actualDurationDays: number;
    onTimeCompletion: boolean;
    calculatedDate: string;
}

const AnalyticsDashboard: React.FC = () => {
    const [analytics, setAnalytics] = useState<ResearchAnalytics[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/analytics');
            setAnalytics(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setLoading(false);
        }
    };

    const calculateCompletionRateData = () => {
        const onTime = analytics.filter(a => a.onTimeCompletion).length;
        const delayed = analytics.length - onTime;
        
        return {
            labels: ['On Time', 'Delayed'],
            datasets: [
                {
                    data: [onTime, delayed],
                    backgroundColor: ['#10B981', '#EF4444'],
                    borderColor: ['#059669', '#DC2626'],
                    borderWidth: 1,
                },
            ],
        };
    };

    const calculateTimelineData = () => {
        const timelineData = analytics.map(a => ({
            x: a.projectTitle,
            y: a.completionRate,
        }));

        return {
            labels: analytics.map(a => a.projectTitle),
            datasets: [
                {
                    label: 'Completion Rate (%)',
                    data: analytics.map(a => a.completionRate),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                },
            ],
        };
    };

    const calculateDurationData = () => {
        return {
            labels: analytics.map(a => a.projectTitle),
            datasets: [
                {
                    label: 'Planned Duration (days)',
                    data: analytics.map(a => a.durationDays),
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1,
                },
                {
                    label: 'Actual Duration (days)',
                    data: analytics.map(a => a.actualDurationDays),
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1,
                },
            ],
        };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Research Analytics Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Total Projects</h3>
                    <p className="text-3xl font-bold text-blue-600">{analytics.length}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">On-Time Completion</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {analytics.filter(a => a.onTimeCompletion).length}
                    </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Average Completion Rate</h3>
                    <p className="text-3xl font-bold text-purple-600">
                        {analytics.length > 0 
                            ? (analytics.reduce((sum, a) => sum + a.completionRate, 0) / analytics.length).toFixed(1)
                            : 0}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Completion Rate Distribution</h3>
                    <Pie data={calculateCompletionRateData()} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Project Performance</h3>
                    <Bar data={calculateTimelineData()} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Duration Comparison</h3>
                    <Bar data={calculateDurationData()} />
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Detailed Analytics</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {analytics.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.projectTitle}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.startDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.endDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.completionRate.toFixed(1)}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            item.onTimeCompletion ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {item.onTimeCompletion ? 'On Time' : 'Delayed'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
