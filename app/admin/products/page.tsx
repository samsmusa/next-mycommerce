import React from "react";
import ProductList from "@/app/admin/products/components/ProductList";


// type ModelName = Prisma.ModelName;
export default function ProductHome() {
    return (
        <div className="w-full">
            <ProductList/>
        </div>
    )
}