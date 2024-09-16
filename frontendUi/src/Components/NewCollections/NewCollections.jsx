import React, { useEffect, useState } from 'react'
import './NewCollections.css'
import Item from '../Item/Item'

function NewCollections() {
  const [new_collections,setNew_collections] = useState([])
  useEffect(()=>{
    fetch('https://styleboom-c.onrender.com/newcollection')
    .then((response)=>response.json())
    .then((data)=>setNew_collections(data))
  },[])
  return (
    <div className='newcollections'>
        <h1>NEW COLLECTIONS</h1>
        <hr />
        <div className="collections">
            {new_collections.map((item,i)=>{
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

export default NewCollections