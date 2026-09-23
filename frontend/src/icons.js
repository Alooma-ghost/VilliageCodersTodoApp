import React from 'react';

const createIcon = (name, children) => {
  const Icon = React.forwardRef(({ size = 20, color = 'currentColor', strokeWidth = 2, className = '', ...props }, ref) => {
    return React.createElement(
      'svg',
      {
        ref,
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: strokeWidth,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className: className,
        ...props,
      },
      children
    );
  });
  Icon.displayName = name;
  return Icon;
};

export const Plus = createIcon('Plus', [
  React.createElement('line', { key: '1', x1: '12', y1: '5', x2: '12', y2: '19' }),
  React.createElement('line', { key: '2', x1: '5', y1: '12', x2: '19', y2: '12' })
]);

export const PlusCircle = createIcon('PlusCircle', [
  React.createElement('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
  React.createElement('line', { key: '2', x1: '12', y1: '8', x2: '12', y2: '16' }),
  React.createElement('line', { key: '3', x1: '8', y1: '12', x2: '16', y2: '12' })
]);

export const X = createIcon('X', [
  React.createElement('line', { key: '1', x1: '18', y1: '6', x2: '6', y2: '18' }),
  React.createElement('line', { key: '2', x1: '6', y1: '6', x2: '18', y2: '18' })
]);

export const ListTodo = createIcon('ListTodo', [
  React.createElement('rect', { key: '1', x: '3', y: '5', width: '6', height: '6', rx: '1' }),
  React.createElement('path', { key: '2', d: 'm3 17 2 2 4-4' }),
  React.createElement('path', { key: '3', d: 'M13 6h8' }),
  React.createElement('path', { key: '4', d: 'M13 12h8' }),
  React.createElement('path', { key: '5', d: 'M13 18h8' })
]);

export const RefreshCw = createIcon('RefreshCw', [
  React.createElement('path', { key: '1', d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }),
  React.createElement('path', { key: '2', d: 'M21 3v5h-5' }),
  React.createElement('path', { key: '3', d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }),
  React.createElement('path', { key: '4', d: 'M8 16H3v5' })
]);

export const AlertCircle = createIcon('AlertCircle', [
  React.createElement('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
  React.createElement('line', { key: '2', x1: '12', y1: '8', x2: '12', y2: '12' }),
  React.createElement('line', { key: '3', x1: '12', y1: '16', x2: '12.01', y2: '16' })
]);

export const AlertTriangle = createIcon('AlertTriangle', [
  React.createElement('path', { key: '1', d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }),
  React.createElement('line', { key: '2', x1: '12', y1: '9', x2: '12', y2: '13' }),
  React.createElement('line', { key: '3', x1: '12', y1: '17', x2: '12.01', y2: '17' })
]);

export const AlertOctagon = createIcon('AlertOctagon', [
  React.createElement('polygon', { key: '1', points: '7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2' }),
  React.createElement('line', { key: '2', x1: '12', y1: '8', x2: '12', y2: '12' }),
  React.createElement('line', { key: '3', x1: '12', y1: '16', x2: '12.01', y2: '16' })
]);

export const CheckCircle2 = createIcon('CheckCircle2', [
  React.createElement('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
  React.createElement('path', { key: '2', d: 'm9 12 2 2 4-4' })
]);

export const Play = createIcon('Play', [
  React.createElement('polygon', { key: '1', points: '5 3 19 12 5 21 5 3' })
]);

export const RotateCcw = createIcon('RotateCcw', [
  React.createElement('path', { key: '1', d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }),
  React.createElement('path', { key: '2', d: 'M3 3v5h5' })
]);

export const Trash2 = createIcon('Trash2', [
  React.createElement('path', { key: '1', d: 'M3 6h18' }),
  React.createElement('path', { key: '2', d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
  React.createElement('path', { key: '3', d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }),
  React.createElement('line', { key: '4', x1: '10', y1: '11', x2: '10', y2: '17' }),
  React.createElement('line', { key: '5', x1: '14', y1: '11', x2: '14', y2: '17' })
]);

export const User = createIcon('User', [
  React.createElement('path', { key: '1', d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }),
  React.createElement('circle', { key: '2', cx: '12', cy: '7', r: '4' })
]);

export const UserCheck = createIcon('UserCheck', [
  React.createElement('path', { key: '1', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
  React.createElement('circle', { key: '2', cx: '9', cy: '7', r: '4' }),
  React.createElement('polyline', { key: '3', points: '16 11 18 13 22 9' })
]);

export const ShieldCheck = createIcon('ShieldCheck', [
  React.createElement('path', { key: '1', d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }),
  React.createElement('path', { key: '2', d: 'm9 12 2 2 4-4' })
]);

export const ShieldAlert = createIcon('ShieldAlert', [
  React.createElement('path', { key: '1', d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }),
  React.createElement('line', { key: '2', x1: '12', y1: '8', x2: '12', y2: '12' }),
  React.createElement('line', { key: '3', x1: '12', y1: '16', x2: '12.01', y2: '16' })
]);

export const Lock = createIcon('Lock', [
  React.createElement('rect', { key: '1', width: '18', height: '11', x: '3', y: '11', rx: '2', ry: '2' }),
  React.createElement('path', { key: '2', d: 'M7 11V7a5 5 0 0 1 10 0v4' })
]);

export const Mail = createIcon('Mail', [
  React.createElement('rect', { key: '1', width: '20', height: '16', x: '2', y: '4', rx: '2' }),
  React.createElement('path', { key: '2', d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L1 7' })
]);

export const Briefcase = createIcon('Briefcase', [
  React.createElement('rect', { key: '1', width: '20', height: '14', x: '2', y: '7', rx: '2', ry: '2' }),
  React.createElement('path', { key: '2', d: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' })
]);

export const ArrowRight = createIcon('ArrowRight', [
  React.createElement('path', { key: '1', d: 'M5 12h14' }),
  React.createElement('path', { key: '2', d: 'm12 5 7 7-7 7' })
]);

export const Calendar = createIcon('Calendar', [
  React.createElement('rect', { key: '1', width: '18', height: '18', x: '3', y: '4', rx: '2', ry: '2' }),
  React.createElement('line', { key: '2', x1: '16', y1: '2', x2: '16', y2: '6' }),
  React.createElement('line', { key: '3', x1: '8', y1: '2', x2: '8', y2: '6' }),
  React.createElement('line', { key: '4', x1: '3', y1: '10', x2: '21', y2: '10' })
]);

export const Clock = createIcon('Clock', [
  React.createElement('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
  React.createElement('polyline', { key: '2', points: '12 6 12 12 16 14' })
]);

export const Search = createIcon('Search', [
  React.createElement('circle', { key: '1', cx: '11', cy: '11', r: '8' }),
  React.createElement('line', { key: '2', x1: '21', y1: '21', x2: '16.65', y2: '16.65' })
]);

export const Flag = createIcon('Flag', [
  React.createElement('path', { key: '1', d: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' }),
  React.createElement('line', { key: '2', x1: '4', y1: '22', x2: '4', y2: '15' })
]);

export const Send = createIcon('Send', [
  React.createElement('line', { key: '1', x1: '22', y1: '2', x2: '11', y2: '13' }),
  React.createElement('polygon', { key: '2', points: '22 2 15 22 11 13 2 9 22 2' })
]);

export const Smartphone = createIcon('Smartphone', [
  React.createElement('rect', { key: '1', width: '14', height: '20', x: '5', y: '2', rx: '2', ry: '2' }),
  React.createElement('line', { key: '2', x1: '12', y1: '18', x2: '12.01', y2: '18' })
]);

export const Monitor = createIcon('Monitor', [
  React.createElement('rect', { key: '1', width: '20', height: '14', x: '2', y: '3', rx: '2' }),
  React.createElement('line', { key: '2', x1: '8', y1: '21', x2: '16', y2: '21' }),
  React.createElement('line', { key: '3', x1: '12', y1: '17', x2: '12', y2: '21' })
]);

export const LogOut = createIcon('LogOut', [
  React.createElement('path', { key: '1', d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }),
  React.createElement('polyline', { key: '2', points: '16 17 21 12 16 7' }),
  React.createElement('line', { key: '3', x1: '21', y1: '12', x2: '9', y2: '12' })
]);

export const Award = createIcon('Award', [
  React.createElement('circle', { key: '1', cx: '12', cy: '8', r: '6' }),
  React.createElement('path', { key: '2', d: 'M15.477 12.89 17 22l-5-3-5 3 1.523-9.11' })
]);

export const Flame = createIcon('Flame', [
  React.createElement('path', {
    key: '1',
    d: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'
  })
]);

export const Zap = createIcon('Zap', [
  React.createElement('polygon', {
    key: '1',
    points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2'
  })
]);

export default {
  Plus,
  PlusCircle,
  X,
  ListTodo,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Play,
  RotateCcw,
  Trash2,
  User,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  Briefcase,
  ArrowRight,
  Calendar,
  Clock,
  Search,
  Flag,
  Send,
  Smartphone,
  Monitor,
  LogOut,
  Award,
  Flame,
  Zap,
};
