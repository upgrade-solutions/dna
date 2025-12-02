/**
 * Inspector Dark Theme Styles
 */

export const inspectorStyles = `
.inspector-container .joint-inspector {
  background: #1e1e1e;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
  font-size: 13px;
}

.inspector-container .joint-inspector .group {
  border: 1px solid #333;
  border-radius: 6px;
  margin-bottom: 12px;
  background: #252525;
  overflow: hidden;
}

.inspector-container .joint-inspector .group-label {
  background: #252525;
  color: #e0e0e0;
  font-weight: 600;
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #333;
  user-select: none;
}

.inspector-container .joint-inspector .group-label:hover {
  background: #333;
}

.inspector-container .joint-inspector .field {
  padding: 10px 12px;
  border-bottom: 1px solid #333;
}

.inspector-container .joint-inspector .field:last-child {
  border-bottom: none;
}

.inspector-container .joint-inspector .field-label {
  color: #999;
  font-size: 12px;
  margin-bottom: 6px;
  display: block;
}

.inspector-container .joint-inspector input[type="text"],
.inspector-container .joint-inspector input[type="number"],
.inspector-container .joint-inspector input[type="color"],
.inspector-container .joint-inspector textarea,
.inspector-container .joint-inspector select {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  color: #e0e0e0;
  padding: 6px 8px;
  width: 100%;
  font-size: 13px;
  transition: border-color 0.2s, background 0.2s;
}

.inspector-container .joint-inspector input:focus,
.inspector-container .joint-inspector textarea:focus,
.inspector-container .joint-inspector select:focus {
  outline: none;
  border-color: #4a9eff;
  background: #2d2d2d;
}

.inspector-container .joint-inspector input[type="color"] {
  height: 32px;
  cursor: pointer;
  padding: 2px;
}

.inspector-container .joint-inspector select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 28px;
}

.inspector-container::-webkit-scrollbar {
  width: 8px;
}

.inspector-container::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.inspector-container::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

.inspector-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.tabs-container {
  display: flex;
  border-bottom: 1px solid #333;
  background: #252525;
}

.tab-button {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #999;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: #e0e0e0;
  background: #2a2a2a;
}

.tab-button.active {
  color: #4a9eff;
  border-bottom-color: #4a9eff;
}
`

// Inject styles once
if (typeof document !== 'undefined' && !document.getElementById('inspector-styles')) {
  const style = document.createElement('style')
  style.id = 'inspector-styles'
  style.textContent = inspectorStyles
  document.head.appendChild(style)
}
