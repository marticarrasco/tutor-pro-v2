import { useEffect } from 'react'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = `${title} | Derno`
    
    return () => {
      document.title = prevTitle
    }
  }, [title])
}

export function useDocumentMeta(description: string) {
  useEffect(() => {
    let metaDescription = document.querySelector('meta[name="description"]')
    
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    
    const prevContent = metaDescription.getAttribute('content')
    metaDescription.setAttribute('content', description)
    
    return () => {
      if (prevContent && metaDescription) {
        metaDescription.setAttribute('content', prevContent)
      }
    }
  }, [description])
}

