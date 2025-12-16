"use client"

import * as React from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod"
import {useRouter} from "next/navigation"

import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Badge} from "@/components/ui/badge"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {Switch} from "@/components/ui/switch"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {generateSlug} from "@/lib/utils"
import {createProduct, getProductById, updateProduct,} from "@/app/server_action/products"
import {APP_ROUTE} from "@/lib/route"
import {ProductCategoryMaxAggregateOutputType} from "@/prisma/prisma/models/ProductCategory";
import {getCategories} from "@/app/server_action/categories";
import {MediaSelector} from "@/app/admin/components/MediaSelector";

const productSchema = z.object({
    name: z.string().min(2, "Product name is required"),
    sku: z.string().min(1, "SKU is required"),
    slug: z.string().optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(0),
    discount: z.coerce.number().min(0),
    quantity: z.coerce.number().min(0),
    categoryId: z.string().min(1, "category is required"),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
})

export type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
    id?: string
}

export default function ProductForm({id}: ProductFormProps) {
    const router = useRouter()
    const isEdit = Boolean(id)
    const [categories, setCategories] = React.useState<ProductCategoryMaxAggregateOutputType[]>([])

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            sku: "",
            slug: "",
            description: "",
            price: 0,
            discount: 0,
            quantity: 0,
            categoryId: "",
            isActive: true,
            isFeatured: false,
        },
    })

    const {handleSubmit, watch, reset, formState} = form

    const nameValue = watch("name")
    const priceValue = watch("price")
    const discountValue = watch("discount")
    const finalPrice = Math.max(0, priceValue - discountValue)

    React.useEffect(() => {
        const currentSlug = form.getValues("slug")
        if (!currentSlug && nameValue) {
            form.setValue("slug", generateSlug(nameValue))
        }
    }, [nameValue, form])

    React.useEffect(() => {
        if (!id) return

        const loadProduct = async () => {
            try {
                const product = await getProductById(id)
                if (!product) return
                reset({
                    name: product.name,
                    sku: product.sku,
                    slug: product.slug,
                    description: product.description ?? "",
                    price: Number(product.price),
                    discount: Number(product.discount),
                    quantity: Number(product.quantity),
                    categoryId: product.categoryId,
                    isActive: product.isActive,
                    isFeatured: product.isFeatured,
                })
            } catch (error) {
                console.error("Failed to load product:", error)
            }
        }

        loadProduct()
    }, [id, reset])
    React.useEffect(() => {
        const loadCategories = async () => {
            try {
                const categories = await getCategories()
                if (!categories) return
                setCategories(categories.data)
            } catch (error) {
                console.error("Failed to load product:", error)
            }
        }

        loadCategories()
    }, [id])


