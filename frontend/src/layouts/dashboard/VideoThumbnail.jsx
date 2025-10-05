import React, { useEffect, useState } from "react";
import { Avatar } from "@mui/material";

// function VideoThumbnail({ videoFile, onClick }) {
//   const [thumbnail, setThumbnail] = useState("");

//   useEffect(() => {
//     if (!videoFile) return;

//     const fileReader = new FileReader();

//     fileReader.onload = function () {
//       const blob = new Blob([fileReader.result], { type: videoFile.type });
//       const url = URL.createObjectURL(blob);
//       const video = document.createElement("video");
//       video.src = url;
//       video.muted = true;
//       video.preload = "metadata";

//       const captureFrame = () => {
//         const canvas = document.createElement("canvas");
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//         const imageData = canvas.toDataURL("image/png");
//         setThumbnail(imageData);
//         URL.revokeObjectURL(url);
//       };

//       video.addEventListener("loadeddata", captureFrame);
//     };

//     fileReader.readAsArrayBuffer(videoFile);
//   }, [videoFile]);

//   return (
//     <Avatar
//       variant="rounded"
//       src={thumbnail || "https://via.placeholder.com/80x60.png?text=Video"}
//       onClick={onClick}
//       sx={{ cursor: "pointer" }}
//     />
//   );
// }

export default VideoThumbnail;
