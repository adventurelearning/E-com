import Button from '@mui/material/Button';
import React, { useContext, useState, useEffect } from 'react';
import { RiMenu2Fill } from "react-icons/ri";
import { LiaAngleDownSolid, LiaTimesSolid } from "react-icons/lia";
import { Link, useLocation } from 'react-router-dom';
import { GoRocket } from "react-icons/go";
import Category from './Category';
import '../component/search.css';
import { ProductContext } from '../context/ProductDetail';
import { useMediaQuery } from '@mui/material';
import { Drawer, IconButton } from '@mui/material';
import { FiMenu } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Api from '../Services/Api';
import Search from './Search';

const Navigation = () => {
    const [isOpenCatPanel, setIsOpenCatPanel] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState(null);
    const { product } = useContext(ProductContext);
    const isMobile = useMediaQuery('(max-width:1024px)');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await Api.get('/categories');
                // Filter categories that are visible in menu and sort by order
                const visibleCategories = response.data
                    .filter(cat => cat.visibleInMenu)
                    .sort((a, b) => a.order - b.order);
                setCategories(visibleCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

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

    // Check if a category or subcategory is active
    const isCategoryActive = (categoryPath, subcategoryPath = null) => {
        const currentPath = location.pathname;
        
        if (subcategoryPath) {
            return currentPath === subcategoryPath;
        }
        
        // For main category, check if it matches or is a parent of current path
        return currentPath === categoryPath || currentPath.startsWith(`${categoryPath}/`);
    };

    // Convert categories to navItems format
    const navItems = [
        { name: 'Home', path: '/' },
        ...categories.map(category => {
            const categoryPath = `/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`;
            
            return {
                name: category.name,
                path: categoryPath,
                submenu: category.subcategories && category.subcategories.length > 0 
                    ? category.subcategories.map(sub => ({
                        name: sub.name,
                        path: `${categoryPath}/${sub.name.toLowerCase().replace(/\s+/g, '-')}`
                    }))
                    : null
            };
        })
    ];

    const drawer = (
        <div className="p-4 bg-white h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                <IconButton 
                    onClick={handleDrawerToggle}
                    className="!text-gray-600 hover:!bg-red-50 hover:!text-primary"
                >
                    <LiaTimesSolid />
                </IconButton>
            </div>
            <div className="mb-4">
                <Button 
                    fullWidth
                    variant="outlined"
                    className='!text-gray-800 gap-2 !font-medium !text-sm !border-primary hover:!border-primary hover:!bg-red-50'
                    onClick={Categories}
                    startIcon={<RiMenu2Fill className='text-primary' />}
                    endIcon={<LiaAngleDownSolid className='text-primary'/>}
                >
                    Explore Our Collections
                </Button>
            </div>
            {loading ? (
                <div className="text-center py-4">Loading categories...</div>
            ) : (
                <ul className="space-y-1">
                    {navItems.map((item, index) => (
                        <li key={item.name} className="list-none">
                            {item.submenu ? (
                                <div className="group">
                                    <div className="flex items-center justify-between">
                                        <Link 
                                            to={item.path} 
                                            className="flex-grow"
                                            onClick={handleDrawerToggle}
                                        >
                                            <Button 
                                                fullWidth
                                                className={`!justify-start !text-left !font-medium !normal-case ${
                                                    isCategoryActive(item.path) 
                                                        ? '!text-primary' 
                                                        : '!text-gray-800 hover:!text-primary'
                                                }`}
                                            >
                                                {item.name}
                                            </Button>
                                        </Link>
                                        <IconButton 
                                            onClick={() => toggleSubmenu(index)}
                                            className="!text-gray-600 hover:!text-primary"
                                        >
                                            {activeSubmenu === index ? (
                                                <LiaAngleDownSolid className="transform rotate-180" />
                                            ) : (
                                                <LiaAngleDownSolid />
                                            )}
                                        </IconButton>
                                    </div>
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
                                                                className={`!justify-start !text-left !font-normal !normal-case ${
                                                                    isCategoryActive(item.path, subItem.path)
                                                                        ? '!text-primary' 
                                                                        : '!text-gray-600 hover:!text-primary'
                                                                }`}
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
                                        className={`!justify-start !text-left !font-medium !normal-case ${
                                            isCategoryActive(item.path) 
                                                ? '!text-primary' 
                                                : '!text-gray-800 hover:!text-primary'
                                        }`}
                                    >
                                        {item.name}
                                    </Button>
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            <div className="mt-6 pt-4 border-t flex items-center gap-2 text-primary">
                <motion.div
                    animate={{ x: [0, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <GoRocket className="text-lg animate-bounce" />
                </motion.div>
                <span className="text-sm font-medium animate-bounce">Free Home Delivery</span>
            </div>
        </div>
    );

    return (
        <>
            <div className='bg-white w-full sticky top-0 z-40 shadow-sm border-b border-gray-100'>
                <nav className='py-2 px-4'>
                    <div className=' mx-auto flex items-center justify-between lg:justify-end gap-4 lg:gap-8'>
                        {isMobile && (
                            <IconButton 
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                className="lg:hidden !mr-2 !text-gray-700 hover:!bg-red-50 hover:!text-primary"
                            >
                                <FiMenu />
                            </IconButton>
                            
                        )}

                        {isMobile && (
                            <div className="flex-1 mx-2">
                                     <Search fullWidth />
                                   </div>
                        )}
                        
                        <div className='lg:w-[62%] hidden lg:block'>
                            {loading ? (
                                <div className="flex items-center gap-5">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                                    ))}
                                </div>
                            ) : (
                                <ul className='flex items-center gap-5'>
                                    {navItems.map((item) => (
                                        <li key={item.name} className="list-none relative group">
                                            {item.submenu ? (
                                                <>
                                                    <Link to={item.path}>
                                                        <Button 
                                                            className={`!font-medium !text-sm !normal-case ${
                                                                isCategoryActive(item.path) 
                                                                    ? '!text-primary' 
                                                                    : '!text-gray-800 hover:!text-primary'
                                                            }`}
                                                        >
                                                            {item.name}
                                                        </Button>
                                                    </Link>
                                                    <motion.div
                                                        className='submenu absolute top-full left-0 min-w-[200px] z-10 bg-white shadow-lg rounded-b-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border-t-2 border-primary'
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
                                                                            className={`!text-gray-700 !justify-start !rounded-none !text-sm !normal-case ${
                                                                                isCategoryActive(item.path, subItem.path)
                                                                                    ? '!text-primary' 
                                                                                    : 'hover:!text-primary'
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
                                                        className={`!font-medium !text-sm !normal-case ${
                                                            isCategoryActive(item.path) 
                                                                ? '!text-primary' 
                                                                : '!text-gray-800 hover:!text-primary'
                                                        }`}
                                                    >
                                                        {item.name}
                                                    </Button>
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        <div className='lg:w-[20%] hidden lg:flex items-center justify-end'>
                            <motion.p 
                                className='text-sm font-medium flex items-center gap-2 text-primary'
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