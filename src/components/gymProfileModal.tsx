import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Facebook, Instagram, Twitter, X } from "lucide-react";
import { getToken } from "@/lib/token";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component

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
        <DialogContent className="max-w-lg md:max-w-2xl p-6 rounded-lg shadow-lg bg-white">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <div className="flex gap-4 overflow-x-auto py-2">
                <Skeleton className="size-24 rounded-lg" />
                <Skeleton className="size-24 rounded-lg" />
                <Skeleton className="size-24 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <div className="flex gap-4 mt-4">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="size-6 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/2 mt-6" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900">{gym?.name}</DialogTitle>
                <DialogDescription className="text-gray-600">{gym?.address}</DialogDescription>
                <p className="text-sm text-gray-500">Owner: {gym?.owner.name}</p>
              </DialogHeader>

              {/* Gym Images */}
              <div className="flex gap-4 overflow-x-auto py-2">
                {gym?.image.map((img, index) => (
                  <button key={index} onClick={() => setSelectedImage(img)} className="focus:outline-none">
                    <Image
                      src={img}
                      alt={`Gym Image ${index}`}
                      width={120}
                      height={120}
                      className="rounded-lg shadow-md object-cover cursor-pointer hover:scale-105 transition"
                    />
                  </button>
                ))}
              </div>

              {/* Contact Info */}
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <strong>Phone:</strong> {gym?.phone}
                </p>
                <p>
                  <strong>Email:</strong> {gym?.email}
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  <a href={gym?.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    Visit
                  </a>
                </p>
              </div>

              {/* Social Media Links */}
              <div className="flex gap-4 mt-4">
                <a href={gym?.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                  <Facebook className="text-blue-600 size-6" />
                </a>
                <a href={gym?.socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="text-pink-600 size-6" />
                </a>
                <a href={gym?.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="text-blue-400 size-6" />
                </a>
              </div>

              {/* Opening Hours */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold">Opening Hours</h3>
                <ul className="text-sm text-gray-700 grid grid-cols-2 gap-1">
                  {Object.entries(gym?.openingHours || {}).map(([day, hours]) => (
                    <li key={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}: {hours}
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
        <DialogContent className="w-full max-w-3xl p-4 rounded-lg bg-white shadow-lg">
          {selectedImage && (
            <div className="flex justify-center items-center">
              <Image
                src={selectedImage}
                alt="Selected Gym Image"
                width={800}
                height={600}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GymProfileModal;
