import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// import InboxIcon from '@mui/icons-material/MoveToInbox';
// import MailIcon from '@mui/icons-material/Mail';
import { IoCloseSharp } from "react-icons/io5";
import { FaRegSquarePlus } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import { FiMinusSquare } from "react-icons/fi";

const Category = (props) => {

    const [submenuIndex, setSubmenuIndex] = useState(null);
    const [innerSubmenuIndex, setInnerSubmenuIndex] = useState(null);

    const openSubmenu = (index) => {
        if (submenuIndex === index) {
            setSubmenuIndex(null);
        } else {
            setSubmenuIndex(index);
        }
    }
    const openInnerSubmenu = (index) => {
        if (innerSubmenuIndex === index) {
            setInnerSubmenuIndex(null);
        } else {
            setInnerSubmenuIndex(index);
        }
    }

    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation" className='categoryPanel' >

            <h3 className='p-3 text-[16px] font-[500] flex items-center justify-between'>
                Explore Our Collection <IoCloseSharp onClick={() => props.Categories(false)}
                    className='cursor-pointer text-[20px]' /></h3>
            <Divider />

            <div className='scroll'>
                <ul className='w-full'>
                    <li className='list-none flex items-center relative flex-col'>
                        <Link to='/' className='w-full '>
                            <Button className='w-full !text-left !justify-start !px-3 !text-[rgba(0,0,0,0.8)]'>
                                Fashion
                            </Button>
                        </Link>

                        {  submenuIndex === 0 ? (
                                <FiMinusSquare
                                    className='absolute top-[10px] right-[15px] cursor-pointer'
                                    onClick={() => openSubmenu(0)} />

                            ) : (
                                <FaRegSquarePlus
                                    className='absolute top-[10px] right-[15px] cursor-pointer'
                                    onClick={() => openSubmenu(0)} />
                            )}

                        {  submenuIndex === 0 && (
                                <ul className='submenu w-full pl-3 '>
                                    <li className='list-none relative flex-col'>
                                        <Link to='/'>
                                            <Button className='w-full !text-left !justify-start !px-3 !text-[rgba(0,0,0,0.8)]'>
                                                Apparel
                                            </Button>
                                        </Link>
                                        {
                                            innerSubmenuIndex === 0 ? (
                                                <FiMinusSquare
                                                    className='absolute top-[10px] right-[15px] cursor-pointer'
                                                    onClick={() => openInnerSubmenu(0)} />

                                            ) : (
                                                <FaRegSquarePlus
                                                    className='absolute top-[10px] right-[15px] cursor-pointer'
                                                    onClick={() => openInnerSubmenu(0)} />
                                            )}


                                        {
                                            innerSubmenuIndex === 0 && (
                                                <ul className='submenu w-full pl-3 '>
                                                    <li className='list-none relative mb-1'>
                                                        <Link to='/' className=' link w-full !text-left !justify-start !px-3 
                                        transition text-[13px]'>
                                                            Smart Tablet
                                                        </Link>
                                                    </li>
                                                    <li className='list-none relative mb-1'>
                                                        <Link to='/' className=' link w-full !text-left !justify-start !px-3 
                                        transition text-[13px]'>
                                                            Crepe T-Shirt
                                                        </Link>
                                                    </li>
                                                    <li className='list-none relative mb-1'>
                                                        <Link to='/' className=' link w-full !text-left !justify-start !px-3 
                                        transition text-[13px]'>
                                                            Leather Watch
                                                        </Link>
                                                    </li>
                                                    <li className='list-none relative mb-1'>
                                                        <Link to='/' className=' link w-full !text-left !justify-start !px-3
                                         transition text-[13px]'>
                                                            Rolling Diamond
                                                        </Link>
                                                    </li>
                                                </ul>

                                            )
                                        }

                                    </li>
                                </ul>

                            )}

                    </li>
                     <li className='list-none flex items-center relative flex-col'>
                        <Link to='/' className='w-full '>
                            <Button className='w-full !text-left !justify-start !px-3 !text-[rgba(0,0,0,0.8)]'>
                                Jewellery
                            </Button>
                        </Link>

                    </li>
                     <li className='list-none flex items-center relative flex-col'>
                        <Link to='/' className='w-full '>
                            <Button className='w-full !text-left !justify-start !px-3 !text-[rgba(0,0,0,0.8)]'>
                                Fashion
                            </Button>
                        </Link>

                        {  submenuIndex === 1 ? (
                                <FiMinusSquare
                                    className='absolute top-[10px] right-[15px] cursor-pointer'
                                    onClick={() => openSubmenu(1)} />

                            ) : (
                                <FaRegSquarePlus
                                    className='absolute top-[10px] right-[15px] cursor-pointer'
                                    onClick={() => openSubmenu(1)} />
                            )}

                        {  submenuIndex === 1 && (
                                <ul className='submenu w-full pl-3 '>
                                    <li className='list-none relative flex-col'>
                                        <Link to='/'>
                                            <Button className='w-full !text-left !justify-start !px-3 !text-[rgba(0,0,0,0.8)]'>
                                                Apparel
                                            </Button>
                                        </Link>
                                        {
                                            innerSubmenuIndex === 1 ? (
                                                <FiMinusSquare
                                                    className='absolute top-[10px] right-[15px] cursor-pointer'
                                                    onClick={() => openInnerSubmenu(1)} />

                                            ) : (
                                                <FaRegSquarePlus
                                                    className='absolute top-[10px] right-[15px] cursor-pointer'
                                                    onClick={() => openInnerSubmenu(1)} />
                                            )}


                                        {
                                            innerSubmenuIndex === 1 && (
                                                <ul className='submenu w-full pl-3 '>
                                                    <li className='list-none relative mb-1'>
                                                        <Link to='/' className=' link w-full !text-left !justify-start !px-3 
                                        transition text-[13px]'>
                                                            Smart Tablet
                                                        </Link>
                                                    </li>
                                                    <li className='list-none relative mb-1'>
                                                        <Link to='/' className=' link w-full !text-left !justify-start !px-3 
                                        transition text-[13px]'>
                                                            Crepe T-Shirt
                                                        </Link>
                                                    </li>
                                                    <li className='list-none relative mb-1'>
                                                        <Link to='/' className=' link w-full !text-left !justify-start !px-3 
                                        transition text-[13px]'>
                                                            Leather Watch
                                                        </Link>
                                                    </li>
                                                    <li className='list-none relative mb-1'>
                                                        <Link to='/' className=' link w-full !text-left !justify-start !px-3
                                         transition text-[13px]'>
                                                            Rolling Diamond
                                                        </Link>
                                                    </li>
                                                </ul>

                                            )
                                        }

                                    </li>
                                </ul>

                            )}

                    </li>
                </ul>
            </div>
        </Box>
    );
    return (
        <div>
            <div>
                {/* <Button onClick={toggleDrawer(true)}>Open drawer</Button> */}
                <Drawer open={props.isOpenCatPanel} onClose={() => props.Categories(false)}>
                    {DrawerList}
                </Drawer>
            </div>
        </div>
    )
}

export default Category
