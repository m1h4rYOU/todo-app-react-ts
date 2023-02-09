import React, { useRef } from 'react';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";

export type Props = {
  dueDate:string
  setDueDate: React.Dispatch<React.SetStateAction<string>>
}

const AppFlatpickr = ({dueDate,setDueDate}:Props): React.ReactElement => {

  const fp = useRef<Flatpickr | null>(null)

  const onChangeDate = (_: Date[], dateStr: string)=>{
    setDueDate(dateStr)
  }
  return(
    <>
      <Flatpickr ref={fp} placeholder='締切' onChange={onChangeDate} value={dueDate}/>
        <button
          type="button"
          onClick={() => {
            if (!fp?.current?.flatpickr) return;
            fp.current.flatpickr.clear();
          }}
        >
          締切削除
        </button>
    </>
  )
}

export default AppFlatpickr;
