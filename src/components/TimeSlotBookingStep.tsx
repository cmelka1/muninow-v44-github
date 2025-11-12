import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TimeSlotBooking } from "./TimeSlotBooking";

interface TimeSlotBookingStepProps {
  tile: any;
  selectedDate: Date | undefined;
  selectedTime: string | null;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string | null) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const TimeSlotBookingStep = ({
  tile,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  onPrevious,
  onNext,
}: TimeSlotBookingStepProps) => {
  return (
    <>
      <TimeSlotBooking
        tile={tile}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onDateSelect={onDateSelect}
        onTimeSelect={onTimeSelect}
      />
      
      <div className="flex justify-between pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button 
          type="button"
          onClick={onNext}
          disabled={!selectedDate || !selectedTime}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};
