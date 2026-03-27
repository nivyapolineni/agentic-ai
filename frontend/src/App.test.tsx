import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />);
    expect(screen.getByText(/Document Auto-Fill Agent/i)).toBeDefined();
  });

  it('renders the upload section', () => {
    render(<App />);
    expect(screen.getByText(/Step 1: Upload Passport \/ Identity Document/i)).toBeDefined();
  });

  it('renders form fields', () => {
    render(<App />);
    expect(screen.getByLabelText(/First Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Last Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Date of Birth/i)).toBeDefined();
    expect(screen.getByLabelText(/Nationality/i)).toBeDefined();
    expect(screen.getByLabelText(/Passport Number/i)).toBeDefined();
  });

  it('renders G-28 preview', () => {
    render(<App />);
    expect(screen.getByText(/G-28 Form Preview/i)).toBeDefined();
  });
});
