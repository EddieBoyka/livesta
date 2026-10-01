import { useEffect, useMemo, useState } from 'react';

const API_URL = 'http://localhost:3000';

const styles = `
* { box-sizing: border-box; }

.admin-app {
  min-height: 100vh;
  background: #f5f7f4;
  color: #20352a;
  font-family: Inter, Arial, sans-serif;
}
.admin-layout { display: flex; min-height: 100vh; }
.admin-sidebar {
  width: 250px;
  flex-shrink: 0;
  background: #143d2b;
  color: white;
  padding: 26px 16px;
  display: flex;
  flex-direction: column;
}
.admin-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px 32px;
  font-size: 23px;
  font-weight: 850;
  letter-spacing: -1px;
}
.admin-brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #2a7950;
  display: grid;
  place-items: center;
  font-size: 22px;
}
.admin-sidebar-label {
  color: #9bb8a5;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  padding: 0 12px;
  margin: 10px 0 12px;
}
.admin-nav { display: grid; gap: 6px; }
.admin-nav button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #d5e3d9;
  text-align: left;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}
.admin-nav button:hover,
.admin-nav button.active { background: #24563c; color: white; }
.admin-nav-icon { width: 22px; text-align: center; font-size: 17px; }
.admin-sidebar-bottom { margin-top: auto; padding-top: 25px; }
.admin-sidebar-bottom button {
  width: 100%;
  padding: 12px;
  border: 1px solid #3c654c;
  border-radius: 9px;
  background: transparent;
  color: white;
  cursor: pointer;
  font-weight: 700;
}
.admin-main { flex: 1; min-width: 0; }
.admin-topbar {
  min-height: 76px;
  background: white;
  border-bottom: 1px solid #e9eee9;
  padding: 15px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}
.admin-topbar h1 { font-size: 21px; margin: 0; letter-spacing: -.5px; }
.admin-topbar p { margin: 5px 0 0; color: #849087; font-size: 12px; }
.admin-topbar-right { display: flex; align-items: center; gap: 12px; }
.admin-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #e4efe5;
  color: #1e6b43;
  font-weight: 800;
}
.admin-content { padding: 30px 32px; max-width: 1500px; margin: auto; }
.admin-welcome {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}
.admin-welcome h2 { font-size: 24px; letter-spacing: -.8px; margin: 0 0 7px; }
.admin-welcome p { color: #7a867d; font-size: 13px; margin: 0; }
.admin-refresh {
  border: 1px solid #dce6dc;
  border-radius: 8px;
  background: white;
  padding: 10px 14px;
  color: #245d3b;
  font-weight: 750;
  cursor: pointer;
}
.admin-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
  margin-bottom: 25px;
}
.admin-stat {
  background: white;
  border: 1px solid #e8eee8;
  border-radius: 12px;
  padding: 20px;
  min-width: 0;
}
.admin-stat-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.admin-stat-label { color: #7d887f; font-size: 12px; font-weight: 650; }
.admin-stat-icon {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #edf5ed;
  font-size: 17px;
}
.admin-stat-value {
  font-size: 27px;
  font-weight: 850;
  letter-spacing: -1px;
  margin-top: 13px;
  color: #193c29;
}
.admin-stat-note { color: #929b93; font-size: 11px; margin-top: 6px; }
.admin-panel {
  background: white;
  border: 1px solid #e8eee8;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 22px;
}
.admin-panel-heading {
  padding: 20px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #edf0ed;
}
.admin-panel-heading h3 { font-size: 15px; margin: 0; }
.admin-panel-heading p { color: #879188; font-size: 11px; margin: 5px 0 0; }
.admin-panel-body { padding: 20px 22px; }
.admin-search {
  width: 100%;
  max-width: 330px;
  padding: 10px 12px;
  border: 1px solid #dfe7df;
  border-radius: 8px;
  outline: none;
  color: #26392c;
  background: white;
  font: inherit;
  font-size: 12px;
}
.admin-search:focus { border-color: #38875b; box-shadow: 0 0 0 3px #e5f2e8; }
.admin-table-wrap { width: 100%; overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 650px; }
.admin-table th {
  color: #829087;
  background: #fafbf9;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .7px;
  padding: 13px 18px;
  font-weight: 800;
  white-space: nowrap;
}
.admin-table td {
  padding: 15px 18px;
  border-top: 1px solid #f0f2ef;
  font-size: 12px;
  color: #3e4d42;
  vertical-align: middle;
}
.admin-table tr:hover td { background: #fcfdfb; }
.admin-user { display: flex; align-items: center; gap: 10px; min-width: 150px; }
.admin-user-avatar {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #e9f2e8;
  display: grid;
  place-items: center;
  color: #276b44;
  font-weight: 800;
}
.admin-user-name { color: #263b2c; font-weight: 750; font-size: 12px; }
.admin-user-email { color: #929b93; font-size: 10px; margin-top: 4px; }
.admin-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}
.admin-badge.green { color: #287348; background: #e7f5e9; }
.admin-badge.yellow { color: #93661b; background: #fff4d9; }
.admin-badge.red { color: #a83c3c; background: #ffebeb; }
.admin-badge.gray { color: #657168; background: #edf0ed; }
.admin-actions { display: flex; flex-wrap: wrap; gap: 6px; }
.admin-action-btn {
  border: 1px solid #dfe7df;
  border-radius: 6px;
  padding: 7px 9px;
  background: white;
  color: #376448;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}
.admin-action-btn:hover { background: #f0f7f0; }
.admin-action-btn.danger { color: #ad4141; border-color: #f0dada; }
.admin-action-btn.danger:hover { background: #fff1f1; }
.admin-action-btn:disabled { opacity: .5; cursor: not-allowed; }
.admin-empty { text-align: center; padding: 45px 20px; color: #89938a; font-size: 13px; }
.admin-empty strong { display: block; color: #435448; font-size: 14px; margin-bottom: 7px; }
.admin-alert { border-radius: 8px; padding: 12px 15px; margin-bottom: 18px; font-size: 12px; font-weight: 650; }
.admin-alert.error { color: #a33c3c; background: #fff0f0; border: 1px solid #f5d4d4; }
.admin-alert.success { color: #276d43; background: #eaf6ec; border: 1px solid #cce8d1; }
.admin-loading { padding: 50px; text-align: center; color: #758078; font-size: 13px; }
.admin-mobile-menu {
  display: none;
  border: 1px solid #dfe7df;
  background: white;
  color: #245d3b;
  border-radius: 7px;
  padding: 8px 10px;
  cursor: pointer;
}
.admin-select {
  padding: 7px 9px;
  border: 1px solid #dfe7df;
  border-radius: 6px;
  background: white;
  color: #376448;
  font-size: 11px;
}
@media (max-width: 1050px) {
  .admin-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 700px) {
  .admin-sidebar {
    position: fixed;
    z-index: 20;
    top: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    transition: transform .2s ease;
    box-shadow: 10px 0 30px rgba(0,0,0,.12);
  }
  .admin-sidebar.open { transform: translateX(0); }
  .admin-mobile-menu { display: inline-block; }
  .admin-topbar { padding: 13px 16px; }
  .admin-topbar h1 { font-size: 17px; }
  .admin-content { padding: 22px 15px; }
  .admin-welcome { align-items: flex-start; }
  .admin-welcome h2 { font-size: 21px; }
  .admin-stats { gap: 10px; }
  .admin-stat { padding: 14px; }
  .admin-stat-value { font-size: 23px; }
  .admin-panel-heading, .admin-panel-body { padding: 16px; }
}
@media (max-width: 390px) {
  .admin-stats { grid-template-columns: 1fr; }
}
`;

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: '▦' },
  { id: 'users', label: 'User management', icon: '♙' },
  { id: 'livestock', label: 'Livestock', icon: '🐄' },
  { id: 'orders', label: 'Orders', icon: '▤' },
];

