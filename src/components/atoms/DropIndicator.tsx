type DropIndicator = {
  beforeId: number;
};

const DropIndicator = ({ beforeId }: DropIndicator) => {
  return <div data-before={beforeId} className="h-0.5 w-full bg-lime-500 opacity-0" />;
};

export default DropIndicator;
