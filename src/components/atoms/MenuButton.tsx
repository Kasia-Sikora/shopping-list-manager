import menu from '../../assets/icons8-dots-30.png'

const MenuButton = () => {
  return (
    <button className='absolute bottom-1.5 right-1.5 rounded-full bg-transparent hover:bg-white/75  size-7' onClick={() => console.log('open menu')}>
      <div className='absolute -bottom-0.5 -right-0.5 rounded-full bg-accent size-6' />
      <img src={menu} alt="menu button" className='size-7 absolute bottom-0 right-0 border-3 hover:bg-white/75 border-mist-700 rounded-full' />
    </button>
  )
}

export default MenuButton;