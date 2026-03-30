import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProgress } from "../utils/api";

const StatCard = ({ label, value, icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-white font-display">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await getProgress();
        setStats(data.stats);
        setHistory(data.history || []);
      } catch (err) {
        console.error("Failed to fetch progress:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const getScoreColor = (pct) => {
    if (pct >= 70) return "text-emerald-400";
    if (pct >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadge = (pct) => {
    if (pct >= 70) return "badge-green";
    if (pct >= 40) return "badge-yellow";
    return "badge-red";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome */}
      <div className="mb-10 animate-slide-up">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Welcome back, <span className="text-brand-400">{user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-gray-400">Track your progress and keep practicing to land your dream job.</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[1,2,3].map(i => <div key={i} className="card h-24 animate-pulse bg-dark-700" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 animate-fade-in">
          <StatCard
            label="Total Sessions"
            value={stats?.totalSessions ?? 0}
            color="bg-brand-900/50 text-brand-400"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <StatCard
            label="Average Score"
            value={`${stats?.averageScore ?? 0}%`}
            color="bg-emerald-900/50 text-emerald-400"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
          <StatCard
            label="Best Score"
            value={`${stats?.bestScore ?? 0}%`}
            color="bg-yellow-900/50 text-yellow-400"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>}
          />
        </div>
      )}

      {/* CTA */}
      <div className="card mb-10 bg-gradient-to-br from-brand-900/60 to-dark-800 border-brand-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Ready for your next mock interview?</h2>
            <p className="text-gray-400 text-sm max-w-xl">
              Practice with 8 curated questions covering JavaScript, React, Node.js, databases, and more.
              Get AI-powered feedback on every answer.
            </p>
          </div>
          <Link to="/interview" className="btn-primary whitespace-nowrap shrink-0">
            Start Interview →
          </Link>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Sessions</h2>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="card h-16 animate-pulse bg-dark-700" />)}
          </div>
        ) : history.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-dark-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <p className="text-gray-300 font-medium mb-1">No sessions yet</p>
            <p className="text-gray-500 text-sm">Complete your first mock interview to see results here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((session, idx) => {
              const pct = Math.round((session.score / session.totalQuestions) * 100);
              return (
                <div key={session._id || idx} className="card flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-dark-600 flex items-center justify-center text-sm font-bold text-gray-300 font-mono">
                      #{history.length - idx}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {session.score} / {session.totalQuestions} questions correct
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <span className={getScoreBadge(pct)}>
                    {pct}%
                  </span>
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
