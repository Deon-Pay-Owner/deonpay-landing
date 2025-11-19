'use client'

import { useState } from 'react'

export default function TestSignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')

  const handleTest = async () => {
    setResult('Starting test...')
    console.log('Test button clicked')

    try {
      console.log('About to make fetch request')
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('Response received:', response.status)
      const data = await response.json()
      console.log('Data received:', data)

      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Error:', error)
      setResult(`Error: ${error}`)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Login Test Page</h1>
      <p>This is a simple test page to debug login issues.</p>

      <div style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '5px', width: '300px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '5px', width: '300px' }}
          />
        </div>

        <button onClick={handleTest} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Test Login
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Result:</h3>
        <pre>{result}</pre>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#e3f2fd', borderRadius: '5px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Open browser console (F12 or Right-click → Inspect → Console)</li>
          <li>Enter email and password</li>
          <li>Click "Test Login"</li>
          <li>Check console for logs</li>
          <li>Check Network tab for API call</li>
        </ol>
      </div>
    </div>
  )
}
