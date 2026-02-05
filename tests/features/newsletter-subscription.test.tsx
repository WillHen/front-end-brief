import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupForm } from '@/components/SignupForm';

describe('Newsletter Subscription Flow', () => {
  it('should successfully subscribe a new user', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    // User enters email
    const emailInput = screen.getByPlaceholderText('Enter your email');
    await user.type(emailInput, 'newuser@example.com');

    // User clicks subscribe button
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
    await user.click(subscribeButton);

    // Success message appears
    await waitFor(() => {
      expect(screen.getByText(/successfully subscribed/i)).toBeInTheDocument();
    });

    // Email input is cleared
    expect(emailInput).toHaveValue('');
  });

  it('should show error when email is already subscribed', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    // User enters already subscribed email
    const emailInput = screen.getByPlaceholderText('Enter your email');
    await user.type(emailInput, 'test@example.com');

    // User clicks subscribe button
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
    await user.click(subscribeButton);

    // Error message appears
    await waitFor(() => {
      expect(screen.getByText(/already subscribed/i)).toBeInTheDocument();
    });

    // Email input is not cleared
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i });

    // Try to submit with invalid email
    await user.type(emailInput, 'invalid-email');
    await user.click(subscribeButton);

    // HTML5 validation should prevent submission
    // The form should not show any success/error messages
    expect(
      screen.queryByText(/successfully subscribed/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('should disable form during submission', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i });

    await user.type(emailInput, 'newuser2@example.com');

    // Click and immediately check for disabled state
    const clickPromise = user.click(subscribeButton);

    // Check loading state appears
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /subscribing/i })
      ).toBeInTheDocument();
    });

    // Wait for submission to complete
    await clickPromise;

    // Wait for form to be enabled again
    await waitFor(() => {
      expect(emailInput).not.toBeDisabled();
      expect(
        screen.getByRole('button', { name: /subscribe/i })
      ).toBeInTheDocument();
    });
  });

  it('should handle network errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock fetch to throw network error
    const originalFetch = global.fetch;
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    render(<SignupForm />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    await user.type(emailInput, 'test@example.com');

    const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
    await user.click(subscribeButton);

    // Network error message should appear
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    // Restore original fetch
    global.fetch = originalFetch;
  });

  it('should clear previous messages when submitting again', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i });

    // First submission with existing email
    await user.type(emailInput, 'test@example.com');
    await user.click(subscribeButton);

    await waitFor(() => {
      expect(screen.getByText(/already subscribed/i)).toBeInTheDocument();
    });

    // Clear and submit with new email
    await user.clear(emailInput);
    await user.type(emailInput, 'newuser@example.com');
    await user.click(subscribeButton);

    // Old error should be cleared during loading
    expect(screen.queryByText(/already subscribed/i)).not.toBeInTheDocument();

    // New success message should appear
    await waitFor(() => {
      expect(screen.getByText(/successfully subscribed/i)).toBeInTheDocument();
    });
  });

  it('should require email field to be filled', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const subscribeButton = screen.getByRole('button', { name: /subscribe/i });

    // Try to submit without email
    await user.click(subscribeButton);

    // No API call should be made, no messages shown
    expect(
      screen.queryByText(/successfully subscribed/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});
