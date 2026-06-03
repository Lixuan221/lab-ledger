import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Archive,
  ClipboardList,
  Download,
  History,
  LogOut,
  Package,
  Plus,
  Search,
  Shield,
  Users,
  Wrench,
} from 'lucide-react';
import './styles.css';

const API = 'http://localhost:8000/api';
const roleLabels = { owner: '实验室负责人', member: '实验室成员', readonly: '只读成员' };

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [view, setView] = useState('home');
  const [message, setMessage] = useState('');

  const api = useMemo(() => makeApi(token, setMessage), [token]);
  const canWrite = user?.role === 'owner' || user?.role === 'member';
  const isOwner = user?.role === 'owner';

  function handleLogin(nextToken, nextUser) {
    localStorage.setItem('token', nextToken);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  }

  if (!token || !user) {
    return <Login onLogin={handleLogin} />;
  }

  const tabs = [
    ['home', '首页搜索', Search],
    ['consumables', '耗材库存', Package],
    ['equipment', '设备台账', Wrench],
    ['inbound', '入库', Plus],
    ['checkout', '领用', ClipboardList],
    ['records', '历史记录', History],
  ];
  if (isOwner) tabs.push(['users', '用户管理', Users]);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Archive size={28} />
          <div>
            <strong>共享台账</strong>
            <span>实验室资产与耗材</span>
          </div>
        </div>
        <nav>
          {tabs.map(([key, label, Icon]) => (
            <button className={view === key ? 'active' : ''} key={key} onClick={() => setView(key)} title={label}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <h1>{tabs.find(([key]) => key === view)?.[1]}</h1>
            <p>{user.full_name || user.username} · {roleLabels[user.role]}</p>
          </div>
          <div className="top-actions">
            <button className="icon-button" onClick={() => exportExcel(token)} title="导出 Excel">
              <Download size={18} />
            </button>
            <button className="icon-button" onClick={logout} title="退出登录">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        {message && <div className="notice">{message}</div>}
        {view === 'home' && <Home api={api} />}
        {view === 'consumables' && <Consumables api={api} canWrite={canWrite} isOwner={isOwner} />}
        {view === 'equipment' && <Equipment api={api} canWrite={canWrite} isOwner={isOwner} />}
        {view === 'inbound' && <StockActionPage api={api} mode="inbound" disabled={!canWrite} />}
        {view === 'checkout' && <StockActionPage api={api} mode="checkout" disabled={!canWrite} />}
        {view === 'records' && <Records api={api} />}
        {view === 'users' && isOwner && <UsersPage api={api} />}
      </main>
    </div>
  );
}

function makeApi(token, setMessage) {
  return async (path, options = {}) => {
    setMessage('');
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(body.detail || '请求失败');
      throw new Error(body.detail || '请求失败');
    }
    return res.json();
  };
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    const body = new URLSearchParams({ username, password });
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await res.json();
    if (!res.ok) return setError(data.detail || '登录失败');
    onLogin(data.access_token, data.user);
  }

  return (
    <div className="login-page">
      <form className="login-panel" onSubmit={submit}>
        <div className="brand login-brand">
          <Shield size={30} />
          <div>
            <strong>实验室共享台账</strong>
            <span>资产 · 耗材 · 领用记录</span>
          </div>
        </div>
        <label>账号<input value={username} onChange={(e) => setUsername(e.target.value)} /></label>
        <label>密码<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <div className="error">{error}</div>}
        <button className="primary">登录</button>
        <p className="hint">默认负责人账号：admin / admin123</p>
      </form>
    </div>
  );
}

