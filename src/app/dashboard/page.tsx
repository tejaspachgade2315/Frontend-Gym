"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Users } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import axios from "axios";
import { getToken } from "@/lib/token";

import MainLayout from "@/components/layouts/mainlayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // Import Button component

interface MembershipDetails {
  _id: string;
  name: string;
  price: number;
}

interface UsersByMembership {
  membershipDetails: MembershipDetails;
  activeCount: number;
  inactiveCount: number;
}

interface UsersByMonthGraphData {
  year: number;
  month: string;
  count: number;
}

interface DashboardData {
  totalRevenue: number;
  lastMonthRevenue: number;
  waitingPayments: number;
  totalMembers: number;
  totalActiveMembers: number;
  totalInactiveMembers: number;
  totalTrainers: number;
  totalCleaners: number;
  usersByMonthGraphData: UsersByMonthGraphData[];
  usersByMembership: UsersByMembership[];
}

export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null); // Add error state
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state

  const fetchdashboard = async () => {
    setIsLoading(true); // Set loading state to true
    setError(null); // Clear any previous errors
    const token = getToken("token");
    if (!token) {
      setError("Unauthorized: No token found");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch dashboard data");
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  useEffect(() => {
    fetchdashboard();
  }, []);

  const handleRetry = () => {
    fetchdashboard(); // Retry fetching the dashboard data
  };

  return (
    <MainLayout headerpath="/dashboard" header="Dashboard">
      <div className="flex flex-col space-y-4 p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
          {error && (
            <Button onClick={handleRetry} className="mt-2">
              Refresh
            </Button>
          )}
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : error ? (
                <div className="text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">Rs. {data?.totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">Last Month: Rs. {data?.lastMonthRevenue}</p>
                  <p className="text-xs text-muted-foreground">Waiting Payments: Rs. {data?.waitingPayments}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total Members */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : error ? (
                <div className="text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{data?.totalMembers}</div>
                  <p className="text-xs text-muted-foreground">
                    Active: {data?.totalActiveMembers} | Inactive: {data?.totalInactiveMembers}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Trainers & Cleaners */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Trainers & Cleaners</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : error ? (
                <div className="text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Trainers</p>
                    <div className="text-2xl font-bold">{data?.totalTrainers}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Cleaners</p>
                    <div className="text-2xl font-bold">{data?.totalCleaners}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          {/* Graph */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-4">
            <CardHeader>
              <CardTitle>Number of members per month</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
                <Skeleton className="h-72 w-full" />
              ) : error ? (
                <div className="text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={data?.usersByMonthGraphData.map(({ year, month, count }) => ({
                      name: `${month}/${year}`,
                      total: count,
                    }))}
                  >
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Membership Table */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Membership Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : error ? (
                <div className="text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Membership Name</TableHead>
                        <TableHead>Active Users</TableHead>
                        <TableHead>Inactive Users</TableHead>
                        <TableHead>Price (Rs.)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.usersByMembership.map(({ membershipDetails, activeCount, inactiveCount }) => (
                        <TableRow key={membershipDetails._id}>
                          <TableCell>{membershipDetails.name}</TableCell>
                          <TableCell>{activeCount}</TableCell>
                          <TableCell>{inactiveCount}</TableCell>
                          <TableCell>{membershipDetails.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
