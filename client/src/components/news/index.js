import React from 'react'
import NewsItem from "./newsItem"

export default ({news}) => {
  const items = news.data.map(item => {
    return (
      <NewsItem key={item._id} item={item} />
    )
  })

  return (
    <div>
      {items}
    </div>
  )
}
