"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { generateSlug } from "@/lib/utils";
import { APP_ROUTE } from "@/lib/route";
import Editor from "@/app/admin/components/rich-editor";
import {
    CreateCategoryInput,
    createCategorySchema,
    UpdateCategoryInput,
    updateCategorySchema,
} from "@/app/zod/categories";
import { createCategory, updateCategory } from "@/app/server_action/categories";
import { ProductCategory } from "@/prisma/prisma/client";

type PageComponentProps = {
    id?: string;
    initialParents: ProductCategory[];
    initialCategory: ProductCategory | null;
};

export default function CategoryFormPage({
                                             id,
                                             initialParents,
                                             initialCategory,
                                         }: PageComponentProps) {
    const router = useRouter();
    const isEdit = Boolean(id);

    const formSchema = isEdit ? updateCategorySchema : createCategorySchema;

    const form = useForm<any>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: initialCategory?.name ?? "",
            slug: initialCategory?.slug ?? "",
            description: initialCategory?.description ?? "",
            image: initialCategory?.image ?? "",
            parentId: initialCategory?.parentId ?? "",
        } as CreateCategoryInput,
    });

    const { handleSubmit, watch, formState } = form;

    // Auto-generate slug
    React.useEffect(() => {
        const name = form.getValues("name");
        const slug = form.getValues("slug");

        if (!slug && name) {
            form.setValue("slug", generateSlug(name), { shouldDirty: true });
        }
    }, [watch("name"), form]);

    const onSubmit = async (values: CreateCategoryInput) => {
        try {
            const payload = {
                ...values,
                slug: values.slug || generateSlug(values.name),
                parentId: values.parentId === "none" ? null : values.parentId,
            };

            if (isEdit && id) {
                await updateCategory(id, payload as UpdateCategoryInput);
            } else {
                await createCategory(payload as CreateCategoryInput);
            }

            router.push(APP_ROUTE.ADMIN_CATEGORIES);
        } catch (error) {
            console.error("Failed to save category:", error);
        }
    };

    const handleCancel = () => {
        router.push(APP_ROUTE.ADMIN_CATEGORIES);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                            {isEdit ? "Edit Category" : "Create Category"}
                        </h1>
                        <p className="mt-2 text-base text-slate-600">
                            {isEdit
                                ? "Update category information and details"
                                : "Add a new category to your store"}
                        </p>
                    </div>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="grid gap-8 lg:grid-cols-3"
                    >
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                                    <CardTitle>General Information</CardTitle>
                                    <CardDescription>Basic category details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-slate-900">
                                                    Category Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter category name"
                                                        className="border-slate-300 bg-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all"
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
                                                    Auto-generated from category name
                                                </p>
                                            </FormItem>
                                        )}
                                    />

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
                                                        content={field.value ?? ""}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={form.control}
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-slate-900">
                                                    Image URL
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="https://example.com/image.jpg"
                                                        className="border-slate-300 bg-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                                    <CardTitle>Organization</CardTitle>
                                    <CardDescription>Hierarchy and parent category</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <FormField
                                        control={form.control}
                                        name="parentId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Parent Category</FormLabel>
                                                <Select value={field.value ?? "none"} onValueChange={field.onChange}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select parent category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">None (Top Level)</SelectItem>
                                                        {initialParents.map((cat) => (
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

                            <div className="space-y-3 sticky bottom-6">
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                                    disabled={formState.isSubmitting}
                                >
                                    {formState.isSubmitting ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Saving...
                                        </>
                                    ) : isEdit ? (
                                        "Update Category"
                                    ) : (
                                        "Create Category"
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-all"
                                    onClick={handleCancel}
                                    type="button"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