// Mock functions - replace with your actual API calls
    async function searchMedia(query: string){
        // Call your backend API
        const response = await fetch(`/api/media/search?q=${query}`)
        return response.json()
    }

    async function uploadMedia(file: File) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/media/upload", {
            method: "POST",
            body: formData,
        })
        return response.json()
    }

    const onSubmit = async (values: ProductFormValues) => {
        try {
            const payload = {
                ...values,
                slug: values.slug || generateSlug(values.name),
            }

            if (isEdit && id) {
                await updateProduct(id, payload)
            } else {
                await createProduct(payload)
            }

            router.push(APP_ROUTE.ADMIN_PRODUCTS)
        } catch (error) {
            console.error("Failed to save product:", error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                            {isEdit ? "Edit Product" : "Create Product"}
                        </h1>
                        <p className="mt-2 text-base text-slate-600">
                            {isEdit ? "Update product information and details" : "Add a new product to your catalog"}
                        </p>
                    </div>
                    <Badge
                        variant={watch("isActive") ? "default" : "secondary"}
                        className="mt-1 text-sm px-3 py-1.5 font-medium"
                    >
                        {watch("isActive") ? "Active" : "Draft"}
                    </Badge>
                </div>

                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* General Information Card */}
                            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader
                                    className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                                    <CardTitle>General Information</CardTitle>
                                    <CardDescription>Basic product details and description</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-slate-900">Product
                                                    Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter product name"
                                                        className="border-slate-300 bg-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="sku"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel
                                                        className="text-sm font-semibold text-slate-900">SKU</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g., PROD-001"
                                                            className="border-slate-300 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="slug"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold text-slate-900">URL
                                                        Slug</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="auto-generated"
                                                            disabled
                                                            className="border-slate-300 bg-slate-50 text-slate-600 cursor-not-allowed opacity-75"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <p className="text-xs text-slate-500 mt-1.5">Auto-generated from
                                                        product name</p>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel
                                                    className="text-sm font-semibold text-slate-900">Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        rows={6}
                                                        placeholder="Detailed product description, features, and benefits..."
                                                        className="border-slate-300 placeholder:text-slate-400 resize-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Pricing & Inventory Card */}
                            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader
                                    className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                                    <CardTitle>Pricing & Inventory</CardTitle>
                                    <CardDescription>Set prices and manage stock levels</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-6">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel
                                                        className="text-sm font-semibold text-slate-900">Price</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <span
                                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                className="pl-7 border-slate-300 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-transparent transition-all"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="discount"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel
                                                        className="text-sm font-semibold text-slate-900">Discount</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <span
                                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                className="pl-7 border-slate-300 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-transparent transition-all"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold text-slate-900">Final
                                                Price</FormLabel>
                                            <div
                                                className="flex items-center justify-center h-10 rounded-lg border border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
                        <span className="text-sm font-bold text-slate-900">
                          ${finalPrice.toFixed(2)}
                        </span>
                                            </div>
                                        </FormItem>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-slate-900">Stock
                                                    Quantity</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        className="border-slate-300 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-transparent transition-all"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>


                            <MediaSelector
                                control={form.control}
                                fieldName="featuredImageId"
                                label="Featured Image"
                                description="Select a featured image for your product"
                                multiple={false}
                                accept="image/*"
                                onSearch={searchMedia}
                                onUpload={uploadMedia}
                                onMediaSelect={(media) => {
                                    const mediaItem = media
                                    console.log("Featured image selected:", mediaItem.originalName)
                                }}
                            />

                            {/* Product Gallery - Multiple Selection */}
                            <MediaSelector
                                control={form.control}
                                fieldName="mediaIds"
                                label="Product Gallery"
                                description="Add multiple images to your product gallery (max 10)"
                                multiple={true}
                                accept="image/*"
                                maxItems={10}
                                onSearch={searchMedia}
                                onUpload={uploadMedia}
                                onMediaSelect={(media) => {
                                    const mediaItems = media
                                    console.log(`Selected ${mediaItems.length} media items`)
                                }}
                            />

                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Organization Card */}
                            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader
                                    className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                                    <CardTitle>Organization</CardTitle>
                                    <CardDescription>Categorize product</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel
                                                    className="text-sm font-semibold text-slate-900">Category</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger
                                                            className="border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
                                                            <SelectValue placeholder="Select a category"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map((cat) => (
                                                            <SelectItem key={cat.id} value={cat.id as string}>
                                                                {cat.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Status Card */}
                            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader
                                    className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                                    <CardTitle>Status</CardTitle>
                                    <CardDescription>Visibility & features</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-6">
                                    <FormField
                                        control={form.control}
                                        name="isActive"
                                        render={({field}) => (
                                            <div
                                                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3.5 hover:bg-slate-100 transition-colors">
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-slate-900">Product
                                                        Active</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Make product visible to
                                                        customers</p>
                                                </div>
                                                <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                            </div>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isFeatured"
                                        render={({field}) => (
                                            <div
                                                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3.5 hover:bg-slate-100 transition-colors">
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-slate-900">Featured</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Highlight on
                                                        storefront</p>
                                                </div>
                                                <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                            </div>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="space-y-3 sticky bottom-6">
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                                    disabled={formState.isSubmitting}
                                >
                                    {formState.isSubmitting ? (
                                        <>
                                            <div
                                                className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                                            Saving...
                                        </>
                                    ) : isEdit ? (
                                        "Update Product"
                                    ) : (
                                        "Create Product"
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-all"
                                    onClick={() => router.push(APP_ROUTE.ADMIN_PRODUCTS)}
                                    type="button"
                                >
                                    Cancel
                                </Button>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                                <p className="text-xs text-blue-700 font-medium">
                                    💾 Saved automatically via server actions
                                </p>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}