function Home({ api }) {
  const [q, setQ] = useState('');
  const [data, setData] = useState({ consumables: [], equipment: [] });
  useEffect(() => {
    const timer = setTimeout(() => api(`/search?q=${encodeURIComponent(q)}`).then(setData).catch(() => {}), 200);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <section>
      <div className="searchbar">
        <Search size={20} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索耗材、设备、规格、位置、负责人" />
      </div>
      <div className="two-col">
        <ResultTable title="耗材库存" rows={data.consumables} cols={['name', 'category', 'specification', 'quantity', 'unit', 'location']} labels={['名称', '分类', '规格', '库存', '单位', '位置']} />
        <ResultTable title="设备台账" rows={data.equipment} cols={['asset_no', 'name', 'model', 'status', 'owner', 'location']} labels={['资产编号', '名称', '型号', '状态', '负责人', '位置']} />
      </div>
    </section>
  );
}

function ResultTable({ title, rows, cols, labels }) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      <table>
        <thead><tr>{labels.map((x) => <th key={x}>{x}</th>)}</tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id}>{cols.map((col) => <td key={col}>{row[col]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

const consumableDefaults = { name: '', category: '', specification: '', unit: '件', quantity: 0, min_quantity: 0, location: '', supplier: '', remark: '' };
function Consumables({ api, canWrite, isOwner }) {
  return <CrudTable api={api} endpoint="/consumables" title="耗材" defaults={consumableDefaults} fields={[
    ['name', '名称'], ['category', '分类'], ['specification', '规格'], ['unit', '单位'], ['quantity', '库存'], ['min_quantity', '预警线'], ['location', '位置'], ['supplier', '供应商'], ['remark', '备注']
  ]} canWrite={canWrite} canDelete={isOwner} />;
}

const equipmentDefaults = { asset_no: '', name: '', model: '', owner: '', status: '在用', location: '', purchase_date: '', price: 0, remark: '' };
function Equipment({ api, canWrite, isOwner }) {
  return <CrudTable api={api} endpoint="/equipment" title="设备" defaults={equipmentDefaults} fields={[
    ['asset_no', '资产编号'], ['name', '名称'], ['model', '型号'], ['owner', '负责人'], ['status', '状态'], ['location', '位置'], ['purchase_date', '购置日期'], ['price', '价格'], ['remark', '备注']
  ]} canWrite={canWrite} canDelete={isOwner} />;
}

function CrudTable({ api, endpoint, title, defaults, fields, canWrite, canDelete }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(defaults);
  const [editing, setEditing] = useState(null);

  const load = () => api(endpoint).then(setRows).catch(() => {});
  useEffect(load, [endpoint]);

  async function save(e) {
    e.preventDefault();
    if (!canWrite) return;
    const path = editing ? `${endpoint}/${editing}` : endpoint;
    const method = editing ? 'PUT' : 'POST';
    await api(path, { method, body: JSON.stringify(form) });
    setForm(defaults);
    setEditing(null);
    load();
  }

  async function remove(id) {
    await api(`${endpoint}/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <section className="panel">
      {canWrite && (
        <form className="grid-form" onSubmit={save}>
          {fields.map(([key, label]) => (
            <label key={key}>{label}<input value={form[key]} onChange={(e) => setForm({ ...form, [key]: numericKey(key) ? Number(e.target.value) : e.target.value })} /></label>
          ))}
          <button className="primary">{editing ? '保存修改' : `新增${title}`}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(defaults); }}>取消</button>}
        </form>
      )}
      <table>
        <thead><tr>{fields.map(([, label]) => <th key={label}>{label}</th>)}<th>操作</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {fields.map(([key]) => <td className={key === 'quantity' && row.quantity <= row.min_quantity ? 'low' : ''} key={key}>{row[key]}</td>)}
              <td className="actions">
                {canWrite && <button onClick={() => { setEditing(row.id); setForm(pick(row, defaults)); }}>编辑</button>}
                {canDelete && <button onClick={() => remove(row.id)}>删除</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function StockActionPage({ api, mode, disabled }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ item_type: 'consumable', item_id: '', quantity: 1, borrower: '', purpose: '', remark: '' });
  const label = mode === 'inbound' ? '入库' : '领用';
  useEffect(() => { api('/consumables').then(setItems).catch(() => {}); }, []);

  async function submit(e) {
    e.preventDefault();
    await api(`/stock/${mode}`, { method: 'POST', body: JSON.stringify({ ...form, item_id: Number(form.item_id), quantity: Number(form.quantity) }) });
    setForm({ item_type: 'consumable', item_id: '', quantity: 1, borrower: '', purpose: '', remark: '' });
    api('/consumables').then(setItems).catch(() => {});
  }

  return (
    <section className="panel narrow">
      {disabled ? <div className="notice">只读成员不能提交{label}操作。</div> : null}
      <form className="stack-form" onSubmit={submit}>
        <label>耗材<select value={form.item_id} onChange={(e) => setForm({ ...form, item_id: e.target.value })} required>
          <option value="">请选择</option>
          {items.map((item) => <option value={item.id} key={item.id}>{item.name} · 当前 {item.quantity}{item.unit}</option>)}
        </select></label>
        <label>数量<input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></label>
        <label>领用人/经办人<input value={form.borrower} onChange={(e) => setForm({ ...form, borrower: e.target.value })} /></label>
        <label>用途<input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></label>
        <label>备注<input value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} /></label>
        <button className="primary" disabled={disabled}>{label}</button>
      </form>
    </section>
  );
}

function Records({ api }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { api('/records').then(setRows).catch(() => {}); }, []);
  return (
    <section className="panel">
      <table>
        <thead><tr><th>时间</th><th>动作</th><th>类型</th><th>ID</th><th>数量</th><th>操作人</th><th>领用人</th><th>用途</th><th>备注</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id}><td>{fmt(r.created_at)}</td><td>{r.action === 'inbound' ? '入库' : '领用'}</td><td>{r.item_type}</td><td>{r.item_id}</td><td>{r.quantity}</td><td>{r.operator.full_name || r.operator.username}</td><td>{r.borrower}</td><td>{r.purpose}</td><td>{r.remark}</td></tr>)}</tbody>
      </table>
    </section>
  );
}

function UsersPage({ api }) {
  const defaults = { username: '', full_name: '', role: 'member', password: '', is_active: true };
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(defaults);
  const [editing, setEditing] = useState(null);
  const load = () => api('/users').then(setRows).catch(() => {});
  useEffect(load, []);

  async function save(e) {
    e.preventDefault();
    const payload = { ...form };
    if (editing && !payload.password) delete payload.password;
    await api(editing ? `/users/${editing}` : '/users', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    setForm(defaults);
    setEditing(null);
    load();
  }

  return (
    <section className="panel">
      <form className="grid-form" onSubmit={save}>
        {!editing && <label>账号<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>}
        <label>姓名<input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label>
        <label>角色<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="owner">实验室负责人</option><option value="member">实验室成员</option><option value="readonly">只读成员</option></select></label>
        <label>密码<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} /></label>
        <label className="check"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />启用</label>
        <button className="primary">{editing ? '保存用户' : '新增用户'}</button>
      </form>
      <table>
        <thead><tr><th>账号</th><th>姓名</th><th>角色</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id}><td>{row.username}</td><td>{row.full_name}</td><td>{roleLabels[row.role]}</td><td>{row.is_active ? '启用' : '停用'}</td><td>{fmt(row.created_at)}</td><td><button onClick={() => { setEditing(row.id); setForm({ username: row.username, full_name: row.full_name, role: row.role, password: '', is_active: row.is_active }); }}>编辑</button></td></tr>)}</tbody>
      </table>
    </section>
  );
}

function exportExcel(token) {
  fetch(`${API}/export/excel`, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '实验室共享台账.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    });
}

function pick(row, defaults) {
  return Object.fromEntries(Object.keys(defaults).map((key) => [key, row[key] ?? defaults[key]]));
}
function numericKey(key) {
  return ['quantity', 'min_quantity', 'price'].includes(key);
}
function fmt(value) {
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}

createRoot(document.getElementById('root')).render(<App />);
