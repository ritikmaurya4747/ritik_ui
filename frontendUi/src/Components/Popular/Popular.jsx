import React, { useEffect, useState } from 'react'
import './Popular.css'
import Item from '../Item/Item'

function Popular() {
  const [popularProducts, setPopularProduct] = useState([]);
  useEffect(()=>{
    fetch('https://styleboom-c.onrender.com/popularinwomen')
    .then((response)=>{console.log(response.json); return response.json()}
    )
    .then((data)=>setPopularProduct(data))
  },[])
  
  return (
    <div className='popular'>
        <h1>POPULAR IN WOMEN</h1>
        <hr />
        <div className="popular-item">
            {popularProducts.map((item,i) => {
                return <Item 
                key={i}
                id={item.id}
                name={item.name}
                image={item.image}
                new_price={item.new_price}
                old_price={item.old_price} />
            })}
        </div>
    </div>
  )
}

export default Popular;