const STAT_ITEMS = [
  { key: 'total_users', label: 'Total users', icon: '♙', note: 'All registered accounts' },
  { key: 'total_buyers', label: 'Buyers', icon: '🛒', note: 'Registered buyer accounts' },
  { key: 'total_sellers', label: 'Sellers', icon: '♧', note: 'Registered seller accounts' },
  { key: 'verified_sellers', label: 'Verified sellers', icon: '✓', note: 'Approved seller accounts' },
  { key: 'total_listings', label: 'Livestock listings', icon: '🐄', note: 'Listings recorded' },
  { key: 'total_orders', label: 'Total orders', icon: '▤', note: 'Orders recorded' },
];

const ORDER_TRANSITIONS = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return `₦${amount.toLocaleString('en-NG')}`;
}

function getInitials(name) {
  return (name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function getUserStatus(user) {
  if (user.is_suspended) return { label: 'Suspended', className: 'red' };
  if (user.is_active === false) return { label: 'Inactive', className: 'gray' };
  return { label: 'Active', className: 'green' };
}

function getStatusBadge(status) {
  const value = String(status || 'unknown').toLowerCase();
  if (['verified', 'active', 'completed', 'ready'].includes(value)) {
    return 'green';
  }
  if (['pending', 'accepted', 'preparing'].includes(value)) {
    return 'yellow';
  }
  if (['cancelled', 'suspended', 'unavailable'].includes(value)) {
    return 'red';
  }
  return 'gray';
}

export default function AdminDashboard({ user, onHome, onLogout }) {
  const [activePage, setActivePage] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [livestock, setLivestock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLivestock, setLoadingLivestock] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem('livestaToken');

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed (${response.status})`,
      );
    }

    return data;
  }

  async function loadDashboard() {
    setLoadingDashboard(true);
    try {
      const data = await apiRequest('/admin/dashboard');
      setDashboard(data.dashboard || {});
    } catch (err) {
      setError(err.message || 'Could not load dashboard.');
    } finally {
      setLoadingDashboard(false);
    }
  }

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const data = await apiRequest('/admin/users');
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      setError(err.message || 'Could not load users.');
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadLivestock() {
    setLoadingLivestock(true);
    try {
      const data = await apiRequest('/admin/livestock');
      setLivestock(Array.isArray(data.livestock) ? data.livestock : []);
    } catch (err) {
      setError(err.message || 'Could not load livestock.');
    } finally {
      setLoadingLivestock(false);
    }
  }

  async function loadOrders() {
    setLoadingOrders(true);
    try {
      const data = await apiRequest('/admin/orders');
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(err.message || 'Could not load orders.');
    } finally {
      setLoadingOrders(false);
    }
  }

  async function refreshData() {
    setError('');
    setNotice('');
    await Promise.all([
      loadDashboard(),
      loadUsers(),
      loadLivestock(),
      loadOrders(),
    ]);
  }

  useEffect(() => {
    refreshData();
    // Load initial admin data once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function performUserAction(userId, action, successMessage) {
    const actionNames = {
      verify: 'verify this seller',
      suspend: 'suspend this user',
      activate: 'activate this user',
    };

    if (!window.confirm(`Are you sure you want to ${actionNames[action]}?`)) {
      return;
    }

    setBusyId(userId);
    setError('');
    setNotice('');

    const paths = {
      verify: `/admin/sellers/${userId}/verify`,
      suspend: `/admin/users/${userId}/suspend`,
      activate: `/admin/users/${userId}/activate`,
    };

    try {
      await apiRequest(paths[action], { method: 'PATCH' });
      setNotice(successMessage);
      await Promise.all([loadUsers(), loadDashboard()]);
    } catch (err) {
      setError(err.message || 'The action could not be completed.');
    } finally {
      setBusyId(null);
    }
  }

  async function removeListing(item) {
    if (!window.confirm(`Remove the listing "${item.name || 'this listing'}"?`)) {
      return;
    }

    setBusyId(item.id);
    setError('');
    setNotice('');

    try {
      await apiRequest(`/admin/livestock/${item.id}`, { method: 'DELETE' });
      setNotice('Livestock listing removed successfully.');
      await Promise.all([loadLivestock(), loadDashboard()]);
    } catch (err) {
      setError(err.message || 'Could not remove listing.');
    } finally {
      setBusyId(null);
    }
  }

  async function updateOrderStatus(order, newStatus) {
    const label = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    if (
      !window.confirm(
        `Change order #${order.id} from ${order.status} to ${newStatus}?` +
          (newStatus === 'cancelled' ? ' Stock will be restored.' : ''),
      )
    ) {
      return;
    }

    setBusyId(order.id);
    setError('');
    setNotice('');

    try {
      await apiRequest(`/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setNotice(`Order #${order.id} updated to ${label}.`);
      await Promise.all([loadOrders(), loadDashboard(), loadLivestock()]);
    } catch (err) {
      setError(err.message || 'Could not update order.');
    } finally {
      setBusyId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((item) =>
      [item.full_name, item.email, item.role, String(item.id)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [users, search]);

  const filteredLivestock = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return livestock;
    return livestock.filter((item) =>
      [
        item.name,
        item.seller_name,
        item.seller_email,
        item.category,
        String(item.id),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [livestock, search]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((item) =>
      [
        String(item.id),
        item.buyer_name,
        item.buyer_email,
        item.seller_name,
        item.seller_email,
        item.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [orders, search]);

  function navigate(page) {
    setActivePage(page);
    setSidebarOpen(false);
    setError('');
    setNotice('');
    setSearch('');
  }

  function renderUserTable() {
    if (loadingUsers && users.length === 0) {
      return <div className="admin-loading">Loading users...</div>;
    }

    if (filteredUsers.length === 0) {
      return (
        <div className="admin-empty">
          <strong>No users found</strong>
          Try changing your search.
        </div>
      );
    }

    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Seller verification</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((item) => {
              const status = getUserStatus(item);
              const isSeller = item.role === 'seller';
              const isAdmin = item.role === 'admin';
              const busy = busyId === item.id;

              return (
                <tr key={item.id}>
                  <td>
                    <div className="admin-user">
                      <div className="admin-user-avatar">
                        {getInitials(item.full_name)}
                      </div>
                      <div>
                        <div className="admin-user-name">
                          {item.full_name || 'Unnamed user'}
                        </div>
                        <div className="admin-user-email">{item.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge gray">{item.role || 'Unknown'}</span>
                  </td>
                  <td>
                    <span className={`admin-badge ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td>
                    {isSeller ? (
                      <span
                        className={`admin-badge ${
                          item.is_verified ? 'green' : 'yellow'
                        }`}
                      >
                        {item.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{formatDate(item.created_at)}</td>
                  <td>
                    {isAdmin ? (
                      <span className="admin-badge gray">Protected</span>
                    ) : (
                      <div className="admin-actions">
                        {isSeller && !item.is_verified && (
                          <button
                            className="admin-action-btn"
                            disabled={busy}
                            onClick={() =>
                              performUserAction(
                                item.id,
                                'verify',
                                'Seller verified successfully.',
                              )
                            }
                          >
                            {busy ? 'Working...' : 'Verify'}
                          </button>
                        )}
                        {item.is_suspended ? (
                          <button
                            className="admin-action-btn"
                            disabled={busy}
                            onClick={() =>
                              performUserAction(
                                item.id,
                                'activate',
                                'User activated successfully.',
                              )
                            }
                          >
                            {busy ? 'Working...' : 'Activate'}
                          </button>
                        ) : (
                          <button
                            className="admin-action-btn danger"
                            disabled={busy}
                            onClick={() =>
                              performUserAction(
                                item.id,
                                'suspend',
                                'User suspended successfully.',
                              )
                            }
                          >
                            {busy ? 'Working...' : 'Suspend'}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function renderLivestockTable() {
    if (loadingLivestock && livestock.length === 0) {
      return <div className="admin-loading">Loading livestock...</div>;
    }

    if (filteredLivestock.length === 0) {
      return (
        <div className="admin-empty">
          <strong>No livestock listings found</strong>
          Listings will appear here when sellers add them.
        </div>
      );
    }

    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Listing</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLivestock.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="admin-user-name">
                    {item.name || 'Unnamed listing'}
                  </div>
                  <div className="admin-user-email">ID: {item.id}</div>
                </td>
                <td>
                  <div>{item.seller_name || 'Unknown seller'}</div>
                  <div className="admin-user-email">{item.seller_email || '—'}</div>
                </td>
                <td>{formatMoney(item.price)}</td>
                <td>{item.quantity ?? '—'}</td>
                <td>
                  <span
                    className={`admin-badge ${
                      item.is_available ? 'green' : 'gray'
                    }`}
                  >
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td>
                  <button
                    className="admin-action-btn danger"
                    disabled={busyId === item.id || !item.is_available}
                    onClick={() => removeListing(item)}
                  >
                    {busyId === item.id ? 'Working...' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderOrdersTable() {
    if (loadingOrders && orders.length === 0) {
      return <div className="admin-loading">Loading orders...</div>;
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="admin-empty">
          <strong>No orders found</strong>
          Orders will appear here when buyers place them.
        </div>
      );
    }

    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Buyer</th>
              <th>Seller</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Update status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const status = String(order.status || 'pending').toLowerCase();
              const nextStatuses = ORDER_TRANSITIONS[status] || [];

              return (
                <tr key={order.id}>
                  <td>
                    <strong>#{order.id}</strong>
                    <div className="admin-user-email">
                      {formatDate(order.created_at)}
                    </div>
                  </td>
                  <td>
                    <div className="admin-user-name">
                      {order.buyer_name || 'Unknown buyer'}
                    </div>
                    <div className="admin-user-email">{order.buyer_email}</div>
                  </td>
                  <td>
                    <div className="admin-user-name">
                      {order.seller_name || 'Unknown seller'}
                    </div>
                    <div className="admin-user-email">{order.seller_email}</div>
                  </td>
                  <td>
                    {Array.isArray(order.items)
                      ? order.items
                          .map((item) => `${item.name || 'Item'} × ${item.quantity}`)
                          .join(', ')
                      : '—'}
                  </td>
                  <td>{formatMoney(order.total_amount)}</td>
                  <td>
                    <span className={`admin-badge ${getStatusBadge(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    {nextStatuses.length === 0 ? (
                      <span className="admin-badge gray">Final status</span>
                    ) : (
                      <div className="admin-actions">
                        <select
                          className="admin-select"
                          aria-label={`Update order ${order.id}`}
                          value=""
                          disabled={busyId === order.id}
                          onChange={(event) => {
                            const value = event.target.value;
                            if (value) updateOrderStatus(order, value);
                          }}
                        >
                          <option value="">Change status</option>
                          {nextStatuses.map((next) => (
                            <option key={next} value={next}>
                              {next.charAt(0).toUpperCase() + next.slice(1)}
                            </option>
                          ))}
                        </select>
                        {busyId === order.id && <span>Working...</span>}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  const pageTitles = {
    overview: 'Admin overview',
    users: 'User management',
    livestock: 'Livestock management',
    orders: 'Order management',
  };

  const pageDescriptions = {
    overview: 'Here is what is happening on your marketplace.',
    users: 'Review accounts, verify sellers, and manage access.',
    livestock: 'Review and remove marketplace listings.',
    orders: 'Review orders and manage their status.',
  };

  return (
    <div className="admin-app">
      <style>{styles}</style>

      <div className="admin-layout">
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="admin-brand">
            <span className="admin-brand-mark">L</span>
            LIVESTA
          </div>

          <div className="admin-sidebar-label">ADMINISTRATION</div>

          <nav className="admin-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={activePage === item.id ? 'active' : ''}
                onClick={() => navigate(item.id)}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-bottom">
            {onHome && (
              <button onClick={onHome} style={{ marginBottom: 9 }}>
                ← Back to home
              </button>
            )}
            <button onClick={onLogout}>↪ Log out</button>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <button
                className="admin-mobile-menu"
                onClick={() => setSidebarOpen((open) => !open)}
                aria-label="Toggle admin menu"
              >
                ☰
              </button>
              <div>
                <h1>{pageTitles[activePage]}</h1>
                <p>LIVESTA administration</p>
              </div>
            </div>

            <div className="admin-topbar-right">
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#263d2e' }}>
                  {user?.fullName || user?.full_name || 'Administrator'}
                </div>
                <div style={{ fontSize: 10, color: '#89948b', marginTop: 3 }}>
                  Administrator
                </div>
              </div>
              <div className="admin-avatar">
                {getInitials(user?.fullName || user?.full_name || 'Admin')}
              </div>
            </div>
          </header>

          <div className="admin-content">
            {error && (
              <div className="admin-alert error" role="alert">
                {error}
              </div>
            )}
            {notice && (
              <div className="admin-alert success" role="status">
                {notice}
              </div>
            )}

            <div className="admin-welcome">
              <div>
                <h2>
                  {activePage === 'overview'
                    ? 'Welcome back, Admin'
                    : pageTitles[activePage]}
                </h2>
                <p>{pageDescriptions[activePage]}</p>
              </div>
              <button
                className="admin-refresh"
                onClick={refreshData}
                disabled={
                  loadingDashboard ||
                  loadingUsers ||
                  loadingLivestock ||
                  loadingOrders
                }
              >
                ↻ Refresh data
              </button>
            </div>

            {activePage === 'overview' && (
              <>
                <div className="admin-stats">
                  {STAT_ITEMS.map((item) => (
                    <div className="admin-stat" key={item.key}>
                      <div className="admin-stat-top">
                        <span className="admin-stat-label">{item.label}</span>
                        <span className="admin-stat-icon">{item.icon}</span>
                      </div>
                      <div className="admin-stat-value">
                        {loadingDashboard
                          ? '—'
                          : Number(dashboard?.[item.key] || 0).toLocaleString(
                              'en-NG',
                            )}
                      </div>
                      <div className="admin-stat-note">{item.note}</div>
                    </div>
                  ))}
                </div>

                <section className="admin-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <h3>Recent users</h3>
                      <p>Recently registered accounts</p>
                    </div>
                    <button
                      className="admin-action-btn"
                      onClick={() => navigate('users')}
                    >
                      View all users →
                    </button>
                  </div>
                  {loadingUsers && users.length === 0 ? (
                    <div className="admin-loading">Loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="admin-empty">
                      <strong>No users available</strong>
                      Registered accounts will appear here.
                    </div>
                  ) : (
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.slice(0, 5).map((item) => {
                            const status = getUserStatus(item);
                            return (
                              <tr key={item.id}>
                                <td>
                                  <div className="admin-user">
                                    <div className="admin-user-avatar">
                                      {getInitials(item.full_name)}
                                    </div>
                                    <div>
                                      <div className="admin-user-name">
                                        {item.full_name || 'Unnamed user'}
                                      </div>
                                      <div className="admin-user-email">
                                        {item.email}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className="admin-badge gray">
                                    {item.role}
                                  </span>
                                </td>
                                <td>
                                  <span className={`admin-badge ${status.className}`}>
                                    {status.label}
                                  </span>
                                </td>
                                <td>{formatDate(item.created_at)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="admin-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <h3>Seller verification</h3>
                      <p>Review sellers who still need verification</p>
                    </div>
                  </div>
                  {users.filter(
                    (item) => item.role === 'seller' && !item.is_verified,
                  ).length === 0 ? (
                    <div className="admin-empty">
                      <strong>All caught up</strong>
                      There are no sellers awaiting verification.
                    </div>
                  ) : (
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Seller</th>
                            <th>Email</th>
                            <th>Joined</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users
                            .filter(
                              (item) =>
                                item.role === 'seller' && !item.is_verified,
                            )
                            .slice(0, 5)
                            .map((item) => (
                              <tr key={item.id}>
                                <td>{item.full_name}</td>
                                <td>{item.email}</td>
                                <td>{formatDate(item.created_at)}</td>
                                <td>
                                  <button
                                    className="admin-action-btn"
                                    disabled={busyId === item.id}
                                    onClick={() =>
                                      performUserAction(
                                        item.id,
                                        'verify',
                                        'Seller verified successfully.',
                                      )
                                    }
                                  >
                                    {busyId === item.id
                                      ? 'Working...'
                                      : 'Verify seller'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}

            {activePage === 'users' && (
              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h3>All users</h3>
                    <p>
                      {users.length} registered account
                      {users.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <input
                    className="admin-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, email, role or ID..."
                    aria-label="Search users"
                  />
                </div>
                {renderUserTable()}
              </section>
            )}

            {activePage === 'livestock' && (
              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h3>All livestock listings</h3>
                    <p>{livestock.length} listings recorded</p>
                  </div>
                  <input
                    className="admin-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search listing, seller or ID..."
                    aria-label="Search livestock"
                  />
                </div>
                {renderLivestockTable()}
              </section>
            )}

            {activePage === 'orders' && (
              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h3>All orders</h3>
                    <p>{orders.length} orders recorded</p>
                  </div>
                  <input
                    className="admin-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search order, buyer, seller or status..."
                    aria-label="Search orders"
                  />
                </div>
                {renderOrdersTable()}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}