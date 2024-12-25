import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoriesTab } from "@/app/admin/categories-tab"
import { MenuItemsTab } from "@/app/admin/menu-items-tab"
import { Suspense } from "react"
import { getCategories, getMenuItems } from "./actions/api"

export default async function AdminPage() {
  // Fetch initial data
  const [categories, menuItems] = await Promise.all([
    getCategories(),
    getMenuItems(),
  ])

  return (
    <Tabs defaultValue="categories" className="space-y-4">
      <TabsList>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="menu-items">Menu Items</TabsTrigger>
      </TabsList>
      <TabsContent value="categories" className="space-y-4">
        <Suspense fallback={<div>Loading categories...</div>}>
          <CategoriesTab initialCategories={categories} />
        </Suspense>
      </TabsContent>
      <TabsContent value="menu-items" className="space-y-4">
        <Suspense fallback={<div>Loading menu items...</div>}>
          <MenuItemsTab initialMenuItems={menuItems} initialCategories={categories} />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
}

