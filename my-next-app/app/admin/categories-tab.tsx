"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Category, createCategory, deleteCategory, updateCategory } from "../actions/api"
import { uploadImage } from "../actions/api"
import { Pencil, Plus, Trash } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function CategoriesTab({ initialCategories }: { initialCategories: Category[] }) {

  const [categories, setCategories] = useState<Category[]>(
    Array.isArray(initialCategories) ? initialCategories : []
  )
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Only JPEG, PNG, and GIF are allowed.",
          variant: "destructive"
        })
        return
      }

      // Additional file size validation (e.g., max 5MB)
      const maxSizeInBytes = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSizeInBytes) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 5MB.",
          variant: "destructive"
        })
        return
      }

      setImageFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    let imageUrl: string | undefined
    
    try {
      // Upload image if a file is selected
      if (imageFile) {
        try {
          const uploadResult = await uploadImage(imageFile)
          imageUrl = uploadResult.imageUrl
        } catch (uploadError) {
          toast({
            title: "Image Upload Failed",
            description: uploadError instanceof Error 
              ? uploadError.message 
              : "Failed to upload image. Please try again.",
            variant: "destructive"
          })
          return  // Stop submission if image upload fails
        }
      }

      const data = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        imageUrl: imageUrl
      }

      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, data)
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...updated } : c))
        toast({ title: "Category updated successfully" })
      } else {
        const created = await createCategory(data)
        setCategories([...categories, created])
        toast({ title: "Category created successfully" })
      }
      
      setEditingCategory(null)
      setImageFile(null)
      
      // Trigger page refresh
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error) {
      toast({ 
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      console.log('Attempting to delete category with ID:', id)
      console.log('Current categories:', categories.map(c => c.id))
      
      // Verify the category exists before attempting to delete
      const categoryToDelete = categories.find(c => c.id === id)
      if (!categoryToDelete) {
        console.error('Category not found:', id)
        toast({
          title: "Category Not Found",
          description: `No category found with ID: ${id}`,
          variant: "destructive"
        })
        return
      }

      await deleteCategory(id)
      const updatedCategories = categories.filter(c => c.id !== id)
      setCategories(updatedCategories)
      
      toast({ 
        title: "Category Deleted",
        description: `"${categoryToDelete.name}" has been successfully removed.`
      })
    } catch (error) {
      console.error('Delete category error:', error)
      toast({ 
        title: "Error Deleting Category",
        description: error instanceof Error 
          ? error.message 
          : "Unable to delete the category. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Categories</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCategory(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit' : 'Add'} Category</DialogTitle>
                <DialogDescription>
                  Fill in the details for the category.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={editingCategory?.name}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingCategory?.description || ''}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Category Image</Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageChange}
                  />
                  {imageFile && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(imageFile)} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded"
                      />
                    </div>
                  )}
                  {editingCategory?.imageUrl && !imageFile && (
                    <div className="mt-2">
                      <img 
                        src={editingCategory.imageUrl} 
                        alt="Current" 
                        className="w-32 h-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Image</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.description || 'No description'}</TableCell>
              <TableCell>
                {category.imageUrl && (
                  <img 
                    src={category.imageUrl} 
                    alt={category.name} 
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Dialog open={editingCategory === category} onOpenChange={(open) => !open && setEditingCategory(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleSubmit}>
                        <DialogHeader>
                          <DialogTitle>Edit Category</DialogTitle>
                          <DialogDescription>
                            Update the details for the category.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              name="name"
                              defaultValue={category.name}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              name="description"
                              defaultValue={category.description}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="image">Category Image</Label>
                            <Input
                              id="image"
                              name="image"
                              type="file"
                              accept="image/jpeg,image/png,image/gif"
                              onChange={handleImageChange}
                            />
                            {imageFile && (
                              <div className="mt-2">
                                <img 
                                  src={URL.createObjectURL(imageFile)} 
                                  alt="Preview" 
                                  className="w-32 h-32 object-cover rounded"
                                />
                              </div>
                            )}
                            {category.imageUrl && !imageFile && (
                              <div className="mt-2">
                                <img 
                                  src={category.imageUrl} 
                                  alt="Current" 
                                  className="w-32 h-32 object-cover rounded"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Save</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this category? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(category.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
