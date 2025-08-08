import Button from '@mui/material/Button';
import React, { useContext, useState } from 'react';
import { RiMenu2Fill } from "react-icons/ri";
import { LiaAngleDownSolid, LiaTimesSolid } from "react-icons/lia";
import { Link } from 'react-router-dom';
import { GoRocket } from "react-icons/go";
import Category from './Category';
import '../component/search.css';
import { ProductContext } from '../context/ProductDetail';
import { useMediaQuery } from '@mui/material';
import { Drawer, IconButton } from '@mui/material';
import { FiMenu } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
    const [isOpenCatPanel, setIsOpenCatPanel] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState(null);
    const { product } = useContext(ProductContext);
    const isMobile = useMediaQuery('(max-width:1024px)');

    const Categories = () => {
        setIsOpenCatPanel(true);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
        setActiveSubmenu(null);
    };

    const toggleSubmenu = (index) => {
        setActiveSubmenu(activeSubmenu === index ? null : index);
    };

    const navItems = [
        { name: 'Home', path: '/' },
        { 
            name: 'Fashion', 
            path: '/category/MENSWEAR',
            submenu: [
                { name: 'Men', path: '/category/MENSWEAR' },
                { name: 'Women', path: '/category/WOMENSWEAR' },
                { name: 'Kids', path: '/category/KIDS' }
            ]
        },
        { 
            name: 'Electronics', 
            path: '/category/ELECTRONICS',
            submenu: [
                { name: 'IPHONE', path: `/category/IPHONE'S` },
                { name: 'LAPTOP', path: '/category/LAPTOP' },
                { name: 'OPPO', path: '/category/OPPO' }
            ]
        },
        { name: 'Bags', path: '/category/BAGS' },
        { name: 'Footwear', path: '/category/FOOTWEAR' },
        { name: 'Beauty', path: '/category/BEAUTY' },
        { name: 'Gadgets', path: '/category/GADGETS' },
        { name: 'Jewellery', path: '/category/JEWELLERY' }
    ];

    const drawer = (
        <div className="p-4 bg-white h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                <IconButton 
                    onClick={handleDrawerToggle}
                    className="!text-gray-600 hover:!bg-red-50 hover:!text-[#d10024]"
                >
                    <LiaTimesSolid />
                </IconButton>
            </div>
            <div className="mb-4">
                <Button 
                    fullWidth
                    variant="outlined"
                    className='!text-gray-800 gap-2 !font-medium !text-sm !border-[#d10024] hover:!border-[#d10024] hover:!bg-red-50'
                    onClick={Categories}
                    startIcon={<RiMenu2Fill className='text-[#d10024]' />}
                    endIcon={<LiaAngleDownSolid className='text-[#d10024]'/>}
                >
                    Explore Our Collections
                </Button>
            </div>
            <ul className="space-y-1">
                {navItems.map((item, index) => (
                    <li key={item.name} className="list-none">
                        {item.submenu ? (
                            <div className="group">
                                <Button 
                                    fullWidth
                                    className={`!justify-between !text-left !text-gray-800 hover:!text-[#d10024] !font-medium !normal-case ${
                                        activeSubmenu === index ? '!text-[#d10024]' : ''
                                    }`}
                                    onClick={() => toggleSubmenu(index)}
                                    endIcon={
                                        <motion.div
                                            animate={{ rotate: activeSubmenu === index ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <LiaAngleDownSolid className="text-sm" />
                                        </motion.div>
                                    }
                                >
                                    {item.name}
                                </Button>
                                <AnimatePresence>
                                    {activeSubmenu === index && (
                                        <motion.ul
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="pl-4 overflow-hidden"
                                        >
                                            {item.submenu.map((subItem) => (
                                                <li key={subItem.name}>
                                                    <Link 
                                                        to={subItem.path} 
                                                        className="block w-full"
                                                        onClick={handleDrawerToggle}
                                                    >
                                                        <Button 
                                                            fullWidth
                                                            className="!justify-start !text-left !text-gray-600 hover:!text-[#d10024] !font-normal !normal-case"
                                                        >
                                                            {subItem.name}
                                                        </Button>
                                                    </Link>
                                                </li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link 
                                to={item.path} 
                                className="block w-full"
                                onClick={handleDrawerToggle}
                            >
                                <Button 
                                    fullWidth
                                    className="!justify-start !text-left !text-gray-800 hover:!text-[#d10024] !font-medium !normal-case"
                                >
                                    {item.name}
                                </Button>
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
            <div className="mt-6 pt-4 border-t flex items-center gap-2 text-[#d10024]">
                <motion.div
                    animate={{ x: [0, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <GoRocket className="text-lg" />
                </motion.div>
                <span className="text-sm font-medium">Free Home Delivery</span>
            </div>
        </div>
    );

    return (
        <>
            <div className='bg-white w-full sticky top-0 z-50 shadow-sm border-b border-gray-100'>
                <nav className='py-2 px-4'>
                    <div className='container mx-auto flex items-center justify-between lg:justify-end gap-4 lg:gap-8'>
                        {isMobile && (
                            <IconButton 
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                className="lg:hidden !mr-2 !text-gray-700 hover:!bg-red-50 hover:!text-[#d10024]"
                            >
                                <FiMenu />
                            </IconButton>
                        )}
                        
                        {/* <div className='lg:w-[18%] hidden lg:block'>
                            <Button 
                                fullWidth
                                variant="outlined"
                                className='!text-gray-800 gap-2 !font-medium !text-sm !border-[#d10024] hover:!border-[#d10024] hover:!bg-red-50'
                                onClick={Categories}
                                startIcon={<RiMenu2Fill className='text-[#d10024]' />}
                                endIcon={<LiaAngleDownSolid className='text-[#d10024]' />}
                            >
                                Explore Our Collections
                            </Button>
                        </div> */}
                        
                        <div className='lg:w-[62%] hidden lg:block'>
                            <ul className='flex items-center gap-5'>
                                {navItems.map((item) => (
                                    <li key={item.name} className="list-none relative group">
                                        {item.submenu ? (
                                            <>
                                                <Button 
                                                    className={`!font-medium !text-gray-800 hover:!text-[#d10024] !text-sm !normal-case ${
                                                        window.location.pathname.includes(item.path) ? '!text-[#d10024]' : ''
                                                    }`}
                                                >
                                                    {item.name}
                                                </Button>
                                                <motion.div
                                                    className='submenu absolute top-full left-0 min-w-[200px] z-10 bg-white shadow-lg rounded-b-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border-t-2 border-[#d10024]'
                                                    initial={{ y: 10 }}
                                                    whileHover={{ y: 0 }}
                                                >
                                                    <ul>
                                                        {item.submenu.map((subItem) => (
                                                            <li 
                                                                key={subItem.name} 
                                                                className="list-none w-full hover:bg-gray-50 transition-colors"
                                                            >
                                                                <Link to={subItem.path}>
                                                                    <Button 
                                                                        fullWidth
                                                                        className={`!text-gray-700 !justify-start !rounded-none hover:!text-[#d10024] !text-sm !normal-case ${
                                                                            window.location.pathname === subItem.path ? '!text-[#d10024]' : ''
                                                                        }`}
                                                                    >
                                                                        {subItem.name}
                                                                    </Button>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            </>
                                        ) : (
                                            <Link to={item.path}>
                                                <Button 
                                                    className={`!font-medium !text-gray-800 hover:!text-[#d10024] !text-sm !normal-case ${
                                                        window.location.pathname === item.path ? '!text-[#d10024]' : ''
                                                    }`}
                                                >
                                                    {item.name}
                                                </Button>
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className='lg:w-[20%] hidden lg:flex items-center justify-end'>
                            <motion.p 
                                className='text-sm font-medium flex items-center gap-2 text-[#d10024]'
                                whileHover={{ scale: 1.02 }}
                            > 
                                <motion.span
                                    animate={{ x: [0, 2, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    <GoRocket />
                                </motion.span>
                                Free Home Delivery
                            </motion.p>
                        </div>
                    </div>
                </nav>
                
                <Category Categories={setIsOpenCatPanel} isOpenCatPanel={isOpenCatPanel} />
                
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: { xs: '280px', sm: '320px' },
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            </div>
        </>
    );
}

export default Navigation;