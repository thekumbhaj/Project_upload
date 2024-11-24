import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PageChatDetail from './PageChatDetail';

describe('<PageChatDetail />', () => {
  test('it should mount', () => {
    render(<PageChatDetail />);

    const pageChatDetail = screen.getByTestId('PageChatDetail');

    expect(pageChatDetail).toBeInTheDocument();
  });
});