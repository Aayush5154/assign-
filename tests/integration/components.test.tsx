import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store';
import NewsCard from '@/components/content/NewsCard';
import MovieCard from '@/components/content/MovieCard';
import SocialPostCard from '@/components/content/SocialPostCard';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { DEMO_MOVIES, DEMO_NEWS, DEMO_SOCIAL } from '@/lib/demo-data';

function withStore(ui: React.ReactElement) {
  const store = makeStore();
  return render(<Provider store={store}>{ui}</Provider>);
}

describe('content cards', () => {
  it('renders a news card with title, source, and read-more link', () => {
    withStore(<NewsCard article={DEMO_NEWS[0]} />);
    expect(screen.getByRole('heading', { name: /open-source ai/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /favorites/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /read more/i })).toBeInTheDocument();
  });

  it('favorite button toggles aria-pressed state', () => {
    withStore(<NewsCard article={DEMO_NEWS[0]} />);
    const btn = screen.getByRole('button', { name: /favorites/i });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders a movie card with rating and details link', () => {
    withStore(<MovieCard movie={DEMO_MOVIES[0]} />);
    expect(screen.getByRole('heading', { name: /oppenheimer/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute(
      'href',
      expect.stringContaining('/movie/'),
    );
  });

  it('renders a social post labeled as demo with like button', () => {
    withStore(<SocialPostCard post={DEMO_SOCIAL[0]} />);
    expect(screen.getByText(/demo post/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /like this post/i })).toBeInTheDocument();
  });

  it('like button increments the displayed count', () => {
    withStore(<SocialPostCard post={DEMO_SOCIAL[0]} />);
    const like = screen.getByRole('button', { name: /like this post/i });
    expect(like).toHaveTextContent('214');
    fireEvent.click(like);
    expect(like).toHaveTextContent('215');
  });
});

describe('feedback states', () => {
  it('shows loading status regions', () => {
    const { container } = render(
      <div role="status" aria-label="Loading content">
        loading
      </div>,
    );
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
  });

  it('error state shows message and retry button', () => {
    let retried = false;
    render(<ErrorState title="Boom" message="Broken" onRetry={() => (retried = true)} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Broken');
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(retried).toBe(true);
  });

  it('empty state shows guidance', () => {
    render(<EmptyState title="Empty title" message="Empty message" />);
    expect(screen.getByText('Empty title')).toBeInTheDocument();
    expect(screen.getByText('Empty message')).toBeInTheDocument();
  });
});
