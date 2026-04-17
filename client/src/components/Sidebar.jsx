import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  User as UserIcon, 
  LogOut, 
  GraduationCap, 
  Trophy,
  BarChart,
  Users
} from 'lucide-react';
import { useAuth } from '../App';

const Sidebar = ({ role }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Terminate your active session?')) {
      logout();
      navigate('/login');
    }
  };

  const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Performance' },
    { to: '/student/exams', icon: BookOpen, label: 'Exams' },
    { to: '/student/leaderboard', icon: Trophy, label: 'Ranking' },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/exams', icon: BookOpen, label: 'Exams' },
    { to: '/admin/reports', icon: BarChart, label: 'Results' },
    { to: '/admin/students', icon: Users, label: 'Students' },
  ];

  const links = role === 'ADMIN' ? adminLinks : studentLinks;

  return (
    <aside style={{ 
      width: '240px', background: 'white', borderRight: '1px solid var(--border-color)',
      padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'sticky', top: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3.5rem' }}>
        <div style={{ 
          width: '40px', height: '40px', background: 'var(--primary-gradient)', 
          borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.3)'
        }}>
          <GraduationCap size={24} />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '800', tracking: '-0.02em', color: 'var(--text-main)' }}>ExamPro</h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/student' || link.to === '/admin'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem',
              borderRadius: '10px', textDecoration: 'none', transition: 'var(--transition)',
              background: isActive ? 'var(--bg-light)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: isActive ? '700' : '600',
              fontSize: '0.9rem'
            })}
          >
            <link.icon size={20} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
          background: 'var(--surface-light)', borderRadius: '12px'
        }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '50%', background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            {user?.name?.[0]}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</p>
            <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', margin: 0 }}>{user?.role}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem',
            width: '100%', border: 'none', background: 'transparent', color: '#EF4444',
            cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', borderRadius: '10px'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#FEF2F2'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={18} />
          Exit Portal
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

