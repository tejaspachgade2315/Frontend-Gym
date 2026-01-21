/* eslint-disable tailwindcss/enforces-shorthand */
/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getToken } from "@/lib/token";
import { formatToDDMMYYYY } from "@/utils/helper";
import { FALLBACK_IMAGE, getSafeImageUrl } from "@/utils/image";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
import EditEquipment from "./editEquiment";

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>Are you sure you want to delete this equipment?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const GymEquipmentCard = ({ equipment, onDelete, onEditOpen }) => {
  const [imgSrc, setImgSrc] = useState<string>(getSafeImageUrl(equipment?.image));

  useEffect(() => {
    setImgSrc(getSafeImageUrl(equipment?.image));
  }, [equipment?.image]);

  return (
    <Card className="w-full max-w-sm shadow-lg rounded-2xl border border-gray-200 overflow-hidden transition hover:shadow-xl">
      <div className="relative w-full h-48 bg-gray-100">
        <img
          src={imgSrc}
          alt={equipment.name}
          className="w-full h-full object-cover"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold text-gray-900">{equipment.name}</CardTitle>
        <p className="text-sm text-gray-500">{equipment.description || "No description available"}</p>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="text-sm text-gray-700">
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                equipment.status === "Available" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }`}
            >
              {equipment.status}
            </span>
          </p>
          <p>
            <span className="font-medium">Quantity:</span> {equipment.quantity}
          </p>
          <p>
            <span className="font-medium">Last Maintenance:</span> {formatToDDMMYYYY(equipment.lastMaintenanceDate)}
          </p>
          <p>
            <span className="font-medium">Next Maintenance:</span> {formatToDDMMYYYY(equipment.nextMaintenanceDate)}
          </p>
        </div>
        <div className="flex justify-between items-center mt-2">
          <Button variant="outline" size="icon" onClick={() => onEditOpen(equipment._id)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => onDelete(equipment._id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const GymEquipmentSkeleton = () => (
  <Card className="w-full max-w-sm shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
    <div className="w-full h-48 bg-gray-100">
      <Skeleton height={192} />
    </div>
    <CardHeader className="p-4">
      <Skeleton height={20} width="60%" />
      <Skeleton height={15} width="80%" />
    </CardHeader>
    <CardContent className="p-4 space-y-3">
      <Skeleton height={15} width="50%" />
      <Skeleton height={15} width="30%" />
      <Skeleton height={15} width="60%" />
      <div className="flex justify-between mt-2">
        <Skeleton circle width={36} height={36} />
        <Skeleton circle width={36} height={36} />
      </div>
    </CardContent>
  </Card>
);

export default function EquipmentList({ searchQuery }) {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  // Fetch equipment from the API
  const fetchEquipment = async () => {
    setIsLoading(true);
    setError(null); // Clear any previous errors
    const token = getToken("token");
    if (!token) {
      setError("Unauthorized: No token found");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEquipment(response.data);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch equipment");
    } finally {
      setIsLoading(false);
    }
  };

  // Retry fetching equipment
  const handleRetry = () => {
    setError(null); // Clear the error state
    setIsLoading(true); // Set loading state to true
    fetchEquipment(); // Retry fetching the equipment
  };

  // Delete equipment
  const deleteEquipment = async () => {
    if (!deleteId) return;
    const token = getToken("token");
    if (!token) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEquipment(equipment.filter((item: any) => item._id !== deleteId));
      setIsModalOpen(false);
      setDeleteId(null);
    } catch (error) {
      console.log(error);
      setError("Failed to delete equipment");
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchEquipment();
  }, []);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredequimwnt = useMemo(
    () => equipment.filter((equipment: any) => equipment?.name.toLowerCase().includes(debouncedSearch.toLowerCase())),
    [equipment, debouncedSearch],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
      {isLoading ? (
        [...Array(6)].map((_, index) => <GymEquipmentSkeleton key={index} />)
      ) : error ? (
        <div className="col-span-full text-center">
          <p className="text-red-500">{error}</p>
          {/* Retry Button */}
          <Button onClick={handleRetry} className="mt-2">
            Retry
          </Button>
        </div>
      ) : filteredequimwnt.length === 0 ? (
        <p className="text-gray-500">No equipment found.</p>
      ) : (
        filteredequimwnt.map((item: any) => (
          <GymEquipmentCard
            key={item._id}
            equipment={item}
            onDelete={(id) => {
              setDeleteId(id);
              setIsModalOpen(true);
            }}
            onEditOpen={(id) => {
              setEditId(id);
              setIsEditOpen(true);
            }}
          />
        ))
      )}

      <ConfirmDeleteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={deleteEquipment} />
      <EditEquipment isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} id={editId} />
    </div>
  );
}
