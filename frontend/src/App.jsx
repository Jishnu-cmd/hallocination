import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [domain, setDomain] = useState('healthcare');
  const [prompt, setPrompt] = useState('What is the recommended initial dose of lisinopril for essential hypertension?');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [experiments, setExperiments] = useState([]);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await apiService.submitAnalysis({
        domain,
        model: 'llama-3-8b',
        prompt,
        response: response || undefined,
        detection_methods: ['eigenscore', 'self_consistency', 'semantic_entropy', 'retrieval']
      });
      setResults(res.data);
      setActiveTab('claims');
    } catch (err) {
      console.error(err);
      alert('Error running analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    apiService.getEvaluationMetrics().then(res => {
      setExperiments(res.data.experiments || []);
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-sky-400">HaluDetect Research Platform</h1>
        <div className="flex gap-4 text-sm">
          <button onClick={() => setActiveTab('workspace')} className={`pb-1 ${activeTab === 'workspace' ? 'border-b-2 border-sky-400 text-white font-semibold' : 'text-slate-400'}`}>Workspace</button>
          <button onClick={() => setActiveTab('claims')} className={`pb-1 ${activeTab === 'claims' ? 'border-b-2 border-sky-400 text-white font-semibold' : 'text-slate-400'}`}>Claims</button>
          <button onClick={() => setActiveTab('evaluation')} className={`pb-1 ${activeTab === 'evaluation' ? 'border-b-2 border-sky-400 text-white font-semibold' : 'text-slate-400'}`}>Ablation (E1–E7)</button>
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto w-full flex-1">
        {activeTab === 'workspace' && (
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Detection Analysis Workspace</h2>
            <div>
              <label className="text-xs uppercase text-slate-400 font-bold block mb-1">Domain</label>
              <select value={domain} onChange={e => setDomain(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm w-full">
                <option value="healthcare">Healthcare & Clinical Medicine</option>
                <option value="software">Software Development</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase text-slate-400 font-bold block mb-1">Prompt</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={2} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm w-full" />
            </div>
            <div>
              <label className="text-xs uppercase text-slate-400 font-bold block mb-1">LLM Response (Optional)</label>
              <textarea value={response} onChange={e => setResponse(e.target.value)} rows={3} placeholder="Leave blank to auto-sample..." className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm w-full" />
            </div>
            <button onClick={handleAnalyze} disabled={loading} className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 font-semibold text-white text-sm">
              {loading ? 'Analyzing with Multi-Signal Detection...' : 'Run Detection'}
            </button>
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Claim-Level Verification</h2>
            {results ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block">Overall Assessment:</span>
                    <span className="font-bold text-sky-400">{results.overall_assessment}</span>
                  </div>
                  <span className="text-xl font-bold">{(results.overall_risk_score * 100).toFixed(1)}% Risk</span>
                </div>
                {results.claims.map((c, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-slate-400">{c.claim_id}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${c.final_score >= 0.5 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {c.classification.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm font-medium">"{c.claim}"</div>
                    <div className="grid grid-cols-4 gap-2 text-xs pt-2">
                      <div className="p-2 bg-slate-900 rounded">EigenScore: {c.signals.eigenscore?.toFixed(2) ?? '--'}</div>
                      <div className="p-2 bg-slate-900 rounded">Self-Consistency: {c.signals.self_consistency?.toFixed(2) ?? '--'}</div>
                      <div className="p-2 bg-slate-900 rounded">Semantic Entropy: {c.signals.semantic_entropy?.toFixed(2) ?? '--'}</div>
                      <div className="p-2 bg-slate-900 rounded">Retrieval: {c.signals.retrieval?.toFixed(2) ?? '--'}</div>
                    </div>
                    <div className="text-xs text-slate-400 pt-1"><strong>Attribution:</strong> {c.explanation}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No analysis results yet. Run a prompt in Workspace.</p>
            )}
          </div>
        )}

        {activeTab === 'evaluation' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">E1–E7 Experimental Ablation Suite</h2>
            <div className="overflow-x-auto bg-slate-800/40 border border-slate-800 rounded-2xl">
              <table className="min-w-full text-xs text-left">
                <thead class="bg-slate-850 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Exp</th>
                    <th className="p-3">Configuration</th>
                    <th className="p-3">Accuracy</th>
                    <th className="p-3">Precision</th>
                    <th className="p-3">Recall</th>
                    <th className="p-3 text-sky-400">F1</th>
                    <th className="p-3 text-indigo-400">AUROC</th>
                    <th className="p-3">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {experiments.map((e, idx) => (
                    <tr key={idx} className={e.experiment === 'E7' ? 'bg-sky-950/20 font-bold' : ''}>
                      <td className="p-3 font-mono">{e.experiment}</td>
                      <td className="p-3">{e.configuration}</td>
                      <td className="p-3">{e.accuracy.toFixed(4)}</td>
                      <td className="p-3">{e.precision.toFixed(4)}</td>
                      <td className="p-3">{e.recall.toFixed(4)}</td>
                      <td className="p-3 text-sky-400">{e.f1_score.toFixed(4)}</td>
                      <td className="p-3 text-indigo-400">{e.auroc.toFixed(4)}</td>
                      <td className="p-3">{e.latency_ms}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

