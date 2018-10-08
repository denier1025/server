import React from 'react'

export default ({item}) => {
  return (
      <div>
        <h3>{item.title}</h3>
        <h6>{item.subtitle}</h6>
        <div>{item.text}</div>
      </div>
  )
}
