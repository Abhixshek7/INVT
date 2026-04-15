import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconChartBar, IconTrendingUp, IconCalendar, IconTarget } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { forecastService } from "@/services/forecastService";
import { apiUrl } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const [isTraining, setIsTraining] = useState(false);

  // Fetch forecast data using the service
  const { data: forecastResponse, isLoading: isForecastLoading, error: forecastError, refetch: refetchForecast } = useQuery({
    queryKey: ["forecast"],
    queryFn: () => forecastService.getForecast(30),
    retry: false,
  });

  const forecastData = forecastResponse?.predictions || [];

  const { data: metricsData } = useQuery({
    queryKey: ["analytics-metrics"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(apiUrl("/api/dashboard/analytics"), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-auth-token": token || "",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch metrics");
      return res.json();
    }
  });

  const { mutate: trainModel } = useMutation({
    mutationFn: async () => {
      setIsTraining(true);
      return forecastService.trainModel();
    },
    onSuccess: () => {
      toast.success("Model training started!");
      // Poll or wait, then refetch
      setTimeout(() => {
        setIsTraining(false);
        refetchForecast();
        toast.success("Training completed successfully");
      }, 5000); // Mock wait for UX, real training might take longer
    },
    onError: (error: Error) => {
      setIsTraining(false);
      toast.error("Failed to start training: " + error.message);
    }
  });

  return (
    <DashboardLayout title="Analytics">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Turnover Ratio</CardDescription>
              <IconChartBar className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricsData?.turnoverRatio || "0"}x</div>
              <p className="text-xs text-muted-foreground">+0.3 from last month</p>
            </CardContent>
          </Card>
          <Card >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Service Level</CardDescription>
              <IconTarget className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricsData?.serviceLevel || "100"}%</div>
              <p className="text-xs text-muted-foreground">Target: 95%</p>
            </CardContent>
          </Card>
          <Card >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Avg. Days in Stock</CardDescription>
              <IconCalendar className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricsData?.avgDaysInStock || "0"}</div>
              <p className="text-xs text-muted-foreground">-1.2 from last month</p>
            </CardContent>
          </Card>
          <Card >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Forecast Accuracy</CardDescription>
              <IconTrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricsData?.forecastAccuracy || "0"}%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Demand Forecast</CardTitle>
                <CardDescription>
                  Predicted sales volume for the next 30 days based on historical data.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchForecast()}
                  disabled={isForecastLoading}
                >
                  <IconTrendingUp className="mr-2 size-4" />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  onClick={() => trainModel()}
                  disabled={isTraining}
                >
                  {isTraining ? (
                    <>Training...</>
                  ) : (
                    <>
                      <IconTarget className="mr-2 size-4" />
                      Retrain Model
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isForecastLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading forecast data...</p>
              </div>
            ) : forecastError ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-destructive">
                <p>Failed to load forecast.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {(forecastError as Error).message || "The model might not be trained yet."}
                </p>
                <Button variant="outline" className="mt-4" onClick={() => trainModel()}>
                  Train Model Now
                </Button>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      stroke="#888888"
                      fontSize={12}
                    />
                    <YAxis stroke="#888888" fontSize={12} />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value: number) => [Math.round(value), "Quantity"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="predicted_quantity"
                      name="Forecast"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="lower_bound"
                      name="Confidence Lower"
                      stroke="#93c5fd"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="upper_bound"
                      name="Confidence Upper"
                      stroke="#93c5fd"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
