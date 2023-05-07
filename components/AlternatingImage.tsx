import React, { useState } from "react";
import { useInterval } from "usehooks-ts";

function AlternatingImage() {
  const [imageIndex, setImageIndex] = useState(0);

  const images = ["stanford_valentines.png", "stanford.png"];

  useInterval(() => {
    setImageIndex((imageIndex + 1) % images.length);
  }, 1000);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      style={{ width: "200px" }}
      src={images[imageIndex]}
      alt="Stanford University"
    />
  );
}

export default AlternatingImage;
