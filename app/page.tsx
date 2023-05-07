"use client";
import { ChakraProvider, Box, Button, VStack, Text } from "@chakra-ui/react";
import { useState, useRef } from "react";
import styled from "styled-components";
import Stars from "@/components/Stars";
import Title from "../components/Title";
import { FileInput } from "@/components/FileInput";
import NormalButton from "@/components/NormalButton";

const BACKGROUNDS = ["#050713", "#431033"];

import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";

const Container = styled.div<{ bg: string }>`
  width: 100vw;
  height: 100vh;
  background: radial-gradient(
      63.94% 63.94% at 50% 0%,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0) 100%
    ),
    ${(p) => p.bg};
  transition: 3s all;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
`;

const FileUpload = ({ file, setFile, id }: any) => {
  const [fileName, setFileName] = useState<string>("");

  return (
    <div className="m-1">
      {fileName ? (
        <div className="w-full flex flex-row justify-around items-center m-4">
          <p className="text-center text-xs text-white">File: {fileName}</p>
          <FileInput
            name={id}
            accept=".png, .jpg, .jpeg"
            id={id}
            onChange={(file) => {
              setFile(file);
              setFileName(file?.[0].name || "");
            }}
            className="ml-2 mr-4"
          >
            <Button onClick={() => document.getElementById(id)?.click()}>
              Re-Upload
            </Button>
          </FileInput>
        </div>
      ) : (
        <FileInput
          name={id}
          accept=".png, .jpg, .jpeg"
          id={id}
          onChange={(file) => {
            setFile(file);
            setFileName(file?.[0].name || "");
          }}
          className="ml-2"
        >
          <Button onClick={() => document.getElementById(id)?.click()} m={4}>
            Upload {id} picture
          </Button>
        </FileInput>
      )}
    </div>
  );
};

export default function Home() {
  const [bg, setBg] = useState(0);
  const [file1, setFile1] = useState<FileList | null>(null);
  const [file2, setFile2] = useState<FileList | null>(null);

  const [weights, setWeights] = useState(0.5);

  setTimeout(() => {
    const newBg = bg < BACKGROUNDS.length - 1 ? bg + 1 : 0;
    setBg(newBg);
  }, 3000);

  const handleFuseImages = async () => {
    if (file1 && file2) {
      const formData = new FormData();
      formData.append("image1", file1[0]);
      formData.append("image2", file2[0]);
      formData.append("weights", `${weights},${1 - weights}`);

      console.log("FORMDATA, ", formData);
      
      const response = await fetch(
        "https://mcantillon21--image-fusion-fastapi-app-dev.modal.run/image-fuse",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      console.log(result);
    } else {
      alert("Please upload both images.");
    }
  };

  return (
    <ChakraProvider>
      <Container bg={BACKGROUNDS[bg]}>
        <Stars />
        <Title />
        <FileUploadContainer className="m-10">
          <div
            className="first-line:relative rounded-lg backdrop-filter backdrop-blur-md"
            style={{
              background:
                "radial-gradient(63.94% 63.94% at 50% 0%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%), rgba(255, 255, 255, 0.01)",
              borderRadius: "10px",
            }}
          >
            <FileUpload file={file1} setFile={setFile1} id="1st" />
          </div>
          <div
            className="first-line:relative rounded-lg backdrop-filter backdrop-blur-md"
            style={{
              background:
                "radial-gradient(63.94% 63.94% at 50% 0%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%), rgba(255, 255, 255, 0.01)",
              borderRadius: "10px",
            }}
          >
            <FileUpload file={file2} setFile={setFile2} id="2nd" />
          </div>
        </FileUploadContainer>
        <Text textAlign="center" color="white">
          {Math.round(weights * 100)}% / {Math.round((1 - weights) * 100)}%
        </Text>
        <Slider
          defaultValue={0.5}
          min={0}
          max={1}
          step={0.005}
          marginBottom="20px"
          colorScheme={"white"}
          width="20%"
          value={weights}
          onChange={(val) => setWeights(val)}
          aria-label="Weights slider"
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <VStack>
          <NormalButton
            style={{ height: "40px", width: "100px", fontSize: "18px" }}
            onClick={handleFuseImages}
          >
            Fuse
          </NormalButton>
        </VStack>
      </Container>
    </ChakraProvider>
  );
}
