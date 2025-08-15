import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ChatInput} from '../components/ChatInput';

describe('ChatInput component', () => {
  test('calls onSendMessage when user types and presses Enter or clicks Send', async () => {
    const onSend = jest.fn();
    render(<ChatInput onSendMessage={onSend} disabled={false} />);

    // Get textarea/input by placeholder or role
    const input = screen.getByPlaceholderText('Message ChatGPT...'); 
    // or: const input = screen.getByRole('textbox');

    // Type a message
    await userEvent.type(input, 'hello world');
    // Simulate pressing Enter
    await userEvent.keyboard('{Enter}');

    // Check that onSendMessage was called
    expect(onSend).toHaveBeenCalled();
  });
});
