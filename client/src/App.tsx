import './App.css'

type FoundationStatus = {
  title: string
  message: string
}

const foundationStatus: FoundationStatus = {
  title: 'StaySphere V2',
  message: 'React and TypeScript are ready for the next migration phase.',
}

function App() {
  return (
    <main className="app-shell">
      <section className="welcome-card">
        <span className="eyebrow">Safe migration foundation</span>
        <h1>{foundationStatus.title}</h1>
        <p>{foundationStatus.message}</p>
      </section>
    </main>
  )
}

export default App

