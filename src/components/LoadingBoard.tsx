import { useMemo } from "react";
import { LOADING_CARDS } from "../consts";

function getRandomArbitrary() {
  const min = 1;
  const max = 3;
  return Math.round(Math.random() * (max - min) + min) * 10;
}

const LoadingBoard = () => {
  return (
    <div className={` bg-board p-3 lg:p-7 rounded-2xl w-full columns-1 sm:columns-2 lg:columns-3 xl:columns-4 xxl:columns-5 my-5 lg:my-10 gap-4`}>
      {LOADING_CARDS?.map((list) => (
        <LoadingCard key={`loading-card-${list.id}`} itemsQuantity={list.items} />)
      )}
    </div>
  )
}

export default LoadingBoard

const LoadingCard = ({ itemsQuantity }: { itemsQuantity: number }) => {
  const titleWidth = useMemo(() => getRandomArbitrary(), [])
  const arrOfItemsWidth = useMemo(() => Array.from({ length: itemsQuantity }, () => getRandomArbitrary()), [itemsQuantity])
  return (
    <div
      className={`w-full lg:w-75 border border-border shadow-card flex flex-col align-baseline gap-5 rounded-2xl p-4 relative bg-card pb-4 max-w-3xl mb-4 break-inside-avoid`}
      data-testid={'loading-card'}
    >
      <div className={`h-6 lg:h-7 bg-loading-items animate-pulse rounded`} style={{width: `calc(100% - ${titleWidth}%)`}} data-testid={'loading-card-title'}/>
      <div className="flex flex-col gap-3">
        {arrOfItemsWidth.map((width, idx) => (
          <div className="flex gap-4 w-full items-center py-2" key={`loading-item-${idx}-with-width-${width}`}>
            <div className="size-6 rounded bg-loading-items animate-pulse" />
            <div className={`h-4 bg-loading-items rounded animate-pulse`} style={{width: `calc(100% - ${width}%)`}} data-testid={'loading-card-item'}/>
          </div>
        ))}
      </div>
    </div>
  )
}