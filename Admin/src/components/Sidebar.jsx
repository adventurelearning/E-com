import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiChevronDown, FiChevronRight, FiGrid, FiBox,
  FiTruck, FiImage, FiUser, FiX, FiMenu,
  FiUsers,
  FiShoppingCart,
  FiStar,
  FiCamera,
  FiSettings
} from 'react-icons/fi';
import { TbTransitionBottom } from "react-icons/tb";
import { GrConfigure } from "react-icons/gr";
import { getAdminInfo } from '../utils/auth';
import { MdOutlineSettingsSuggest } from "react-icons/md";

const SidebarItem = ({ title, icon, children, path, toggleSidebar }) => {
  const [open, setOpen] = useState(false);

  const handleNavClick = () => {
    if (window.innerWidth < 768 && toggleSidebar) toggleSidebar();
  };

  return (
    <div className="mb-1">
      {path ? (
        <NavLink
          to={path}
          onClick={handleNavClick}
          className={({ isActive }) =>
            `no-underline flex items-center px-3 py-2 rounded-xl transition-all group ${isActive
              ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 text-purple-700 shadow-sm'
              : 'text-gray-700'
            }`
          }
        >
          <span className="mr-3 text-xl text-purple-600 group-hover:text-purple-700">
            {icon}
          </span>
          <span className="group-hover:text-gray-900">{title}</span>
        </NavLink>
      ) : (
        <button
          className={`flex justify-between items-center w-full px-3 py-2 rounded-xl text-left transition-all ${open ? 'text-gray-900' : 'text-gray-700'
            }`}
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center">
            <span className="mr-3 text-xl text-purple-600">{icon}</span>
            <span>{title}</span>
          </div>
          {children &&
            (open ? (
              <FiChevronDown className="text-purple-500 transition-transform duration-300" />
            ) : (
              <FiChevronRight className="text-purple-500 transition-transform duration-300" />
            ))}
        </button>
      )}

      {open && children && (
        <div className="ml-8 mt-1.5 space-y-1.5 py-1.5 border-l-2 border-purple-100">
          {children}
        </div>
      )}
    </div>
  );
};

const SubItem = ({ to, children, toggleSidebar }) => {
  const handleClick = () => {
    if (window.innerWidth < 768 && toggleSidebar) toggleSidebar();
  };

  return (
    <NavLink
      to={to}
      onClick={handleClick}
      className={({ isActive }) =>
        `no-underline flex items-center px-3 py-2 rounded-xl transition-all group ${isActive
          ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 text-purple-700 shadow-sm'
          : 'text-gray-700'
        }`
      }
    >
      <span className="flex items-center">
        <span className="rounded-full bg-purple-300 w-2 h-2 mr-3"></span>
        {children}
      </span>
    </NavLink>
  );
};

