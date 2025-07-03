'use client';

import { useRouter } from "next/navigation";
import { Range } from "react-date-range";

import Button from "../Button";
import Calendar from "../inputs/Calendar";

interface ListingReservationProps {
  price: number;
  dateRange: Range;
  totalPrice: number;
  onChangeDate: (value: Range) => void;
  onSubmit: () => void;
  disabled?: boolean;
  disabledDates: Date[];
  listingId: string;
}

const ListingReservation: React.FC<ListingReservationProps> = ({
  price,
  listingId,
  dateRange,
  totalPrice,
  onChangeDate,
  onSubmit,
  disabled,
  disabledDates
}) => {
  const router = useRouter(); // ✅ ICI

  return (
    <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden">
      <div className="flex flex-row items-center gap-1 p-4">
        <div className="text-2xl font-semibold">
          XAF {price}
        </div>
        <div className="font-light text-neutral-600">/ Nuit</div>
      </div>
      <hr />
      <Calendar
        value={dateRange}
        disabledDates={disabledDates}
        onChange={(value) => onChangeDate(value.selection)}
      />
      <hr />
      <div className="p-4">
        <Button
          disabled={disabled}
          label="Reserve"
       onClick={() =>
  router.push(`/checkout/${listingId}?startDate=${dateRange.startDate?.toISOString()}&endDate=${dateRange.endDate?.toISOString()}`)
}

        />
      </div>
      <hr />
      <div className="p-4 flex flex-row items-center justify-between font-semibold text-lg">
        <div>Total</div>
        <div>$ {totalPrice}</div>
      </div>
    </div>
  );
};

export default ListingReservation;
