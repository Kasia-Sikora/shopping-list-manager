const MenuButton = () => {
  return (
    <button className="absolute bottom-1.5 right-1.5 rounded-full size-7" onClick={() => console.log('open menu')}>
      <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-accent size-6" />
      <div className="size-7 absolute bottom-0 border-3 bg-white/40 transition-all duration-200 hover:bg-white/75 border-mist-700 rounded-full">
        <div className='size-7 absolute text-mist-800 bottom-0 after:content-["\2807"] rounded-full after:text-2xl' />
      </div>
    </button>
  );
};

export default MenuButton;
