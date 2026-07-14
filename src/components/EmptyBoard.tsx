import BasketIcon from '../assets/basket.svg?react';
import ArrowUp from '../assets/arrowUp.svg?react'
import { DEFAULT_VALUES, useStore } from '../stores/store';
import { dbActions } from '../utils/storeUtils';
import { generateId } from '../utils/utils';
import { setMetadata } from '../services/indexedDB';

const EmptyBoard = () => {

  const handleLoadData = async () => {
    const listOrder = []
    for (const data of DEFAULT_VALUES) {
      const dataWithFreshId = { ...data, id: generateId(), content: data.content.map(item => ({ ...item, id: generateId() })) }
      useStore.getState().addList(dataWithFreshId)
      try {
        await dbActions({ action: "create", data: dataWithFreshId })
        listOrder.push(dataWithFreshId.id)
      } catch (error) {
        console.error('Failed to save list:', error);
      }
    }
    await setMetadata('listOrder', listOrder)
  }

  return (
    <div className={`flex bg-board p-3 lg:p-7 font-bold rounded-2xl w-full my-5 lg:my-10 justify-center`}>
      <div className='flex flex-col justify-center items-center my-15 gap-4'>
        <div className='bg-card/50 rounded-full size-30 flex items-center justify-center '>
          <BasketIcon className='size-20 text-primary/20' />
        </div>
        <h2 className='text-xl'>Nie masz jeszcze żadnych list</h2>
        <p className='flex text-primary/50 gap-2'> <ArrowUp />Utwórz swoją pierwszą listę powyżej</p>
        <button onClick={handleLoadData} className='text-accent hover:text-active rounded-full border-border border px-4 py-2 cursor-pointer'>Załaduj przykładowe dane</button>
      </div>
    </div>
  )
}

export default EmptyBoard;