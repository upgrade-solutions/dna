import './App.css'
import { AppRenderer } from './runtime/app/AppRenderer'
import exampleConfig from './app/example-graph-editor.json'

function App() {
  return <AppRenderer config={exampleConfig as any} />
}

export default App
