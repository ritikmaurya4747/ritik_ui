import React, { createContext, useEffect, useState } from "react";


export const ShopContext = createContext(null);
const getDefaultCart = ()=>{
    let cart = {};
    for (let index = 0; index < 300+1; index++) {
        cart[index] = 0;
    }
    return cart;
}

const ShopContextProvider = (props) =>{
    const [cartItems, setCartItems] = useState(getDefaultCart());
    // database se images lane ke liye 
    const [all_product , setAllproduct] = useState([]);
    useEffect(()=>{
        fetch('https://styleboom-c.onrender.com/allproducts')
        .then((response) =>response.json())
        .then((data) => setAllproduct(data))

       if(localStorage.getItem('auth-token')){
        fetch('https://styleboom-c.onrender.com/getcartdata',{
            method:'POST',
            headers:{
                Accept:'Application/form-data',
                'auth-token': `${localStorage.getItem('auth-token')}`,
                'Content-Type': 'application/json',
            },
            body:"",
        }).then((response)=>response.json())
        .then((data)=>setCartItems(data));
       }
    },[])
    
    

    const addToCart = (itemId) =>{
        setCartItems((prev) => ({...prev,[itemId]:prev[itemId]+1}))
        if(localStorage.getItem('auth-token')){
            fetch('https://styleboom-c.onrender.com/addtocart',{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({"itemId":itemId})
            })
            .then((response)=>response.json())
            .then((data)=>console.log(data))
        }
    }
    const removeFromCart = (itemId) =>{
        setCartItems((prev) => ({...prev,[itemId]:prev[itemId]-1}))
        if(localStorage.getItem('auth-token')){
            fetch('https://styleboom-c.onrender.com/removefromcart',{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({"itemId":itemId})
            })
            .then((response)=>response.json())
            .then((data)=>console.log(data))
        }
    }
    
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for(const item in cartItems){
            if(cartItems[item] > 0 ){
                let itemInfo = all_product.find((product)=> product.id === Number(item))
                totalAmount += itemInfo.new_price * cartItems[item];
            }
        }
        return totalAmount;
    };

    const getTotalCartItems = () => {
        let totalItem = 0;
        for(const item in cartItems){
            if(cartItems[item] >0){
                totalItem += cartItems[item]
            }
        }
        return totalItem;
    }
    
    const contextValue = {getTotalCartItems,getTotalCartAmount, all_product,cartItems,addToCart,removeFromCart};
    return(
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider