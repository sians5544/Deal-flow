import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useState } from "react";
const DealImages = ({
  thumbnail,
  images,
}: {
  thumbnail: string;
  images: string[];
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="w-1/2 flex flex-col">
      <div className="relative flex-1 min-h-0 mb-3">
        <Image
          fill
          src={images[currentIndex] || thumbnail}
          alt="Deal Image"
          className="rounded-lg object-cover"
        />
      </div>

      <div className="relative">
        <Carousel setApi={setApi}>
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index} className="basis-1/3">
                <Image
                  src={image}
                  alt={`Deal Image ${index + 1}`}
                  width={104}
                  height={78}
                  className="rounded-lg object-cover w-full h-[78px] cursor-pointer"
                  onClick={() => setCurrentIndex(index)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <button
          onClick={() => {
            api?.scrollPrev();
            setCurrentIndex((prev) => Math.max(0, prev - 1));
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 hover:bg-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <button
          onClick={() => {
            api?.scrollNext();
            setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 hover:bg-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DealImages;
