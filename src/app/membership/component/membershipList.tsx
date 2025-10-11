"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash } from "lucide-react";
import axios from "axios";
import * as XLSX from "xlsx";
import { getToken } from "@/lib/token";

interface Membership {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[] | string;
  isActive: boolean;
}

interface MembershipListProps {
  searchQuery: string;
}

export default function PlanList({ searchQuery }: MembershipListProps) {
  const [plans, setPlans] = useState<Membership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState<Membership | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  console.log("searchquery=====", searchQuery);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Membership>();
  const fetchPlans = async () => {
    const token = getToken("token");
    if (!token) {
      setError("Unauthorized: No token found");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/membership", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlans(response.data);
    } catch (error) {
      setError("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPlans();
  }, []);
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchPlans();
  };

  const handleEdit = (plan: Membership) => {
    setEditPlan(plan);
    reset(plan); // Reset form with selected plan data
  };

  const handleUpdate = async (data: Membership) => {
    if (!editPlan) return;
    const token = getToken("token");
    try {
      await axios.patch(process.env.NEXT_PUBLIC_BACKEND_URL + `/api/membership/${editPlan._id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(plans.map((p) => (p._id === editPlan._id ? { ...p, ...data } : p)));
      setEditPlan(null);
    } catch (error) {
      alert("Failed to update plan");
    }
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      plans.map((plan) => ({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        features: Array.isArray(plan.features) ? plan.features.join(", ") : plan.features,
        isActive: plan.isActive,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plans");
    XLSX.writeFile(workbook, "membership_plans.xlsx");
  };
  const handleDelete = async () => {
    if (!deletePlanId) return;
    const token = getToken("token");
    try {
      await axios.delete(process.env.NEXT_PUBLIC_BACKEND_URL + `/api/membership/${deletePlanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(plans.filter((plan) => plan._id !== deletePlanId));
      setDeletePlanId(null);
    } catch (error) {
      alert("Failed to delete plan");
    }
  };

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredPlans = useMemo(
    () => plans.filter((plan) => plan.name.toLowerCase().includes(debouncedSearch.toLowerCase())),
    [plans, debouncedSearch],
  );

  return (
    <div className="px-6 py-2">
      <Button onClick={handleExportToExcel} className="mb-4">
        Export to Excel
      </Button>
      <div className="overflow-x-auto hidden sm:block">
        <Table>
          <TableCaption>Available Gym Membership Plans</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Name</TableHead>
              <TableHead>Duration (Months)</TableHead>
              <TableHead>Price (₹)</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 6 }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-red-500">
                  {error}
                  <div className="mt-4">
                    <Button onClick={handleRetry} className="ml-4">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-gray-500">
                  No Membership found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPlans.map((plan) => (
                <TableRow key={plan._id}>
                  <TableCell>{plan.name}</TableCell>
                  <TableCell>{plan.duration}</TableCell>
                  <TableCell>₹{plan.price}</TableCell>
                  <TableCell>
                    <ul className="list-disc pl-5">
                      {plan.features[0].split(",").map((feature, index) => (
                        <li key={index}>{feature.trim()}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <Badge className={plan.isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button size="icon" variant="outline" onClick={() => handleEdit(plan)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => setDeletePlanId(plan._id)}>
                      <Trash className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      {editPlan && (
        <Dialog open={!!editPlan} onOpenChange={() => setEditPlan(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Membership Plan</DialogTitle>
              <DialogDescription>Update the details of the membership plan.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
              <Label>Name</Label>
              <Input {...register("name")} />

              <Label>Description</Label>
              <Textarea {...register("description")} />

              <Label>Price</Label>
              <Input type="number" {...register("price", { valueAsNumber: true })} />

              <Label>Duration (months)</Label>
              <Input type="number" {...register("duration", { valueAsNumber: true })} />

              <Label>Features (comma-separated)</Label>
              <Input {...register("features")} />

              <Controller
                control={control}
                name="isActive"
                render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
              />
              <Label>Active Membership</Label>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditPlan(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deletePlanId && (
        <Dialog open={!!deletePlanId} onOpenChange={() => setDeletePlanId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>Are you sure you want to delete this plan?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletePlanId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="sm:hidden space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4 border rounded-lg shadow-md">
              <Skeleton className="h-4 w-[150px] mb-2" />
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          ))
        ) : error ? (
          <div>
            <p className="text-center text-red-500">{error}</p>
            <div className="flex justify-center">
              <Button onClick={handleRetry} className="m-4">
                Retry
              </Button>
            </div>
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <div key={plan._id} className="p-4 border rounded-lg shadow-md space-y-2">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-sm text-gray-600">{plan.description}</p>
              <p>
                <strong>Price:</strong> ₹{plan.price}
              </p>
              <p>
                <strong>Duration:</strong> {plan.duration} months
              </p>
              <p>
                <strong>Features:</strong>
                <ul className="list-disc pl-5">
                  {Array.isArray(plan.features)
                    ? plan.features.map((feature, index) => <li key={index}>{feature}</li>)
                    : plan.features.split(",").map((feature, index) => <li key={index}>{feature}</li>)}
                </ul>
              </p>
              <Badge className={plan.isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"}>
                {plan.isActive ? "Active" : "Inactive"}
              </Badge>
              <div className="flex justify-between mt-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDeletePlanId(plan._id)}>
                  <Trash className="size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
