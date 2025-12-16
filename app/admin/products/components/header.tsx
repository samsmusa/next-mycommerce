"use client"
import React from 'react';
import {usePathname} from "next/navigation";
import {SidebarTrigger} from "@/components/ui/sidebar";

const Header = () => {
    const pathname = usePathname()
    return (
        <header
            className="h-16 bg-primary flex items-center justify-between px-6 md:px-8 w-full">

            <SidebarTrigger/>
            <h2 className="text-lg font-medium text-gray-800">
                {pathname.includes('new') ? 'Add Product' : pathname.includes('edit') ? 'Edit Product' : 'Products'}
                add
            </h2>
            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                    <span className="sr-only">Notifications</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                </button>
            </div>
        </header>
    );
};


export default Header;