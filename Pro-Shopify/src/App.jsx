import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './component/signup/SignUp'
import Login from './component/signup/Login'
import Features from './component/HomePage/Features'
import ProductsList from './component/products/ProductsList'
import ProductPage from './component/products/ProductPage'
import CategoryProduct from './component/products/CategoryProduct'
import ScrollToTop from './component/ScrollToTop'
import CartPage from './component/products/CartPage'
import BuyNow from './component/products/BuyNow'
import CheckoutPage from './component/products/CheckoutPage'
import AddressForm from './component/products/AdressForm'
import { ToastContainer } from 'react-toastify'
import ProfilePage from './component/Profile/ProfilePage'
import OrdersPage from './component/Profile/OrderPage'
import OrderDetails from './component/Profile/OrderDetails'
import HelpCenter from './component/Profile/HelpCenter'
import Wishlist from './component/Profile/Wishlist'
import Header from './component/Header'
import Navigation from './component/Navigation'
import Footer from './component/Footer'
import OfferBanner from './component/HomePage/OfferBanner'

function App() {
const [isAuthenticated, setIsAuthenticated]=useState()
 const [showSubmenu, setShowSubmenu] = useState(false);
  return (
    <>
      <BrowserRouter>
      <ScrollToTop />
      <Header />
      <Navigation />
      <Routes>
        {/* home page */}
        <Route path='/' element={<Home />}></Route>
        <Route path='/signup' element={<SignUp setIsAuthenticated={setIsAuthenticated}/>}></Route>
        <Route path='/login' element={<Login setIsAuthenticated={setIsAuthenticated}/>}></Route>
        <Route path='/Features' element={<Features />}></Route>
        <Route path='/offerbanner' element={<OfferBanner />}></Route>

        {/* product */}
        <Route path='/productslist' element={<ProductsList />}></Route>
      <Route path="/productpage/:id" element={<ProductPage />} ></Route>
        <Route path='/category/:category' element={<CategoryProduct />}></Route>

        {/* cart  */}
        <Route path='/addtocart' element={<CartPage />}></Route>
        <Route path='/buy-now' element={<BuyNow />}></Route>
        <Route path='/checkout' element={<CheckoutPage />}></Route>
        <Route path='/address/new' element={<AddressForm />}></Route>

        {/* profile */}
        <Route path='/profile' element={<ProfilePage />}></Route>
        <Route path='/orders' element={<OrdersPage />}></Route>
        <Route path='/orders/:id' element={<OrderDetails />}></Route>
        <Route path='/help-center' element={<HelpCenter />}></Route>
        <Route path='/wishlist' element={<Wishlist />}></Route>

      </Routes>
      <ToastContainer 
        position="bottom-center" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        pauseOnHover 
        draggable 
        theme="dark" 
      />
      <Footer />
      </BrowserRouter>
    </>
  )
}

export default App
