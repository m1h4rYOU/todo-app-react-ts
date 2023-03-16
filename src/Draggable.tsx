import {
  CSSProperties,
  ReactElement,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';

type Props<T> = {
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  mapper: (item: T, index: number) => ReactElement;
};

const DraggableList = <T,>({
  items,
  setItems,
  mapper,
}: Props<T>): ReactElement => {
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  const onDragEnter = (index: number) => () => {
    setTargetIndex(index);
  };

  const onDragEnd = (index: number) => () => {
    if (targetIndex === null) return;
    const newItems = [...items];
    const [activeItem] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, activeItem);
    setItems(newItems);
    setTargetIndex(null);
  };

  const liStyle = (index: number): CSSProperties => ({
    backgroundColor: index === targetIndex ? 'gray' : 'transparent',
    cursor: 'grab',
  });

  return (
    <ul>
      {items.map((item, index) => (
        <li
          key={index}
          draggable
          style={liStyle(index)}
          onDragEnter={onDragEnter(index)}
          onDragEnd={onDragEnd(index)}
        >
          {mapper(item, index)}
          <img src="/bars_24.png" height="16px" alt=" " draggable={false} />
        </li>
      ))}
    </ul>
  );
};

export default DraggableList;
