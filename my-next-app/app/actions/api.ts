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
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`)
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
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create category')
  return res.json()
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update category')
  return res.json()
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete category')
  return res.json()
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
