"use client";
import { useMemo, useState } from "react";
import { SlotItemMapArray, utils } from "swapy";
import { DragHandle, SwapyItem, SwapyLayout, SwapySlot } from "@/components/ui/swapy";
import { LogIn, UploadCloud, Server, Scan, FileText, CalendarCheck } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

type Item = {
  id: string;
  icon: any;
  title: string;
  description: string;
  number: string;
  bgColor: string;
  iconBgColor: string;
  className?: string;
};

const initialItems: Item[] = [
  {
    id: "1",
    icon: LogIn,
    title: "Authenticate Securely",
    description: "Users land on MediMind, sign in, and receive JWT-backed access so every action is tied to a verified identity.",
    number: "01",
    bgColor: "bg-blue-400",
    iconBgColor: "bg-blue-100",
    className: "lg:col-span-4 sm:col-span-7 col-span-12",
  },
  {
    id: "2",
    icon: UploadCloud,
    title: "Upload Prescription",
    description: "Images are optionally compressed on-device, then sent through the /upload-prescription endpoint with processing status updates.",
    number: "02",
    bgColor: "bg-pink-300",
    iconBgColor: "bg-pink-100",
    className: "lg:col-span-3 sm:col-span-5 col-span-12",
  },
  {
    id: "3",
    icon: Server,
    title: "Gateway Intake",
    description: "FastAPI receives the file, user metadata, and timestamps, staging each asset in temporary storage ready for downstream services.",
    number: "03",
    bgColor: "bg-green-400",
    iconBgColor: "bg-green-100",
    className: "lg:col-span-5 sm:col-span-5 col-span-12",
  },
  {
    id: "4",
    icon: Scan,
    title: "OCR Extraction",
    description: "An EasyOCR service cleans and interprets handwritten notes into dosage lines, normalizing text and fixing common recognition errors.",
    number: "04",
    bgColor: "bg-yellow-300",
    iconBgColor: "bg-yellow-100",
    className: "lg:col-span-5 sm:col-span-7 col-span-12",
  },
  {
    id: "5",
    icon: FileText,
    title: "Structured Understanding",
    description: "Language reasoning services convert raw text into validated JSON for medicines, dosing cadence, timings, and durations via Pydantic models.",
    number: "05",
    bgColor: "bg-purple-300",
    iconBgColor: "bg-purple-100",
    className: "lg:col-span-4 sm:col-span-6 col-span-12",
  },
  {
    id: "6",
    icon: CalendarCheck,
    title: "Reminders & History",
    description: "Schedules populate MongoDB alongside the source image, enabling automated notifications, PDF exports, edits, and longitudinal insights.",
    number: "06",
    bgColor: "bg-cyan-300",
    iconBgColor: "bg-cyan-100",
    className: "lg:col-span-3 sm:col-span-6 col-span-12",
  },
];

const HowItWorks = () => {
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(
    utils.initSlotItemMap(initialItems, "id")
  );

  const slottedItems = useMemo(
    () => utils.toSlottedItems(initialItems, "id", slotItemMap),
    [slotItemMap]
  );

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up" className="mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow the journey from upload to actionable medication support in six orchestrated stages. Drag and rearrange the cards!
            </p>
          </div>
        </ScrollReveal>

        <SwapyLayout
          id="swapy"
          className="w-full max-w-7xl mx-auto"
          config={{
            swapMode: "hover",
          }}
          onSwap={(event: { newSlotItemMap: { asArray: any } }) => {
            console.log("Swap detected!", event.newSlotItemMap.asArray);
            setSlotItemMap(event.newSlotItemMap.asArray);
          }}
        >
          <div className="grid w-full grid-cols-12 gap-2 md:gap-4 py-4">
            {slottedItems.map(({ itemId }) => {
              const item = initialItems.find((i) => i.id === itemId);
              const Icon = item?.icon;

              return (
                <SwapySlot
                  key={itemId}
                  className={`swapyItem rounded-lg h-64 ${item?.className}`}
                  id={itemId}
                >
                  <SwapyItem
                    id={itemId}
                    className={`relative rounded-lg w-full h-full flex flex-col justify-center items-center gap-3 p-6 ${item?.bgColor} shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <DragHandle />

                    {/* Step Number */}
                    <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center text-black font-bold text-lg shadow-md z-10">
                      {item?.number}
                    </div>

                    {/* Icon */}
                    {Icon && (
                      <div className={`inline-flex items-center justify-center w-14 h-14 ${item?.iconBgColor} rounded-full`}>
                        <Icon className="w-7 h-7 text-gray-800" />
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-xl font-bold text-black text-center">
                      {item?.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-800 text-center leading-relaxed line-clamp-4">
                      {item?.description}
                    </p>
                  </SwapyItem>
                </SwapySlot>
              );
            })}
          </div>
        </SwapyLayout>
      </div>
    </section>
  );
};

export default HowItWorks;
