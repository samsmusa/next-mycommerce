// app/admin/products/[id]/page.tsx
import { notFound } from "next/navigation"
import PageComponent from "@/app/admin/products/[id]/PageComponent"
import { getCategories } from "@/app/server_action/categories"
import { getProduct } from "@/app/server_action/products"

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const isEdit = id !== "new" // common pattern: /products/new
    console.log("id", id, isEdit   )
    // Fetch in parallel on the server
    const [categoriesRes, product] = await Promise.all([
        getCategories(),
        isEdit ? getProduct(id) : Promise.resolve(null),
    ])

    const categories = categoriesRes?.data ?? []

    if (isEdit && !product) notFound()

    return (
        <PageComponent
            id={isEdit ? id : undefined}
            initialCategories={categories}
            initialProduct={product}
        />
    )
}
