'use client'; // Mark as a client component

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {cn} from "@/lib/utils"; // Utility for conditional classes

interface NavLinkProps {
    activeClassName?: string;
    className?: string;
    href: string;
    children: React.ReactNode;
}

const NavLink = ({href, children, activeClassName, className}: NavLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={cn(
                className,
                isActive
                && cn(activeClassName)
            )}
        >
            {children}
        </Link>
    );
};

export default NavLink;
