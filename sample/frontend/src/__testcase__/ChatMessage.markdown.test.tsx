// __tests__/ChatMessage.markdown.test.tsx
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../components/ChatMessage'; // adjust path

// Mock react-markdown and its plugins to bypass ESM issues
jest.mock('react-markdown', () => ({ children }: any) => <div>{children}</div>);
jest.mock('remark-gfm', () => jest.fn());
jest.mock('remark-breaks', () => jest.fn());

describe('ChatMessage Markdown rendering', () => {
  test('renders message content correctly', () => {
    const markdown = `
This is a paragraph.

- item 1
- item 2

\`\`\`
const x = 1;
console.log(x);
\`\`\`
    `;

    render(<ChatMessage message={markdown} isUser={false} />);

    // The content is passed through the mocked ReactMarkdown, so children text exists
    expect(screen.getByText(/This is a paragraph/i)).toBeInTheDocument();
    expect(screen.getByText(/item 1/i)).toBeInTheDocument();
    expect(screen.getByText(/item 2/i)).toBeInTheDocument();
    expect(screen.getByText(/const x = 1;/i)).toBeInTheDocument();
    expect(screen.getByText(/console.log\(x\);/i)).toBeInTheDocument();
  });

  test('preserves single line breaks as text', () => {
    const md = 'Line one\nLine two';
    render(<ChatMessage message={md} isUser={false} />);
    expect(screen.getByText(/Line one/)).toBeInTheDocument();
    expect(screen.getByText(/Line two/)).toBeInTheDocument();
  });
});
