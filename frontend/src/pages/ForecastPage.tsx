import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { forecastService, type ForecastResponse } from "@/services/forecastService";
import { toast } from "sonner";
import {
    TrendingUp,
    Calendar,
    BarChart3,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    ArrowUp,
    ArrowDown,
} from "lucide-react";

export default function ForecastPage() {
    const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [training, setTraining] = useState(false);
    const [selectedDays, setSelectedDays] = useState('30');

    const loadForecast = async (days: number) => {
        try {
            setLoading(true);
            const data = await forecastService.getForecast(days);
            setForecastData(data);
        } catch (error: any) {
            toast.error('Failed to load forecast', {
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTrainModel = async () => {
        if (!confirm('Training the model will take 2-5 minutes. Continue?')) {
            return;
        }

        try {
            setTraining(true);
            toast.info('Training started...', {
                description: 'This may take 2-5 minutes. You can continue using the app.',
            });

            const result = await forecastService.trainModel();

            toast.success('Model trained successfully!', {
                description: 'The forecast has been updated with the latest data.',
            });

            // Reload forecast after training
            await loadForecast(parseInt(selectedDays));
        } catch (error: any) {
            toast.error('Training failed', {
                description: error.message,
            });
        } finally {
            setTraining(false);
        }
    };

    useEffect(() => {
        loadForecast(parseInt(selectedDays));
    }, [selectedDays]);

    const getConfidenceColor = (uncertainty: number) => {
        if (uncertainty < 10) return 'text-green-600 dark:text-green-400';
        if (uncertainty < 15) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getTrendIcon = (current: number, previous?: number) => {
        if (!previous) return null;
        if (current > previous) return <ArrowUp className="h-4 w-4 text-green-500" />;
        if (current < previous) return <ArrowDown className="h-4 w-4 text-red-500" />;
        return null;
    };

    return (
        <DashboardLayout title="Demand Forecast">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Demand Forecast</h1>
                        <p className="text-muted-foreground">
                            AI-powered inventory demand predictions using Prophet ML
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Select value={selectedDays} onValueChange={setSelectedDays}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Next 7 days</SelectItem>
                                <SelectItem value="14">Next 14 days</SelectItem>
                                <SelectItem value="30">Next 30 days</SelectItem>
                                <SelectItem value="60">Next 60 days</SelectItem>
                                <SelectItem value="90">Next 90 days</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={() => loadForecast(parseInt(selectedDays))}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            onClick={handleTrainModel}
                            disabled={training}
                            variant="default"
                        >
                            <BarChart3 className={`h-4 w-4 mr-2 ${training ? 'animate-pulse' : ''}`} />
                            {training ? 'Training...' : 'Train Model'}
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                {loading ? (
                    <div className="grid gap-4 md:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-4 w-24" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-16" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : forecastData ? (
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Forecasted
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {forecastData.summary.total_forecasted_quantity.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    units over {forecastData.summary.total_predictions} days
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Daily Average
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {forecastData.summary.average_predicted_quantity.toFixed(1)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    units per day
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Peak Demand
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {forecastData.summary.max_predicted.toFixed(1)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    maximum units/day
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Low Demand
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {forecastData.summary.min_predicted.toFixed(1)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    minimum units/day
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                ) : null}

                {/* Forecast Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Detailed Predictions</CardTitle>
                                <CardDescription>
                                    Day-by-day forecast with confidence intervals
                                </CardDescription>
                            </div>
                            {forecastData && (
                                <Badge variant="outline" className="gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    {forecastData.predictions.length} predictions
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                {[...Array(7)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : forecastData ? (
                            <div className="overflow-auto max-h-[500px]">
                                <table className="w-full">
                                    <thead className="sticky top-0 bg-background border-b">
                                        <tr className="text-sm text-muted-foreground">
                                            <th className="text-left p-2">Date</th>
                                            <th className="text-right p-2">Predicted</th>
                                            <th className="text-right p-2">Range</th>
                                            <th className="text-right p-2">Confidence</th>
                                            <th className="text-right p-2">Trend</th>
                                            <th className="text-center p-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {forecastData.predictions.map((prediction, index) => {
                                            const prevPrediction = index > 0 ? forecastData.predictions[index - 1] : undefined;
                                            const isWeekend = new Date(prediction.date).getDay() % 6 === 0;

                                            return (
                                                <tr
                                                    key={prediction.date}
                                                    className={`border-b hover:bg-muted/50 ${isWeekend ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                                                >
                                                    <td className="p-2">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                {new Date(prediction.date).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    weekday: 'short',
                                                                })}
                                                            </span>
                                                            {isWeekend && (
                                                                <Badge variant="secondary" className="text-xs">Weekend</Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="text-right p-2">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <span className="font-semibold">
                                                                {prediction.predicted_quantity.toFixed(1)}
                                                            </span>
                                                            {getTrendIcon(prediction.predicted_quantity, prevPrediction?.predicted_quantity)}
                                                        </div>
                                                    </td>
                                                    <td className="text-right p-2 text-sm text-muted-foreground">
                                                        {prediction.lower_bound.toFixed(1)} - {prediction.upper_bound.toFixed(1)}
                                                    </td>
                                                    <td className="text-right p-2">
                                                        <span className={`font-medium ${getConfidenceColor(prediction.uncertainty_percentage)}`}>
                                                            {(100 - prediction.uncertainty_percentage).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className="text-right p-2 text-sm">
                                                        {prediction.trend.toFixed(2)}
                                                    </td>
                                                    <td className="text-center p-2">
                                                        {prediction.uncertainty_percentage < 12 ? (
                                                            <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                                                        ) : (
                                                            <AlertTriangle className="h-4 w-4 text-yellow-500 inline" />
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <Alert>
                                <AlertDescription>
                                    No forecast data available. Click refresh to load predictions.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                        <strong>How it works:</strong> This forecast uses Facebook's Prophet ML algorithm trained on historical sales data,
                        seasonal patterns, and holidays. The model is updated periodically with new data. Confidence levels above 88% are considered reliable.
                        Weekend patterns show higher demand as expected.
                    </AlertDescription>
                </Alert>
            </div>
        </DashboardLayout>
    );
}
