import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import {
  School, Users, UserCheck, UserCog, BookOpen, Bell, Calendar, ClipboardList,
  TrendingUp, ArrowRight, GraduationCap,
} from 'lucide-react';

interface Stats {
  schools: number;
  students: number;
  teachers: number;
  staff: number;
  exams: number;
  notices: number;
  events: number;
  books: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentNotices, setRecentNotices] = useState<any[]>([]);
  const [schoolWise, setSchoolWise] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get<any>('/dashboard/stats')
      .then((data) => {
        setStats(data.stats);
        setRecentNotices(data.recentNotices || []);
        setSchoolWise(data.schoolWise || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Schools', value: stats.schools, icon: School, color: 'bg-brand-50 text-brand-600', link: '/app/schools' },
    { label: 'Students', value: stats.students, icon: Users, color: 'bg-forest-50 text-forest-600', link: '/app/students' },
    { label: 'Teachers', value: stats.teachers, icon: UserCheck, color: 'bg-blue-50 text-blue-600', link: '/app/teachers' },
    { label: 'Staff', value: stats.staff, icon: UserCog, color: 'bg-purple-50 text-purple-600', link: '/app/staff' },
    { label: 'Exams', value: stats.exams, icon: ClipboardList, color: 'bg-earth-50 text-earth-600', link: '/app/workspace/examinations' },
    { label: 'Notices', value: stats.notices, icon: Bell, color: 'bg-amber-50 text-amber-600', link: '/app/workspace/notices' },
    { label: 'Events', value: stats.events, icon: Calendar, color: 'bg-pink-50 text-pink-600', link: '/app/workspace/notices' },
    { label: 'Books', value: stats.books, icon: BookOpen, color: 'bg-teal-50 text-teal-600', link: '/app/workspace/library' },
  ] : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening at your schools today.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-forest">
            <GraduationCap className="w-3 h-3 mr-1" />
            {user?.role?.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-100 rounded-xl mb-4" />
              <div className="h-8 bg-gray-100 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Link key={card.label} to={card.link} className="card-hover p-6 group">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="font-display text-3xl font-bold text-gray-900">{card.value}</div>
              <div className="text-sm text-gray-500 mt-1">{card.label}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Notices */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-bold text-gray-900">Recent Notices</h2>
            <Link to="/app/workspace/notices" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {recentNotices.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No notices yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotices.map((notice: any) => (
                <div key={notice.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notice.priority === 'high' ? 'bg-red-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{notice.title}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {notice.category} • {notice.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* School Wise */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-6">School-wise Students</h2>

          {schoolWise.length === 0 ? (
            <div className="text-center py-8">
              <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No schools yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schoolWise.map((school: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium truncate mr-2">{school.name}</span>
                    <span className="text-gray-500">{school.students}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-brand rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (school.students / Math.max(1, stats?.students || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
