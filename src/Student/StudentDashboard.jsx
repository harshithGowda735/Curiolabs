import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, BookOpen, BrainCircuit, CheckCircle2, Clock3, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { subscribeToStudentRecords } from '../services/labService'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const recommendations = [{ title: "Ohm's Law & Resistance", category: 'Physics', path: '/physics/ohms-law' }, { title: 'RC Filter Tuning', category: 'Electronics', path: '/electronics/rc-filter' }, { title: 'Dijkstra Pathfinding', category: 'Computer Science', path: '/cs/dijkstra' }]
const stamp = record => record.timestamp?.toDate ? record.timestamp.toDate().toLocaleDateString() : 'Just now'

export default function StudentDashboard() {
  const { currentUser, profile } = useAuth()
  const [records, setRecords] = useState([])
  const [liveError, setLiveError] = useState(false)
  useEffect(() => {
    if (!currentUser || currentUser.uid === 'demo-user') return
    return subscribeToStudentRecords(currentUser.uid, snapshot => { setRecords(snapshot.docs.map(item => ({ id: item.id, ...item.data() }))); setLiveError(false) }, () => setLiveError(true))
  }, [currentUser])
  const completed = records.filter(record => record.completionStatus === 'completed')
  const average = completed.length ? Math.round(completed.reduce((sum, item) => sum + (item.score || 0), 0) / completed.length) : 0
  const viva = completed.length ? Math.round(completed.reduce((sum, item) => sum + (item.vivaMarks || 0), 0) / completed.length) : 0
  const recent = useMemo(() => records.slice(0, 5), [records])
  const name = profile?.name || currentUser?.displayName || 'Student'
  const stats = [{ icon: CheckCircle2, label: 'Completed experiments', value: completed.length, color: 'text-emerald-600 bg-emerald-50' }, { icon: TrendingUp, label: 'Performance average', value: `${average}%`, color: 'text-blue-600 bg-blue-50' }, { icon: Award, label: 'Certificates earned', value: profile?.certificates || 0, color: 'text-amber-600 bg-amber-50' }, { icon: BrainCircuit, label: 'AI viva average', value: `${viva}%`, color: 'text-violet-600 bg-violet-50' }]
  return <div className="min-h-screen bg-slate-50"><Navbar />
    <header className="bg-gradient-to-br from-teal-600 to-blue-700 text-white"><div className="max-w-7xl mx-auto px-4 py-10"><p className="text-teal-100 text-sm">{profile?.branch || 'Virtual laboratory workspace'}</p><h1 className="text-3xl font-display font-bold mt-1">Welcome back, {name} 👋</h1><p className="mt-2 text-blue-100">Your progress, recommendations, and lab activity in one place.</p></div></header>
    <main className="max-w-7xl mx-auto px-4 py-7 space-y-6">
      {liveError && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Live records are unavailable. Check Firebase configuration and Firestore indexes.</p>}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">{stats.map(({ icon: Icon, label, value, color }) => <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"><div className={`w-9 h-9 grid place-items-center rounded-xl ${color}`}><Icon size={18} /></div><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500 mt-1">{label}</p></div>)}</section>
      <section className="grid lg:grid-cols-3 gap-6"><div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5"><div className="flex justify-between"><div><h2 className="font-bold text-slate-900">Performance analytics</h2><p className="text-sm text-slate-500">Last 8 completed experiments</p></div><BookOpen className="text-teal-600" /></div><div className="h-40 mt-5 flex items-end gap-2">{(completed.slice(0, 8).reverse()).map((record, index) => <div key={record.id} className="flex-1 text-center"><div className="bg-teal-500 rounded-t-md min-h-2" style={{ height: `${Math.max(record.score || 0, 5)}%` }} title={`${record.score || 0}%`} /><span className="text-[10px] text-slate-400">#{index + 1}</span></div>)}{!completed.length && <p className="m-auto text-sm text-slate-400">Complete an experiment to see your trend.</p>}</div></div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5"><h2 className="font-bold text-slate-900">Learning progress</h2><div className="mt-5"><div className="flex justify-between text-sm"><span>Completion target</span><span>{Math.min(completed.length * 10, 100)}%</span></div><div className="h-2 bg-slate-100 rounded-full mt-2"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(completed.length * 10, 100)}%` }} /></div></div><p className="mt-5 text-sm text-slate-500">{completed.length ? 'Keep the momentum going.' : 'Your first completed lab will unlock insights.'}</p></div></section>
      <section className="grid lg:grid-cols-2 gap-6"><div className="bg-white border border-slate-200 rounded-2xl p-5"><h2 className="font-bold text-slate-900">Recommended for your branch</h2><div className="mt-3 space-y-2">{recommendations.map(item => <Link key={item.title} to={item.path} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 hover:bg-teal-50"><span><b className="text-sm text-slate-800">{item.title}</b><small className="block text-slate-500">{item.category}</small></span><span className="text-teal-600">→</span></Link>)}</div></div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5"><h2 className="font-bold text-slate-900">Recent activity</h2><div className="mt-3 space-y-3">{recent.map(record => <div key={record.id} className="flex gap-3 text-sm"><Clock3 size={16} className="mt-0.5 text-slate-400" /><p className="text-slate-600"><b className="text-slate-800">Experiment submitted</b><br />Score {record.score ?? '—'} · Viva {record.vivaMarks ?? '—'} · {stamp(record)}</p></div>)}{!recent.length && <p className="text-sm text-slate-400">No lab activity yet.</p>}</div></div></section>
    </main><Footer /></div>
}
