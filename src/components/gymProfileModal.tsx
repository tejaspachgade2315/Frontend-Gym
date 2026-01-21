import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component
import { getToken } from "@/lib/token";
import axios from "axios";
import { Facebook, Instagram, Twitter } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface SocialMedia {
  facebook: string;
  instagram: string;
  twitter: string;
}

interface OpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface Owner {
  isPaid: boolean;
  remainingAmount: number;
  _id: string;
  name: string;
  email: string;
  password: string;
  image: string;
  role: string;
  isActive: boolean;
  gender: string;
  age: number;
  height: number;
  weight: number;
  phone: string;
  address: string;
  startDate: string;
  package: string;
  activityCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface MembershipPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface GymProfile {
  socialMedia: SocialMedia;
  openingHours: OpeningHours;
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  owner: Owner;
  image: string[];
  membershipPlans: MembershipPlan[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface GymProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GymProfileModal: React.FC<GymProfileModalProps> = ({ isOpen, onClose }) => {
  const [gym, setGym] = useState<GymProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Track clicked image

  useEffect(() => {
    if (isOpen) {
      fetchGymProfile();
    }
  }, [isOpen]);

  const fetchGymProfile = async () => {
    try {
      setLoading(true);
      const token = getToken("token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gymprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        setGym(response.data[0]);
      } else {
        setGym(null);
      }
    } catch (error) {
      console.error("Failed to fetch gym profile:", error);
      setGym(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl bg-white">
          {loading ? (
            <div className="space-y-5">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="aspect-square rounded-xl hidden sm:block" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="size-8 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-gray-900">
                  {gym?.name}
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-gray-600">{gym?.address}</DialogDescription>
                <p className="text-xs sm:text-sm text-gray-500">Owner: {gym?.owner.name}</p>
              </DialogHeader>

              {/* Gym Images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {gym?.image.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className="group relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  >
                    <Image
                      src={img}
                      alt={`Gym Image ${index}`}
                      width={320}
                      height={320}
                      className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                  </button>
                ))}
              </div>

              {/* Contact Info */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{gym?.phone}</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 break-all">{gym?.email}</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-4 sm:col-span-2">
                  <p className="text-xs text-gray-500">Website</p>
                  <a
                    href={gym?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4"
                  >
                    {gym?.website || "Visit"}
                  </a>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="flex flex-wrap gap-3 mt-5">
                <a
                  href={gym?.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center size-10 rounded-full border border-gray-200 text-blue-600 hover:bg-blue-50 transition"
                >
                  <Facebook className="size-5" />
                </a>
                <a
                  href={gym?.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center size-10 rounded-full border border-gray-200 text-pink-600 hover:bg-pink-50 transition"
                >
                  <Instagram className="size-5" />
                </a>
                <a
                  href={gym?.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center size-10 rounded-full border border-gray-200 text-blue-500 hover:bg-blue-50 transition"
                >
                  <Twitter className="size-5" />
                </a>
              </div>

              {/* Opening Hours */}
              <div className="mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Opening Hours</h3>
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                  {Object.entries(gym?.openingHours || {}).map(([day, hours]) => (
                    <li
                      key={day}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                    >
                      <span className="capitalize text-gray-600">{day}</span>
                      <span className="font-medium text-gray-900">{hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-hide p-4 sm:p-6 rounded-2xl bg-white shadow-2xl">
          {selectedImage && (
            <div className="flex justify-center items-center">
              <Image
                src={selectedImage}
                alt="Selected Gym Image"
                width={800}
                height={600}
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GymProfileModal;
