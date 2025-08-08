import React, { useState, useContext, useEffect, useRef } from 'react';
import '../component/search.css';
import Button from '@mui/material/Button';
import { IoSearch, IoClose } from "react-icons/io5";
import { ProductContext } from '../context/ProductDetail';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Search = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const { product } = useContext(ProductContext);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Find matching category and subcategory
    const findMatchingCategory = (term) => {
        if (!term || !product) return null;
        
        const searchLower = term.toLowerCase();
        const matchingProduct = product.find(item => 
            item.name?.toLowerCase().includes(searchLower) ||
            item.category?.toLowerCase().includes(searchLower) ||
            item.subCategory?.toLowerCase().includes(searchLower)
        );

        return matchingProduct ? {
            category: matchingProduct.category,
            subCategory: matchingProduct.subCategory
        } : null;
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) return;
        
        const matchingCategory = findMatchingCategory(searchTerm);
        if (matchingCategory) {
            navigate(`/category/${matchingCategory.category}`, {
                state: { 
                    category: matchingCategory.category,
                    subCategory: matchingCategory.subCategory
                }
            });
            setShowDropdown(false);
            setSearchTerm('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/productpage/${productId}`);
        setShowDropdown(false);
        setSearchTerm('');
    };

    const clearSearch = () => {
        setSearchTerm('');
        setShowDropdown(false);
    };

    const filteredProducts = product?.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subCategory?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='relative w-full max-w-[600px] mx-auto' ref={searchRef}>
            <div className={`searchBox w-full h-[50px] rounded-[8px] relative transition-all duration-200 ${isFocused ? 'bg-white shadow-md' : 'bg-[#e5e5e5]'}`}>
                <input 
                    type='text' 
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(e.target.value.length > 0);
                    }}
                    onFocus={() => {
                        setIsFocused(true);
                        if (searchTerm) setShowDropdown(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                    placeholder='Search for products, categories...' 
                    className='ml-5 w-[calc(100%-80px)] h-[50px] focus:outline-none bg-transparent p-2 text-[15px] placeholder-gray-500' 
                />
                
                {searchTerm && (
                    <button 
                        onClick={clearSearch}
                        className='absolute top-[14px] right-[50px] text-gray-500 hover:text-gray-700 transition-colors'
                    >
                        <IoClose className='text-[20px]' />
                    </button>
                )}
                
                <Button 
                    className='!absolute top-[8px] right-[5px] z-[100] !w-[35px] !min-w-[35px] h-[35px] !rounded-full !text-black hover:!bg-gray-200'
                    onClick={handleSearch}
                    disabled={!searchTerm.trim()}
                    sx={{
                        '&:disabled': {
                            opacity: 0.5,
                            cursor: 'not-allowed'
                        }
                    }}
                >
                    <IoSearch className='text-[#4d4c4c] text-[22px]'/>
                </Button>
            </div>

            {/* Dropdown Results */}
            <AnimatePresence>
                {showDropdown && searchTerm && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className='absolute w-full mt-1 max-h-[400px] overflow-y-auto bg-white shadow-lg rounded-md z-[100] border border-gray-200'
                    >
                        {filteredProducts?.length > 0 ? (
                            <>
                                <div className='p-2 border-b border-gray-100 bg-gray-50'>
                                    <p className='text-sm font-medium text-gray-600'>
                                        {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
                                    </p>
                                </div>
                                {filteredProducts.map((item) => (
                                    <div 
                                        key={item._id}
                                        onClick={() => handleProductClick(item._id)}
                                        className='p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors'
                                    >
                                        <div className='font-medium text-gray-800'>{item.name}</div>
                                        {/* <div className='flex items-center mt-1'>
                                            <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2'>
                                                {item.category}
                                            </span>
                                            {item.subCategory && (
                                                <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded'>
                                                    {item.subCategory}
                                                </span>
                                            )}
                                        </div> */}
                                        {/* <div className='flex items-center mt-2'>
                                            <span className='text-sm font-bold text-gray-900'>
                                                ₹{item.discountPrice?.toLocaleString()}
                                            </span>
                                            {item.originalPrice && (
                                                <span className='text-xs text-gray-500 line-through ml-2'>
                                                    ₹{item.originalPrice?.toLocaleString()}
                                                </span>
                                            )}
                                        </div> */}
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className='p-4 text-center text-gray-500'>
                                No products found matching "{searchTerm}"
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Search;