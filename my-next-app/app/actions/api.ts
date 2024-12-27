'use server'

export type Category = {
  id: string
  name: string
  description?: string
  imageUrl?: string
}

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  image?: string
}

const API_BASE = 'https://nelai-lala-backend.vercel.app/api'

// Categories CRUD
export async function getCategories(options?: { 
  q?: string, 
  limit?: number, 
  page?: number, 
  strict?: boolean 
}): Promise<Category[]> {
  const params = new URLSearchParams()
  
  if (options?.q) params.append('q', options.q)
  if (options?.limit) params.append('limit', options.limit.toString())
  if (options?.page) params.append('page', options.page.toString())
  if (options?.strict !== undefined) params.append('strict', options.strict.toString())

  const res = await fetch(`${API_BASE}/categories?${params.toString()}`)
  
  if (!res.ok) throw new Error('Failed to fetch categories')
  
  const data = await res.json()
  
  // Transform API response to match our Category type
  return (data.categories || []).map((category: any) => ({
    id: category._id,
    name: category.name,
    description: category.description,
    imageUrl: category.imageUrl
  }))
}

export async function getCategoriesStrict(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories?strict=true`)
  if (!res.ok) throw new Error('Failed to fetch categories')
  const data = await res.json()
  
  // Transform API response to match our Category type
  return (data.categories || []).map((category: any) => ({
    id: category._id,
    name: category.name,
    description: category.description,
    imageUrl: category.imageUrl
  }))
}

export async function createCategory(data: Omit<Category, 'id'>) {
  // First, check if a category with the same name already exists
  const existingCategories = await getCategories()
  const categoryExists = existingCategories.some(
    category => category.name.toLowerCase() === data.name.toLowerCase()
  )

  if (categoryExists) {
    throw new Error(`Category "${data.name}" already exists. Please choose a different name.`)
  }

  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'Failed to create category')
  }
  
  return res.json()
}

export async function updateCategory(id: string, data: Partial<Category>) {
  try {
    // First, get the current category to check if name is being changed
    const existingCategories = await getCategories()
    const currentCategory = existingCategories.find(cat => cat.id === id)
    
    // If name is being updated, check for conflicts
    if (data.name && data.name.toLowerCase() !== currentCategory?.name.toLowerCase()) {
      const nameConflict = existingCategories.some(
        category => category.name.toLowerCase() === data.name?.toLowerCase() && category.id !== id
      )

      if (nameConflict) {
        throw new Error(`Category "${data.name}" already exists. Please choose a different name.`)
      }
    }

    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    // Log full response for debugging
    const responseText = await res.text()
    console.log('Update Category Response:', responseText)

    if (!res.ok) {
      console.error('Update Category Error Response:', responseText)
      
      // Try to parse error response
      try {
        const errorData = JSON.parse(responseText)
        throw new Error(errorData.error || 'Failed to update category')
      } catch {
        // If parsing fails, use the original response text
        throw new Error(responseText || 'Failed to update category')
      }
    }

    // Parse response if it's valid JSON
    try {
      const result = JSON.parse(responseText)
      return result
    } catch {
      throw new Error('Invalid response from server')
    }
  } catch (error) {
    console.error('Update Category Error:', error)
    throw error
  }
}

export async function deleteCategory(id: string) {
  try {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!res.ok) {
      let errorMessage = 'Failed to delete category'
      try {
        const errorBody = await res.json()
        errorMessage = errorBody.error || errorMessage
      } catch {
        // If parsing JSON fails, use the text or status
        errorMessage = await res.text() || `Status: ${res.status}`
      }
      
      throw new Error(errorMessage)
    }
    
    // Some APIs return empty response on successful delete
    return res.json().catch(() => ({}))
  } catch (error) {
    console.error('Delete category error:', error)
    throw error
  }
}

// Menu Items CRUD
export async function getMenuItems(): Promise<MenuItem[]> {
  const res = await fetch(`${API_BASE}/menuitem`)
  if (!res.ok) throw new Error('Failed to fetch menu items')
  return res.json()
}

export async function createMenuItem(data: Omit<MenuItem, 'id'>) {
  const res = await fetch(`${API_BASE}/menuitem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create menu item')
  return res.json()
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>) {
  const res = await fetch(`${API_BASE}/menuitem/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update menu item')
  return res.json()
}

export async function deleteMenuItem(id: string) {
  const res = await fetch(`${API_BASE}/menuitem/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete menu item')
  return res.json()
}

export async function uploadImage(file: File) {
  // Validate file before upload
  if (!file) {
    throw new Error('No file provided')
  }

  // Log file details for debugging
  console.log('File to upload:', {
    name: file.name,
    type: file.type,
    size: file.size
  })

  const formData = new FormData()
  formData.append('file', file)  // Changed from 'image' to 'file' to match backend expectation

  try {
    const res = await fetch(`${API_BASE}/image_upload`, {
      method: 'POST',
      body: formData,
    })

    // Log full response for debugging
    const responseText = await res.text()
    console.log('Upload Response:', responseText)

    if (!res.ok) {
      console.error('Upload Error Response:', responseText)
      throw new Error(responseText || 'Failed to upload image')
    }

    // Parse response if it's valid JSON
    try {
      const result = JSON.parse(responseText)
      return result
    } catch {
      throw new Error('Invalid response from server')
    }
  } catch (error) {
    console.error('Image Upload Error:', error)
    throw error
  }
}
