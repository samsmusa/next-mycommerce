import { notFound } from "next/navigation"
import PageComponent from "@/app/admin/categories/[id]/PageComponent"
import { getCategories, getCategoryById } from "@/app/server_action/categories"

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const isEdit = id !== "new"

    // Fetch in parallel on the server
    const [categoriesRes, category] = await Promise.all([
        getCategories({ limit: 100 }), // Get potential parents
        isEdit ? getCategoryById(id) : Promise.resolve(null),
    ])

    const allCategories = categoriesRes?.data ?? []
    
    // exclude the current category from being its own parent
    const validParents = allCategories.filter(cat => cat.id !== id);

    if (isEdit && !category) notFound()

    return (
        <PageComponent
            id={isEdit ? id : undefined}
            initialParents={validParents}
            initialCategory={category}
        />
    )
}
