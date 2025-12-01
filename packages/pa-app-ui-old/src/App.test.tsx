import React from '../$node_modules/@types/react/index.js';
import { render } from '../$node_modules/@types/testing-library__react/index.js';
import App from './App';

test('renders JointJS paper', () => {
	render(<App />);
	const paper = document.querySelector('.joint-paper');
	expect(paper).toBeInTheDocument();
});
