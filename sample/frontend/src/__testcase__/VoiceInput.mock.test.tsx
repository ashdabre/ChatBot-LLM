// __tests__/VoiceInput.mock.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../components/ChatInput';

// Mock global MediaRecorder
class MockRecorder {
  ondataavailable: any = null;
  onstop: any = null;
  start() {}
  stop() {
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['dummy audio'], { type: 'audio/webm' }) });
    }
    if (this.onstop) this.onstop();
  }
}

// Mock getUserMedia
beforeAll(() => {
  // @ts-ignore
  global.MediaRecorder = MockRecorder;
  // @ts-ignore
  global.navigator.mediaDevices = { getUserMedia: jest.fn().mockResolvedValue({ getTracks: () => [{ stop: jest.fn() }] }) };
});

afterAll(() => {
  // cleanup
  // @ts-ignore
  delete global.MediaRecorder;
});

test('records voice and triggers onSendMessage', async () => {
  const onSend = jest.fn();
  render(<ChatInput onSendMessage={onSend} />);

  // The voice recording button is the one with role="button" and Mic icon
  const buttons = screen.getAllByRole('button');
  const voiceButton = buttons[buttons.length - 2]; // second last button is voice record

  await userEvent.click(voiceButton); // start recording
  await userEvent.click(voiceButton); // stop recording

  // Give async events a tick
  await new Promise((r) => setTimeout(r, 50));

  expect(onSend).toHaveBeenCalled();
  expect(onSend.mock.calls[0][1]).toBe('voice'); // second arg is type
});
