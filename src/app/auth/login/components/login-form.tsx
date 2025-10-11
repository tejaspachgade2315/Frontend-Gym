"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { setToken } from "@/lib/token";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "", password: "" },
  });

  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, data);

      if (response.status !== 200) {
        throw new Error("Unexpected server response");
      }

      const token = response.data?.token;
      if (!token) {
        throw new Error("Token not received");
      }

      setToken(token, "token");
      console.log("token saved");
      toast({
        title: "Login successful",
        description: "You have logged in successfully",
      });

      router.push("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;

        if (axiosError.response?.status === 400) {
          toast({
            title: "Login failed",
            description: "Invalid email or password",
          });
        } else if (axiosError.response?.status === 500) {
          toast({
            title: "Server error",
            description: "Something went wrong on our end. Please try again later.",
          });
        } else {
          toast({
            title: "Network error",
            description: "Please check your internet connection and try again.",
          });
        }
      } else {
        toast({
          title: "Unexpected error",
          description: "An unexpected error occurred. Please try again.",
        });
      }
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="Password" {...field} />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
        <Button disabled={isLoading} className="w-full">
          {isLoading ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : "Login"}
        </Button>
      </form>
    </Form>
  );
}