const Sidebar = ({ open, toggleSidebar }) => {
  const user = getAdminInfo();

  const hasRole = (role) =>
    user?.role === 'admin' || user?.permissions?.includes(role);

  const sidebarItems = [
    {
      title: 'Dashboard',
      icon: <FiGrid />,
      path: '/',
      visible: hasRole('Dashboard'),
    },
    {
      title: 'Products',
      icon: <FiBox />,
      visible: hasRole('Product Management'),
      subItems: [
        {
          title: 'Add Product',
          path: '/add-product',
          visible: true,
        },
        {
          title: 'All Products',
          path: '/products',
          visible: true,
        },
      ],
    },
    {
      title: 'Sales',
      icon: <GrConfigure />,
      visible: hasRole('Sales'),
      subItems: [
        {
          title: 'Orders',
          path: '/orders',
          visible: true,
        },
         {
          title: 'Shipments',
          path: '/shipments',
          visible: true,
        },
         {
          title: 'Invoices',
          path: '/invoices',
          visible: true,
        },
         {
          title: 'Refunds',
          path: '/refunds',
          visible: true,
        },
         {
          title: 'Transactions',
          path: '/transactions',
          visible: true,
        },

      ],
    },
    {
      title: 'Banners',
      icon: <FiImage />,
      visible: hasRole('Banners'),
      subItems: [
        {
          title: 'Add Banners',
          path: '/banner',
          visible: true,
        },
        {
          title: 'Sub Banners',
          path: '/SubBanner',
          visible: true,
        },
        {
          title: 'Offer Banners',
          path: '/offer',
          visible: true,
        },
      ],
    },
    {
      title: 'Admin Users',
      icon: <FiUser />,
      visible: hasRole('Admin Users'),
      subItems: [
        {
          title: 'Manage Admins',
          path: '/AdminUsers',
          visible: true,
        },
      ],
    },
    // {
    //   title: 'Suppliers',
    //   icon: <FiTruck />,
    //   visible: hasRole('Supplier Management'),
    //   subItems: [
    //     {
    //       title: 'All Suppliers',
    //       path: '/suppliers',
    //       visible: true,
    //     },
    //     {
    //       title: 'Add Supplier',
    //       path: '/add-supplier',
    //       visible: true,
    //     },
    //     {
    //       title: 'Approve Applications',
    //       path: '/approve-suppliers',
    //       visible: true,
    //     },
    //   ],
    // },
    {
      title: 'Users',
      icon: <FiUsers />,
      visible: hasRole('User'),
      subItems: [
        {
          title: 'All Users',
          path: '/users',
          visible: true,
        },
        // {
        //   title: 'Product-S',
        //   path: '/SProduct',
        //   visible: true,
        // },
      ],
    },
    {
      title: 'Orders',
      icon: <FiShoppingCart />,
      visible: hasRole('Orders'),
      subItems: [
        {
          title: 'All orders',
          path: '/orders',
          visible: true,
        },
        // {
        //   title: 'Product-S',
        //   path: '/SProduct',
        //   visible: true,
        // },
      ],
    },
    {
      title: 'Reviews & Ratings',
      icon: <FiStar />,
      visible: hasRole('Orders'),
      subItems: [
        {
          title: 'Reviews',
          path: '/review',
          visible: true,
        }
      ],
    },
    {
      title: 'CMS',
      icon: <MdOutlineSettingsSuggest />,
      visible: hasRole('Configuration'),
      subItems: [
        {
          title: 'Return_Policy',
          path: '/return-policy',
          visible: true,
        },
         {
          title: 'Privacy_Policy',
          path: '/privacy-policy',
          visible: true,
        },
        {
          title: 'Shipping_Policy',
          path: '/shipping-policy',
          visible: true,
        },
        {
          title: 'Payment_Policy',
          path: '/payment-policy',
          visible: true,
        },
        {
          title: 'Refund_Policy',
          path: '/refund-policy',
          visible: true,
        },
        {
          title: 'Terms_Conditions',
          path: '/terms-conditions',
          visible: true,
        },
          {
          title: 'Customer Service',
          path: '/customer-service',
          visible: true,
        },
           {
          title: 'What\'s New',
          path: '/whats-new',
          visible: true,
        },
      ],
    },

    {
      title: 'Configuration',
      icon: <GrConfigure />,
      visible: hasRole('Configuration'),
      subItems: [
        {
          title: 'Logo_Images',
          path: '/logo',
          visible: true,
        },
         {
          title: 'Theme',
          path: '/theme',
          visible: true,
        },
      ],
    },
        {
      title: 'Settings',
      icon: <FiSettings />,
      path: '/Settings',
      visible: hasRole('Settings'),
    },

    // {
    //   title: 'Products-S',
    //   icon: <FiBox />,
    //   visible: hasRole('Suplier'),
    //   subItems: [
    //     {
    //       title: 'Add Product-S',
    //       path: '/Add-SProduct',
    //       visible: true,
    //     },
    //     {
    //       title: 'Product-S',
    //       path: '/SProduct',
    //       visible: true,
    //     },
    //   ],
    // },
       {
      title: 'Footer',
      icon: <TbTransitionBottom />,
      path: '/footer',
      visible: hasRole('Footer'),
    },
  ];

    return (
    <div
  className={`fixed md:relative h-screen w-64 bg-white border-r border-purple-100 shadow-lg z-10 ${
    open ? "block" : "hidden md:block"
  }`}
>
  {/* Header - Fixed */}
  <div className="p-2 md:p-3 flex justify-between items-center border-b border-purple-100 bg-white">
    <div className="flex items-center space-x-2 md:space-x-3">
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
        <span className="text-white font-bold text-sm md:text-lg">A</span>
      </div>
      <h1 className="text-lg md:text-xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Admin Panel
      </h1>
    </div>

    <button
      onClick={toggleSidebar}
      className="md:hidden p-2 rounded-lg text-purple-600"
    >
      <FiX className="text-lg md:text-xl" />
    </button>
  </div>

  {/* Navigation - Scrollable */}
  <div className="h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">
    <nav className="p-2 md:p-4 space-y-1">
      {sidebarItems.map(
        (item, index) =>
          item.visible && (
            <SidebarItem
              key={index}
              title={item.title}
              icon={item.icon}
              path={item.path}
              toggleSidebar={toggleSidebar}
              className="text-sm md:text-base"
            >
              {item.subItems?.map(
                (sub, subIndex) =>
                  sub.visible && (
                    <SubItem
                      key={subIndex}
                      to={sub.path}
                      toggleSidebar={toggleSidebar}
                      className="text-xs md:text-sm"
                    >
                      {sub.title}
                    </SubItem>
                  )
              )}
            </SidebarItem>
          )
      )}
    </nav>
  </div>
</div>
  );
};

export default Sidebar;