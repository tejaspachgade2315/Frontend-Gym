import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import axios from "axios";
import { getToken } from "@/lib/token";
import { ClipLoader } from "react-spinners"; // You can use any loader component you prefer

// Define the interface for the user data
interface UserData {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  isActive: boolean;
  gender: string;
  age: number;
  phone: string;
  address: string;
  hireDate: string;
  salary: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function StaffProfileModal({ isOpen, onClose, userId }: StaffProfileModalProps) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleClose = () => {
    onClose();
  };

  const fetchUserData = async () => {
    const token = getToken("token");
    if (!token) {
      return;
    }
    setLoading(true); // Start loading
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/staff/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data); // Update user data with response
      setLoading(false); // Stop loading
    } catch (error) {
      console.log("Error", error);
      setLoading(false); // Stop loading in case of error
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="flex justify-center items-center w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-6 sm:p-8 md:p-10 overflow-auto bg-white shadow-lg rounded-lg">
          <ClipLoader color="#4B7BEC" size={50} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-6 sm:p-8 md:p-10 overflow-auto bg-white shadow-lg rounded-lg">
        <div className="flex flex-col items-center space-y-4">
          <img
            src={userData?.image}
            alt={userData?.name}
            className="size-32 rounded-full object-cover border-4 border-indigo-500"
          />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">{userData?.name}</h2>
            <p className="text-gray-500">{userData?.role}</p>
            <p className="text-sm text-gray-400">{userData?.email}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700">Personal Info</h3>
              <p>
                <strong>Gender:</strong> {userData?.gender}
              </p>
              <p>
                <strong>Age:</strong> {userData?.age}
              </p>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700">Contact Info</h3>
              <p>
                <strong>Phone:</strong> {userData?.phone}
              </p>
              <p>
                <strong>Address:</strong> {userData?.address}
              </p>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mt-6 w-full">
            <h3 className="text-lg font-medium text-gray-700">Staff Details</h3>
            <p>
              <strong>Hire Date:</strong> {new Date(userData?.hireDate ?? "").toLocaleDateString()}
            </p>
            <p>
              <strong>Salary:</strong> Rs. {userData?.salary}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
