import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Logo } from './Logo';

// Helper to wrap components with necessary providers
const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {ui}
            </BrowserRouter>
        </QueryClientProvider>
    );
};

describe('Logo', () => {
    it('renders the logo image', () => {
        renderWithProviders(<Logo />);
        const logoImage = screen.getByRole('img', { name: /mumtaz health/i });
        expect(logoImage).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
        const { rerender } = renderWithProviders(<Logo size="sm" />);
        let logo = screen.getByRole('img', { name: /mumtaz health/i });
        expect(logo).toBeInTheDocument();

        rerender(
            <QueryClientProvider client={new QueryClient()}>
                <BrowserRouter>
                    <Logo size="lg" />
                </BrowserRouter>
            </QueryClientProvider>
        );
        logo = screen.getByRole('img', { name: /mumtaz health/i });
        expect(logo).toBeInTheDocument();
    });

    it('links to homepage by default', () => {
        renderWithProviders(<Logo />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/');
    });
});
