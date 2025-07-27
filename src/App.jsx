import React, { useState, useEffect, useRef } from 'react';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase'; // ✅ importing from firebase.js

// Simulated app ID and auth token fallback
const appId = 'default-app-id';
const initialAuthToken = null; // You can replace this with your logic if needed

function App() {
  const [newsText, setNewsText] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const debounceTimeoutRef = useRef(null);

  // ✅ Firebase Auth Setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUserId(user.uid);
        } else {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
          setUserId(auth.currentUser?.uid || crypto.randomUUID());
        }
        setIsAuthReady(true);
      } catch (error) {
        console.error("Error during authentication:", error);
        setMessage("Failed to authenticate. Please try again.");
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Firestore: Load prediction history
  useEffect(() => {
    if (db && userId && isAuthReady) {
      const predictionsRef = collection(db, `artifacts/${appId}/users/${userId}/predictions`);
      const q = query(predictionsRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        data.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
        setHistory(data);
      }, (err) => {
        console.error("Error loading history:", err);
        setMessage("Failed to load prediction history.");
      });

      return () => unsubscribe();
    }
  }, [db, userId, isAuthReady]);

  // ✅ Fake news detection logic
  const simulatePrediction = (text) => {
    const t = text.toLowerCase();
    let isFake = false;

    if (t.includes('urgent') || t.includes('alert') || t.includes('exclusive')) isFake = Math.random() < 0.6;
    if (t.includes('conspiracy') || t.includes('secret society')) isFake = Math.random() < 0.8;
    if (t.includes('study shows') || t.includes('research indicates')) isFake = Math.random() < 0.3;
    if (t.includes('fact-checked') || t.includes('verified source')) isFake = Math.random() < 0.1;
    if (t.includes('you won\'t believe') || t.includes('shocking truth')) isFake = Math.random() < 0.9;

    return isFake || Math.random() < 0.4 ? 'Fake News' : 'Not Fake News';
  };

  // ✅ Input handling
  const handleNewsTextChange = (e) => {
    const text = e.target.value;
    setNewsText(text);
    setMessage('');

    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    if (text.trim().length > 0 && db && userId && isAuthReady) {
      setLoading(true);
      setPrediction(null);
      debounceTimeoutRef.current = setTimeout(async () => {
        const result = simulatePrediction(text);
        setPrediction(result);
        setLoading(false);

        if (result) {
          try {
            const ref = collection(db, `artifacts/${appId}/users/${userId}/predictions`);
            await addDoc(ref, {
              newsText: text,
              prediction: result,
              timestamp: serverTimestamp(),
              userId: userId
            });
          } catch (err) {
            console.error("Error saving prediction:", err);
            setMessage("Failed to save prediction.");
          }
        }
      }, 700);
    } else {
      setLoading(false);
      setPrediction(null);
    }
  };

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #e0f2fe, #e8eaf6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: '#fff',
        padding: '2rem',
        borderRadius: '1rem',
        width: '100%',
        maxWidth: '720px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e40af', textAlign: 'center' }}>
          📰 Fake News Detector
        </h1>

        <label htmlFor="newsInput" style={{ fontWeight: 600 }}>Paste your news article:</label>
        <textarea
          id="newsInput"
          placeholder="E.g., 'Scientists discover cure for all diseases...'"
          value={newsText}
          onChange={handleNewsTextChange}
          disabled={!isAuthReady}
          style={{
            width: '100%',
            height: '10rem',
            marginTop: '0.5rem',
            padding: '1rem',
            border: '1px solid #ccc',
            borderRadius: '0.5rem',
            resize: 'vertical'
          }}
        />

        {message && <p style={{ color: '#b91c1c', marginTop: '0.5rem' }}>{message}</p>}

        <div style={{ marginTop: '1.5rem', minHeight: '3rem', textAlign: 'center' }}>
          {loading ? (
            <p style={{ color: '#2563eb' }}>Analyzing...</p>
          ) : prediction && (
            <p style={{
              fontWeight: 700,
              color: prediction === 'Fake News' ? '#dc2626' : '#16a34a',
              background: prediction === 'Fake News' ? '#fee2e2' : '#d1fae5',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              {prediction}
            </p>
          )}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Prediction History 📜</h2>
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '1rem' }}>
            {history.length === 0 && <p>No history found.</p>}
            {history.map(item => (
              <div key={item.id} style={{
                border: '1px solid #e5e7eb',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem',
                backgroundColor: '#f0f9ff'
              }}>
                <p style={{ marginBottom: '0.5rem' }}>{item.newsText}</p>
                <strong style={{ color: item.prediction === 'Fake News' ? '#b91c1c' : '#047857' }}>
                  {item.prediction}
                </strong> — <small>{item.timestamp?.toDate().toLocaleString() || 'N/A'}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
