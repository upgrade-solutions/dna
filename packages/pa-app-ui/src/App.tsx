import './App.css'
import { AppRenderer } from './runtime/app/AppRenderer'
import { examples, graphData } from './app/examples'

function App() {
  return (
    <AppRenderer config={examples[0].config} data={{ 'graph-data': graphData }} />
  )
}

export default App
