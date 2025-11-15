'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/shadcn-button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { useAuth } from '../../contexts/AuthContext';
import NotificationsDropdown from '../NotificationsDropdown';

export function Header() {
    const [open, setOpen] = React.useState(false);
    const scrolled = useScroll(10);
    const { user, organization, profile } = useAuth();
    const [visible, setVisible] = React.useState(true);
    const [lastScrollY, setLastScrollY] = React.useState(0);

    React.useEffect(() => {
        const controlNavbar = () => {
            const currentScrollY = window.scrollY;
            const heroHeight = window.innerHeight; // Approximate hero section height (full viewport)

            // Always show while in the hero section
            if (currentScrollY < heroHeight) {
                setVisible(true);
            } else {
                // After hero section: hide when scrolling down, show when scrolling up
                if (currentScrollY > lastScrollY) {
                    setVisible(false);
                } else {
                    setVisible(true);
                }
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', controlNavbar);
        return () => window.removeEventListener('scroll', controlNavbar);
    }, [lastScrollY]);

    // Build navigation links based on auth state
    const links = user ? [
        {
            label: 'Dashboard',
            href: '/dashboard',
        },
        {
            label: 'Tournaments',
            href: '/tournaments',
        },
        ...(organization ? [{
            label: 'Players',
            href: '/players',
        }] : []),
        {
            label: 'Tryouts',
            href: '/tryouts',
        },
        {
            label: 'Calendar',
            href: '/calendar',
        },
    ] : [];

    React.useEffect(() => {
        if (open) {
            // Disable scroll
            document.body.style.overflow = 'hidden';
        } else {
            // Re-enable scroll
            document.body.style.overflow = '';
        }

        // Cleanup when component unmounts (important for Next.js)
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <header
            className={cn(
                'sticky z-50 mx-auto w-full max-w-5xl border-b border-transparent md:rounded-md md:border transition-all duration-500 ease-in-out',
                {
                    'top-0': visible,
                    '-top-24': !visible,
                    'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg md:top-4 md:max-w-4xl md:shadow':
                        scrolled && !open && visible,
                    'md:-top-24': !visible,
                    'bg-background/90': open,
                },
            )}
        >
            <nav
                className={cn(
                    'flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:duration-500 md:ease-in-out',
                    {
                        'md:px-2': scrolled,
                    },
                )}
            >
                <Link to="/" className="group flex items-center gap-2">
                    <img
                        src="/rosterup-logo no text.png"
                        alt="RosterUp Icon"
                        className="w-8 h-8 object-contain"
                    />
                    <span className="text-3xl font-bold text-[rgb(29,29,31)] group-hover:text-[rgb(0,113,227)] transition-colors tracking-wide" style={{ fontFamily: 'BebasNeue, sans-serif' }}>
                        Roster Up
                    </span>
                </Link>
                <div className="hidden items-center gap-3 md:flex">
                    {user ? (
                        <>
                            <Link to="/search" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
                                <Search className="h-5 w-5" />
                            </Link>
                            {links.map((link, i) => (
                                <Link key={i} className={buttonVariants({ variant: 'ghost', className: 'font-semibold' })} to={link.href}>
                                    {link.label}
                                </Link>
                            ))}
                            <NotificationsDropdown />
                            <Link to="/profile" className="flex items-center">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt={profile.full_name || 'User'}
                                        className="h-9 w-9 rounded-full object-cover border-2 border-border hover:border-foreground/30 transition-colors"
                                    />
                                ) : (
                                    <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold border-2 border-border hover:border-foreground/30 transition-colors">
                                        {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="outline" className="font-semibold">Sign In</Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="font-semibold">Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>
                <Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden">
                    <MenuToggleIcon open={open} className="size-5" duration={300} />
                </Button>
            </nav>

            <div
                className={cn(
                    'bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden transition-opacity duration-300',
                    open ? 'block opacity-100' : 'hidden opacity-0',
                )}
            >
                <div
                    data-slot={open ? 'open' : 'closed'}
                    className={cn(
                        'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=open]:duration-500 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 data-[slot=closed]:duration-300 ease-in-out',
                        'flex h-full w-full flex-col justify-between gap-y-2 p-4',
                    )}
                >
                    <div className="grid gap-y-2">
                        {links.map((link) => (
                            <Link
                                key={link.label}
                                className={buttonVariants({
                                    variant: 'ghost',
                                    className: 'justify-start font-semibold text-base',
                                })}
                                to={link.href}
                                onClick={() => setOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {user && (
                            <>
                                <Link
                                    className={buttonVariants({
                                        variant: 'ghost',
                                        className: 'justify-start font-semibold text-base',
                                    })}
                                    to="/profile"
                                    onClick={() => setOpen(false)}
                                >
                                    Profile
                                </Link>
                                <Link
                                    className={buttonVariants({
                                        variant: 'ghost',
                                        className: 'justify-start font-semibold text-base',
                                    })}
                                    to="/settings"
                                    onClick={() => setOpen(false)}
                                >
                                    Settings
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        {!user ? (
                            <>
                                <Link to="/login" onClick={() => setOpen(false)}>
                                    <Button variant="outline" className="w-full">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/signup" onClick={() => setOpen(false)}>
                                    <Button className="w-full">Get Started</Button>
                                </Link>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    );
}
