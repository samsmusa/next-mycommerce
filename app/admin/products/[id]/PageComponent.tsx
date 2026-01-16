"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { generateSlug } from "@/lib/utils";
import { createProduct, updateProduct } from "@/app/server_action/products";
import { APP_ROUTE } from "@/lib/route";
import MediaSelector from "@/app/admin/components/mediaSelector2";
import Editor from "@/app/admin/components/rich-editor";
import { getMediaByName } from "@/app/server_action/media";
import {
    CreateProductInput,
    createProductSchema,
    UpdateProductInput,
    updateProductSchema,
} from "@/app/zod/products";
import { Product } from "@/app/types/product";
import {ProductCategory} from "@/prisma/prisma/client";

// ============================================================================
// TYPES
// ============================================================================

type RichTextEditorHandle = {
    getContent: () => string;
};

type ProductFormValues = CreateProductInput;

type PageComponentProps = {
    id?: string;
    initialCategories: ProductCategory[];
    initialProduct: Product | null;
};

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

interface GeneralInformationCardProps {
    form: UseFormReturn<ProductFormValues>;
}

const GeneralInformationCard: React.FC<GeneralInformationCardProps> = ({
                                                                           form,
                                                                       }) => (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
            <CardTitle>General Information</CardTitle>
            <CardDescription>Basic product details and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-900">
                            Product Name
                        </FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Enter product name"
                                className="border-slate-300 bg-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid gap-4 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-semibold text-slate-900">
                                SKU
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., PROD-001"
                                    className="border-slate-300 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-semibold text-slate-900">
                                URL Slug
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="auto-generated"
                                    disabled
                                    className="border-slate-300 bg-slate-50 text-slate-600 cursor-not-allowed opacity-75"
                                    {...field}
                                />
                            </FormControl>
                            <p className="text-xs text-slate-500 mt-1.5">
                                Auto-generated from product name
                            </p>
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-900">
                            Description
                        </FormLabel>
                        <FormControl>
                            <Editor
                                {...field}
                                content={field.value}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </CardContent>
    </Card>
);

interface PricingInventoryCardProps {
    form: UseFormReturn<ProductFormValues>;
    finalPrice: number;
}

const PricingInventoryCard: React.FC<PricingInventoryCardProps> = ({
                                                                       form,
                                                                       finalPrice,
                                                                   }) => (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
            <CardTitle>Pricing & Inventory</CardTitle>
            <CardDescription>Set prices and manage stock levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
            <div className="grid gap-4 md:grid-cols-3">
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-semibold text-slate-900">
                                Price
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                    $
                  </span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="pl-7 border-slate-300 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-transparent transition-all"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-semibold text-slate-900">
                                Discount
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                    $
                  </span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="pl-7 border-slate-300 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-transparent transition-all"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-900">
                        Final Price
                    </FormLabel>
                    <div className="flex items-center justify-center h-10 rounded-lg border border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
            <span className="text-sm font-bold text-slate-900">
              ${finalPrice.toFixed(2)}
            </span>
                    </div>
                </FormItem>
            </div>

            <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-900">
                            Stock Quantity
                        </FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                placeholder="0"
                                className="border-slate-300 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-transparent transition-all"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </CardContent>
    </Card>
);

interface OrganizationCardProps {
    form: UseFormReturn<ProductFormValues>;
    categories: ProductCategory[];
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({
                                                               form,
                                                               categories,
                                                           }) => (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
            <CardTitle>Organization</CardTitle>
            <CardDescription>Categorize product</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
            <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </CardContent>
    </Card>
);

interface StatusCardProps {
    form: UseFormReturn<ProductFormValues>;
}

const StatusCard: React.FC<StatusCardProps> = ({ form }) => (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
            <CardTitle>Status</CardTitle>
            <CardDescription>Visibility & features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
            <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3.5 hover:bg-slate-100 transition-colors">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                                Product Active
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Make product visible to customers
                            </p>
                        </div>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                )}
            />

            <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3.5 hover:bg-slate-100 transition-colors">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">Featured</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Highlight on storefront
                            </p>
                        </div>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                )}
            />
        </CardContent>
    </Card>
);

