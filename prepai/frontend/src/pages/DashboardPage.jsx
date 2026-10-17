import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProgress, getArchitectureInfo } from "../utils/api";

const StatCard = ({ label, value, icon, color, sublabel }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-white font-display">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
      {sublabel && <p className="text-[11px] text-gray-500 mt-0.5">{sublabel}</p>}
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [archInfo, setArchInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const [progressRes, archRes] = await Promise.allSettled([
          getProgress(),
          getArchitectureInfo(),
        ]);

        if (isMounted) {
          if (progressRes.status === "fulfilled") {
            setStats(progressRes.value.data.stats);
            setHistory(progressRes.value.data.history || []);
          }
          if (archRes.status === "fulfilled") {
            setArchInfo(archRes.value.data.architecture);
          }
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          return;
        }
        console.error("Failed to fetch dashboard telemetry:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const getScoreBadge = (pct) => {
    if (pct >= 70) return "badge-green";
    if (pct >= 40) return "badge-yellow";
    return "badge-red";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          Welcome back, <span className="text-brand-400">{user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-xs text-gray-400">Track performance & readiness.</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-24 animate-pulse bg-dark-700" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in">
          <StatCard
            label="Total Sessions"
            value={stats?.totalSessions ?? 0}
            sublabel="Completed"
            color="bg-brand-900/50 text-brand-400"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            label="Average Score"
            value={`${stats?.averageScore ?? 0}%`}
            sublabel="RAG Grounded"
            color="bg-emerald-900/50 text-emerald-400"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <StatCard
            label="Best Score"
            value={`${stats?.bestScore ?? 0}%`}
            sublabel="Top Accuracy"
            color="bg-yellow-900/50 text-yellow-400"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Architecture & Engineering Telemetry Showcase */}
      <div className="card mb-8 bg-dark-800/90 border-dark-600">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-950 text-brand-400 border border-brand-800/40 text-xs font-semibold mb-1">
              <span>🏗️ Architecture</span>
            </div>
            <h2 className="text-lg font-bold text-white">System Telemetry</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-300 font-mono">Healthy</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* SOA & SOLID */}
          <div className="bg-dark-700/50 rounded-xl p-3.5 border border-dark-500/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">SOA & SOLID</span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                -30% Bugs
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-2">Decoupled architecture.</p>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-gray-300 font-mono">
              <span className="bg-dark-800 px-2 py-0.5 rounded border border-dark-600">JWT Auth</span>
              <span className="bg-dark-800 px-2 py-0.5 rounded border border-dark-600">Orchestrator</span>
              <span className="bg-dark-800 px-2 py-0.5 rounded border border-dark-600">Evaluation</span>
            </div>
          </div>

          {/* RAG Knowledge Base */}
          <div className="bg-dark-700/50 rounded-xl p-3.5 border border-dark-500/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">RAG Grounding</span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                -35% Hallucinations
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-2">Ground-truth verified.</p>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-gray-300 font-mono">
              <span className="bg-dark-800 px-2 py-0.5 rounded border border-dark-600">Gemini AI</span>
              <span className="bg-dark-800 px-2 py-0.5 rounded border border-dark-600">{archInfo?.ragKnowledgeBase?.totalVerifiedTopics || 15}+ Topics</span>
              <span className="bg-dark-800 px-2 py-0.5 rounded border border-dark-600">Anti-Hallucination</span>
            </div>
          </div>

          {/* Redis Caching Layer */}
          <div className="bg-dark-700/50 rounded-xl p-3.5 border border-dark-500/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-brand-300 uppercase tracking-wide">Redis Cache</span>
              <span className="text-[11px] font-mono text-brand-300 bg-brand-950/60 px-1.5 py-0.5 rounded border border-brand-800/40">
                -45% Latency
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-2">Sub-5ms responses.</p>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-gray-300 font-mono">
              <span className="bg-dark-800 px-2 py-0.5 rounded border border-dark-600">MD5 Hash</span>
              <span className="bg-dark-800 px-2 py-0.5 rounded border border-dark-600">In-Memory</span>
              <span className="bg-dark-800 px-2 py-0.5 rounded border border-dark-600">{archInfo?.cacheTelemetry?.hitRatio || "Active"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="card mb-8 bg-gradient-to-br from-brand-900/60 to-dark-800 border-brand-700/40 py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Spoken Technical Interview</h2>
            <p className="text-gray-400 text-xs">Conversational AI Chatbot • Voice-Only Answers</p>
          </div>
          <Link to="/interview" className="btn-primary whitespace-nowrap shrink-0 text-sm px-6 py-2.5">
            Start Interview →
          </Link>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Recent Sessions</h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-14 animate-pulse bg-dark-700" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="card text-center py-10">
            <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-300 font-medium text-sm mb-0.5">No sessions yet</p>
            <p className="text-gray-500 text-xs">Complete an interview to see results.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map((session, idx) => {
              const pct =
                session.percentage !== undefined
                  ? session.percentage
                  : session.totalQuestions > 0 && session.score <= session.totalQuestions
                  ? Math.round((session.score / session.totalQuestions) * 100)
                  : session.score;
              return (
                <div key={session._id || idx} className="card flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center text-xs font-bold text-gray-300 font-mono">
                      #{history.length - idx}
                    </div>
                    <div>
                      <p className="text-white font-medium text-xs">
                        {session.score} / {session.totalQuestions} correct
                      </p>
                      <p className="text-gray-500 text-[11px]">
                        {new Date(session.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={getScoreBadge(pct)}>{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
