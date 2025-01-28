import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Search, Filter, Download } from "lucide-react";

const InsiderDashboard = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    ticker: "",
    dateRange: "30",
    transactionType: "all",
    minAmount: "0",
  });
  const [stats, setStats] = useState({
    totalBuyAmount: 0,
    totalSellAmount: 0,
    netAmount: 0,
    uniqueInsiders: 0,
  });

  // Fetch insider trades
  const fetchTrades = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page: 1,
        limit: 50,
      });

      const response = await fetch(`/api/insider-trades?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTrades(data.data);
        // Update stats if ticker is selected
        if (filters.ticker) {
          fetchStats(filters.ticker);
        }
      }
    } catch (error) {
      console.error("Error fetching trades:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats for a specific ticker
  const fetchStats = async (ticker) => {
    try {
      const response = await fetch(`/api/insider-trades/stats/${ticker}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [filters]);

  // Prepare data for chart
  const chartData = trades.reduce((acc, trade) => {
    const date = new Date(trade.filingDate).toLocaleDateString();
    const existingDay = acc.find((d) => d.date === date);

    if (existingDay) {
      if (trade.transactionType === "Purchase") {
        existingDay.buyAmount += trade.totalValue;
      } else {
        existingDay.sellAmount += trade.totalValue;
      }
    } else {
      acc.push({
        date,
        buyAmount: trade.transactionType === "Purchase" ? trade.totalValue : 0,
        sellAmount: trade.transactionType === "Purchase" ? 0 : trade.totalValue,
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Insider Trading Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Enter ticker symbol"
              value={filters.ticker}
              onChange={(e) =>
                setFilters({ ...filters, ticker: e.target.value.toUpperCase() })
              }
            />
            <Select
              value={filters.dateRange}
              onValueChange={(value) =>
                setFilters({ ...filters, dateRange: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.transactionType}
              onValueChange={(value) =>
                setFilters({ ...filters, transactionType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Purchase">Purchases</SelectItem>
                <SelectItem value="Sale">Sales</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Min Amount ($)"
              value={filters.minAmount}
              onChange={(e) =>
                setFilters({ ...filters, minAmount: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {filters.ticker && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Buys</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                ${stats.totalBuyAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Sells</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                ${stats.totalSellAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Net Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${
                  stats.netAmount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${stats.netAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Insiders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {stats.uniqueInsiders}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="buyAmount" name="Purchases" fill="#22c55e" />
                <Bar dataKey="sellAmount" name="Sales" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trades Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Transactions</CardTitle>
            <Button
              variant="outline"
              onClick={() => {
                /* TODO: Export functionality */
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Insider</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : trades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No insider trading activity found
                    </TableCell>
                  </TableRow>
                ) : (
                  trades.map((trade) => (
                    <TableRow key={trade._id}>
                      <TableCell>
                        {new Date(trade.filingDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {trade.ticker}
                      </TableCell>
                      <TableCell>{trade.insiderName}</TableCell>
                      <TableCell>{trade.title}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            trade.transactionType === "Purchase"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {trade.transactionType}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {trade.shares.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ${trade.pricePerShare.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${trade.totalValue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsiderDashboard;
