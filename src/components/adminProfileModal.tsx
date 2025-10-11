/* eslint-disable tailwindcss/enforces-shorthand */
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";
import { getToken } from "@/lib/token";
import { ClipLoader } from "react-spinners"; // You can use any loader component you prefer

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const dummyData = {
  name: "gaurav",
  email: "gaurav145@gmail.com",
  image: "https://res.cloudinary.com/dfmrdo2fq/image/upload/v1739799846/gym_erp/Screenshot%20%281108%29.png",
  role: "member",
  gender: "male",
  age: 18,
  height: 150,
  weight: 50,
  phone: "7070808090",
  address: "Wardha",
  startDate: "2025-02-17T00:00:00.000Z",
  endDate: "2025-06-17T00:00:00.000Z",
  activityCount: 1,
};

export default function AdminProfileModal({ isOpen, onClose }: AdminProfileModalProps) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [messagesLeft, setMessagesLeft] = useState(0);
  const [totalwalimit, setTotalwalimit] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
  };

  const fetchuserData = async () => {
    const token = getToken("token");
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data.userInfo);
      setMessagesLeft(response.data.messageLimit);
      setTotalwalimit(response.data.totalwalimit);
      setLoading(false);
    } catch (error) {
      console.log("error", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchuserData();
  }, []);

  const handleImageClick = (imageUrl: string) => {
    setZoomedImageUrl(imageUrl);
    setIsImageZoomed(true);
  };

  const handleZoomedImageClose = () => {
    setIsImageZoomed(false);
    setZoomedImageUrl(null);
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="flex justify-center items-center w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-6 sm:p-8 md:p-10 overflow-auto bg-white shadow-lg rounded-lg">
          <ClipLoader color="#4B7BEC" size={50} /> {/* You can replace this loader with any other loader you prefer */}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-6 sm:p-8 md:p-10 overflow-auto bg-white shadow-lg rounded-lg cursor-pointer">
          <div className="flex flex-col items-center space-y-4">
            <img
              src={userData?.image ? userData?.image : "https://github.com/shadcn.png"}
              alt="Admin Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 cursor-pointer"
              onClick={() => handleImageClick(userData?.image ? userData?.image : "https://github.com/shadcn.png")}
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
                <p>
                  <strong>Height:</strong> {userData?.height} cm
                </p>
                <p>
                  <strong>Weight:</strong> {userData?.weight} kg
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

            <div className="bg-gray-100 p-4 rounded-lg mt-6 w-full flex flex-col justify-center items-center">
              <h3 className="text-lg font-medium text-gray-700">Whatsapp Integration Limits</h3>
              <p>
                <strong>Messages left :</strong> {messagesLeft}/{totalwalimit}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isImageZoomed && (
        <Dialog open={isImageZoomed} onOpenChange={handleZoomedImageClose}>
          <DialogContent className="flex justify-center items-center w-full max-w-3xl p-4 rounded-lg bg-white shadow-lg">
            {zoomedImageUrl && (
              <img
                src={zoomedImageUrl}
                alt="Zoomed User Profile"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
