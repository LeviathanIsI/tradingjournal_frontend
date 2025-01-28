// src/components/tools/InsiderActivity.jsx
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { Search, Filter } from "lucide-react";

const InsiderActivity = () => {
  const [insiderData, setInsiderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    transactionType: "all",
    minAmount: 0,
    dateRange: "30", // days
  });

  // Mock data structure for now
  const mockInsiderData = [
    {
      date: "2025-01-28",
      ticker: "AAPL",
      insiderName: "John Doe",
      title: "CEO",
      transactionType: "Purchase",
      shares: 10000,
      pricePerShare: 190.5,
      totalValue: 1905000,
      sharesOwned: 250000,
    },
  ];

  const fetchInsiderData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/insider-trading');
      // const data = await response.json();
      setInsiderData(mockInsiderData);
    } catch (error) {
      console.error("Error fetching insider data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsiderData();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Insider Trading Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by ticker or insider name"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

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
                ) : insiderData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No insider trading activity found
                    </TableCell>
                  </TableRow>
                ) : (
                  insiderData.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.ticker}
                      </TableCell>
                      <TableCell>{transaction.insiderName}</TableCell>
                      <TableCell>{transaction.title}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            transaction.transactionType === "Purchase"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.transactionType}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.shares.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ${transaction.pricePerShare.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${transaction.totalValue.toLocaleString()}
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

export default InsiderActivity;
