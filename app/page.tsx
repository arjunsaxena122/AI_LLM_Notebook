"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [formData, setFormData] = useState<File>();

  // const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files) {
  //     const data = new FormData();
  //     console.log(e.target?.files[0]);
  //     setFormData(e.target.files[0]);
  //   }
  // };

  const handleUploadButton = async () => {
    const data = new FormData();
    data.append("file", JSON.stringify(formData));

    const res = await axios.post("/api/v1/upload", data);
    console.log(res);
  };

  return (
    <div className="flex justify-center items-center mx-auto h-screen">
      <Input
        type="file"
        onChange={(e) => setFormData(e.target.files?.[0])}
        // className="hidden"
      />
      <Button
        type="submit"
        className="cursor-pointer"
        onClick={handleUploadButton}
      >
        Upload File
      </Button>
    </div>
  );
}
