'use client';

import {
  DateRange,
  Range,
  RangeKeyDict
} from 'react-date-range';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface DatePickerProps {
  value: Range;
  onChange: (value: RangeKeyDict) => void;
  disabledDates?: Date[];
  showPreview?: boolean; // ✅ Ajout de la prop
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  disabledDates,
  
  showPreview = true // ✅ Par défaut activé
}) => {
  return (
    <DateRange
      rangeColors={['#262626']}
      ranges={[value]}
      date={new Date()}
      onChange={onChange}
      direction="vertical"
      showDateDisplay={false}
      showPreview={showPreview} // ✅ Utilisation dynamique
      minDate={new Date()}
      disabledDates={disabledDates}
    />
  );
};

export default DatePicker;
