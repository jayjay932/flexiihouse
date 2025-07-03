'use client';

import { SafeListing, SafeUser } from '@/app/types';
import Heading from '@/app/components/Heading';
import Calendar from '@/app/components/inputs/Calendar';
import { Range } from 'react-date-range';
import Button from '@/app/components/Button';

interface Props {
  listing: SafeListing;
  currentUser: SafeUser | null;
  dateRange: Range;
  totalPrice: number;
  onChangeDate: (value: Range) => void;
  onNext: () => void;
}

const CheckoutStep1: React.FC<Props> = ({
  listing,
  dateRange,
  totalPrice,
  onChangeDate,
  onNext
}) => {
  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-20">
      <Heading title="Sélectionnez vos dates" subtitle={`Prix par nuit : ${listing.price} XAF`} />
      <Calendar value={dateRange} onChange={(value) => onChangeDate(value.selection)} />
      <div className="flex justify-between items-center mt-6">
        <div className="text-xl font-semibold">Total : {totalPrice} XAF</div>
        <Button label="Suivant" onClick={onNext} />
      </div>
    </div>
  );
};

export default CheckoutStep1;
