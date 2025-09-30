import React, { useState } from "react";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import axiosInstance from "libs/axios";

function Upload() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Select a file");
    const token = localStorage.getItem("access_token"); // 👈 get saved access token
    if (!token) {
      return alert("You must be logged in to upload");
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axiosInstance.post("/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      });

      alert("Uploaded successfully!");
      setFile(null);
      setProgress(0);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
        {progress > 0 && <p>Upload progress: {progress}%</p>}
      </div>
    </DashboardLayout>
  );
}

export default Upload;