interface ActionButtonsProps {
    isSubmitting: boolean;
    isEdit: boolean;
    onCancel: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
                                                         isSubmitting,
                                                         isEdit,
                                                         onCancel,
                                                     }) => (
    <div className="space-y-3 sticky bottom-6">
        <Button
            type="submit"
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            disabled={isSubmitting}
        >
            {isSubmitting ? (
                <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
            onClick={onCancel}
            type="button"
        >
            Cancel
        </Button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-700 font-medium">
                💾 Saved automatically via server actions
            </p>
        </div>
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProductFormPage({
                                            id,
                                            initialCategories,
                                            initialProduct,
                                        }: PageComponentProps) {
    const router = useRouter();
    const isEdit = Boolean(id);
    const editorRef = useRef<RichTextEditorHandle>(null);

    // Form setup with proper schema
    const formSchema = isEdit ? updateProductSchema : createProductSchema;

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialProduct?.name ?? "",
            sku: initialProduct?.sku ?? "",
            slug: initialProduct?.slug ?? "",
            description: initialProduct?.description ?? "",
            price: initialProduct?.price ?? 0,
            discount: initialProduct?.discount ?? 0,
            quantity: initialProduct?.quantity ?? 0,
            categoryId: initialProduct?.categoryId ?? "",
            isActive: initialProduct?.isActive ?? true,
            isFeatured: initialProduct?.isFeatured ?? false,
            coverImageId: initialProduct?.coverImageId ?? "",
            mediaIds: [],
            ...(isEdit ? {} : { createdBy: "cmj8e1loz00013ucr0uwcwgpd" }),
        } as ProductFormValues,
    });

    const { handleSubmit, watch, formState, setValue } = form;
    const price = watch("price");
    const discount = watch("discount");
    const isActive = watch("isActive");

    // Memoized calculations
    const finalPrice = useMemo(() => Math.max(0, price - discount), [
        price,
        discount,
    ]);

    // Auto-generate slug
    React.useEffect(() => {
        const name = form.getValues("name");
        const slug = form.getValues("slug");

        if (!slug && name) {
            form.setValue("slug", generateSlug(name), { shouldDirty: true });
        }
    }, [watch("name"), form]);

    // API calls
    const searchMedia = useCallback(async (query: string) => {
        try {
            const response = await getMediaByName(query);
            return response.data || [];
        } catch (error) {
            console.error("Media search error:", error);
            return [];
        }
    }, []);

    const uploadMedia = useCallback(async (file: File) => {
        try {
            // TODO: Implement media upload
            console.log("Uploading media:", file.name);
        } catch (error) {
            console.error("Media upload error:", error);
            throw error;
        }
    }, []);

    // Form submission
    const onSubmit = async (values: ProductFormValues) => {
        console.log("values", values)
        try {
            const payload = {
                ...values,
                slug: values.slug || generateSlug(values.name),
            };

            if (isEdit && id) {
                await updateProduct(id, payload);
            } else {
                // For create, createdBy should be set from session/auth
                await createProduct(payload as CreateProductInput);
            }

            router.push(APP_ROUTE.ADMIN_PRODUCTS);
        } catch (error) {
            console.error("Failed to save product:", error);
            // TODO: Add toast notification for error
        }
    };

    const handleCancel = () => {
        router.push(APP_ROUTE.ADMIN_PRODUCTS);
    };

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
                            {isEdit
                                ? "Update product information and details"
                                : "Add a new product to your catalog"}
                        </p>
                    </div>
                    <Badge
                        variant={isActive ? "default" : "secondary"}
                        className="mt-1 text-sm px-3 py-1.5 font-medium"
                    >
                        {isActive ? "Active" : "Draft"}
                    </Badge>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="grid gap-8 lg:grid-cols-3"
                    >
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            <GeneralInformationCard form={form} />
                            <PricingInventoryCard form={form} finalPrice={finalPrice} />

                            <MediaSelector
                                control={form.control}
                                name="coverImageId"
                                label="Featured Image"
                                description="Select a featured image for your product"
                                multiple={false}
                                accept="image/*"
                            />
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <OrganizationCard form={form} categories={initialCategories} />
                            <StatusCard form={form} />
                            <ActionButtons
                                isSubmitting={formState.isSubmitting}
                                isEdit={isEdit}
                                onCancel={handleCancel}
                            />
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}