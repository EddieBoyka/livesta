import { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:3000';

export default function SellerDashboard({ onHome }) {
  const token = localStorage.getItem('livestaToken');

  const [activeTab, setActiveTab] = useState('Overview');
  const [listings, setListings] = useState([]);
const [orders, setOrders] = useState([]);
const [notifications, setNotifications] = useState([]);
const [loadingNotifications, setLoadingNotifications] = useState(false);

  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [editingListingId, setEditingListingId] = useState(null);
  const [savingListingId, setSavingListingId] = useState(null);
  const [deletingListingId, setDeletingListingId] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const [listingActionMessage, setListingActionMessage] = useState('');
  const [listingActionError, setListingActionError] = useState('');

  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    quantity: '',
    location: '',
  });

  const [profile, setProfile] = useState({
    storeName: '',
    phone: '',
    location: '',
    description: '',
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const menuItems = [
  'Overview',
  'My Listings',
  'Add Livestock',
  'Orders',
  'Notifications',
  'Store Profile',
];

  const fetchListings = useCallback(async () => {
    setLoadingListings(true);

    try {
      const response = await fetch(`${API}/livestock/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load listings');
      }

      setListings(data.livestock || []);
    } catch (error) {
      setMessage(error.message || 'Failed to load listings');
    } finally {
      setLoadingListings(false);
    }
  }, [token]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    setOrderMessage('');

    try {
      const response = await fetch(`${API}/orders/seller`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load orders');
      }

      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (error) {
      setOrderMessage(error.message || 'Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);
    const fetchNotifications = useCallback(async () => {
    setLoadingNotifications(true);

    try {
      const response = await fetch(
        `${API}/orders/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to load notifications'
        );
      }

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error(
        error.message || 'Failed to load notifications'
      );
    } finally {
      setLoadingNotifications(false);
    }
  }, [token]);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError('');
    setProfileMessage('');

    try {
      const response = await fetch(`${API}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load store profile');
      }

      const savedProfile = data.profile || data;

      setProfile({
        storeName:
          savedProfile.storeName || savedProfile.store_name || '',
        phone: savedProfile.phone || '',
        location: savedProfile.location || '',
        description: savedProfile.description || '',
      });
    } catch (error) {
      setProfileError(error.message || 'Failed to load store profile');
    } finally {
      setLoadingProfile(false);
    }
  }, [token]);

  useEffect(() => {
  fetchListings();
  fetchOrders();
  fetchNotifications();
}, [fetchListings, fetchOrders, fetchNotifications]);

  const refreshDashboard = async () => {
  setRefreshing(true);

  await Promise.all([
    fetchListings(),
    fetchOrders(),
    fetchNotifications(),
  ]);

  setRefreshing(false);
};

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError('');
    setProfileMessage('');

    try {
      const response = await fetch(`${API}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not save store profile');
      }

      const savedProfile = data.profile || data;

      setProfile((current) => ({
        storeName:
          savedProfile.storeName ||
          savedProfile.store_name ||
          current.storeName,
        phone: savedProfile.phone ?? current.phone,
        location: savedProfile.location ?? current.location,
        description: savedProfile.description ?? current.description,
      }));

      setProfileMessage('Store profile saved successfully.');
    } catch (error) {
      setProfileError(error.message || 'Could not save store profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const startEditingListing = (item) => {
    setEditingListingId(item.id);
    setEditForm({
      name: item.name || '',
      category: item.category || '',
      description: item.description || '',
      price: item.price ?? '',
      quantity: item.quantity ?? '',
      location: item.location || '',
    });

    setListingActionMessage('');
    setListingActionError('');
  };

  const cancelEditingListing = () => {
    setEditingListingId(null);
    setEditForm({
      name: '',
      category: '',
      description: '',
      price: '',
      quantity: '',
      location: '',
    });
  };

  const handleUpdateListing = async (event, listingId) => {
    event.preventDefault();
    setSavingListingId(listingId);
    setListingActionMessage('');
    setListingActionError('');

    try {
      const response = await fetch(`${API}/livestock/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editForm,
          price: Number(editForm.price),
          quantity: Number(editForm.quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Could not update listing'
        );
      }

      setListings((current) =>
        current.map((item) =>
          String(item.id) === String(listingId)
            ? { ...item, ...(data.livestock || editForm) }
            : item
        )
      );

      cancelEditingListing();
      setListingActionMessage('Livestock listing updated successfully.');
      await fetchListings();
    } catch (error) {
      setListingActionError(error.message || 'Could not update listing');
    } finally {
      setSavingListingId(null);
    }
  };

  // Opens the custom confirmation popup instead of window.confirm().
  const handleDeleteListing = (item) => {
    setListingActionMessage('');
    setListingActionError('');
    setDeleteConfirmation(item);
  };

  // Deletes the listing only after the seller confirms in the popup.
  const confirmDeleteListing = async () => {
    const item = deleteConfirmation;
    if (!item) return;

    setDeleteConfirmation(null);
    setDeletingListingId(item.id);
    setListingActionMessage('');
    setListingActionError('');

    try {
      const response = await fetch(`${API}/livestock/${item.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete listing');
      }

      setListings((current) =>
        current.filter(
          (listing) => String(listing.id) !== String(item.id)
        )
      );

      if (String(editingListingId) === String(item.id)) {
        cancelEditingListing();
      }

      setListingActionMessage('Livestock listing deleted successfully.');
    } catch (error) {
      setListingActionError(error.message || 'Could not delete listing');
    } finally {
      setDeletingListingId(null);
    }
  };

  const handleAddLivestock = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const response = await fetch(`${API}/livestock`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Could not add livestock'
        );
      }

      setMessage('Livestock added successfully!');
      form.reset();
      await fetchListings();
      setActiveTab('My Listings');
    } catch (error) {
      setMessage(error.message || 'Could not add livestock');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    setOrderMessage('');

    try {
      const response = await fetch(
        `${API}/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not update order');
      }

      setOrders((current) =>
        current.map((order) =>
          String(order.id) === String(orderId)
            ? { ...order, status }
            : order
        )
      );

      setOrderMessage(`Order #${orderId} updated successfully.`);
    } catch (error) {
      setOrderMessage(error.message || 'Could not update order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getOrderActions = (status) => {
    const actions = {
      pending: [
        { label: 'Accept Order', status: 'accepted' },
        { label: 'Cancel Order', status: 'cancelled' },
      ],
      accepted: [
        { label: 'Start Preparing', status: 'preparing' },
        { label: 'Cancel Order', status: 'cancelled' },
      ],
      preparing: [
        { label: 'Mark Ready', status: 'ready' },
        { label: 'Cancel Order', status: 'cancelled' },
      ],
      ready: [
        { label: 'Mark Completed', status: 'completed' },
      ],
    };

    return actions[String(status || '').toLowerCase()] || [];
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';

    return String(status)
      .replace(/[\_-]/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const pendingOrders = orders.filter(
    (order) => String(order.status).toLowerCase() === 'pending'
  );

  const completedOrders = orders.filter(
    (order) => String(order.status).toLowerCase() === 'completed'
  );

  const totalSales = completedOrders.reduce(
    (total, order) => total + Number(order.total_amount || 0),
    0
  );

  const availableLivestock = listings.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const stats = [
    { label: 'Total Listings', value: listings.length },
    { label: 'Available Livestock', value: availableLivestock },
    { label: 'Pending Orders', value: pendingOrders.length },
    {
      label: 'Total Sales',
      value: `₦${totalSales.toLocaleString()}`,
    },
  ];

  return (
        <div className="seller-dashboard">
      <style>{`
        .seller-dashboard {
          min-height: 100vh;
          display: flex;
          background: #f5f7f5;
          color: #203b2a;
          font-family: Arial, sans-serif;
        }

        .seller-sidebar {
          width: 250px;
          background: #123d2b;
          color: white;
          padding: 28px 18px;
          flex-shrink: 0;
        }

        .seller-logo {
          font-size: 27px;
          font-weight: 800;
          margin: 0 0 8px;
        }

        .seller-subtitle {
          color: #b8d2c2;
          font-size: 12px;
          margin-bottom: 25px;
        }

        .seller-home {
          background: transparent;
          color: white;
          border: 1px solid #b8d2c2;
          padding: 10px 14px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 20px;
          width: 100%;
          text-align: left;
        }

        .seller-menu {
          display: grid;
          gap: 10px;
        }

        .seller-menu button {
          border: 0;
          background: transparent;
          color: #d8e8dd;
          text-align: left;
          padding: 14px;
          border-radius: 9px;
          font-size: 14px;
          cursor: pointer;
        }

        .seller-menu button.active,
        .seller-menu button:hover {
          background: #286344;
          color: white;
        }

        .seller-main {
          flex: 1;
          min-width: 0;
          padding: 32px;
        }

        .seller-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 28px;
        }

        .seller-header h1 {
          font-size: 27px;
          margin: 0 0 8px;
        }

        .seller-header p {
          color: #718078;
          margin: 0;
          font-size: 14px;
        }

        .seller-avatar {
          width: 43px;
          height: 43px;
          border-radius: 50%;
          background: #dcece1;
          display: grid;
          place-items: center;
          color: #20583b;
          font-weight: bold;
        }

        .seller-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 28px;
        }

        .seller-stat {
          background: white;
          border: 1px solid #e7ece8;
          border-radius: 12px;
          padding: 20px;
          min-width: 0;
        }

        .seller-stat span {
          display: block;
          font-size: 13px;
          color: #718078;
          margin-bottom: 12px;
        }

        .seller-stat strong {
          font-size: 25px;
          overflow-wrap: anywhere;
        }

        .seller-panel {
          background: white;
          border: 1px solid #e7ece8;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 22px;
        }

        .seller-panel h2 {
          font-size: 18px;
          margin: 0 0 18px;
        }

        .seller-empty {
          padding: 35px 10px;
          text-align: center;
          color: #718078;
          font-size: 14px;
        }

        .seller-empty strong {
          display: block;
          color: #203b2a;
          font-size: 16px;
          margin-bottom: 8px;
        }

        .seller-primary {
          background: #286344;
          color: white;
          border: 0;
          border-radius: 8px;
          padding: 12px 18px;
          font-weight: bold;
          cursor: pointer;
        }

        .seller-primary:hover {
          background: #194b31;
        }

        .seller-primary:disabled,
        .seller-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .seller-secondary {
          background: white;
          color: #286344;
          border: 1px solid #286344;
          border-radius: 8px;
          padding: 10px 14px;
          font-weight: bold;
          cursor: pointer;
        }

        .seller-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
        }

        .seller-field {
          display: grid;
          gap: 7px;
        }

        .seller-field.full {
          grid-column: 1 / -1;
        }

        .seller-field label {
          font-size: 13px;
          font-weight: 600;
        }

        .seller-field input,
        .seller-field select,
        .seller-field textarea {
          width: 100%;
          border: 1px solid #d8e1da;
          border-radius: 7px;
          padding: 12px;
          background: white;
          color: #203b2a;
          font: inherit;
          box-sizing: border-box;
        }

        .seller-field textarea {
          min-height: 100px;
          resize: vertical;
        }

        .seller-photo-preview {
          width: 120px;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
          margin-top: 8px;
        }

        .seller-placeholder {
          color: #718078;
          font-size: 14px;
        }

        .seller-order-card {
          background: white;
          border: 1px solid #e7ece8;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .seller-order-card h3 {
          margin: 0 0 12px;
          font-size: 18px;
        }

        .seller-order-card p {
          margin: 8px 0;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .seller-order-items {
          border-top: 1px solid #e7ece8;
          border-bottom: 1px solid #e7ece8;
          padding: 12px 0;
          margin: 14px 0;
        }

        .seller-order-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .seller-order-status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          background: #e4f1e8;
          color: #20583b;
          font-size: 12px;
          font-weight: bold;
        }

        .seller-order-message {
          margin-bottom: 16px;
          padding: 12px;
          background: #e4f1e8;
          border-radius: 8px;
          color: #20583b;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .seller-error {
          background: #fff0f0;
          color: #a12626;
          border: 1px solid #f2caca;
        }

        .seller-section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
        }

        .seller-section-heading h2 {
          margin: 0;
        }

        /* Custom delete confirmation popup */
        .seller-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.55);
        }

        .seller-modal {
          width: 100%;
          max-width: 420px;
          padding: 28px;
          border-radius: 14px;
          background: white;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
          text-align: center;
          animation: sellerModalIn 0.2s ease-out;
        }

        .seller-modal-icon {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: #fff0f0;
          color: #b42323;
          font-size: 28px;
          font-weight: bold;
        }

        .seller-modal h2 {
          margin: 0 0 10px;
          color: #203b2a;
          font-size: 21px;
        }

        .seller-modal p {
          margin: 0;
          color: #718078;
          font-size: 14px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .seller-modal-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 24px;
        }

        .seller-modal-cancel,
        .seller-modal-delete {
          min-width: 120px;
          padding: 11px 16px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }

        .seller-modal-cancel {
          border: 1px solid #d8e1da;
          background: white;
          color: #286344;
        }

        .seller-modal-delete {
          border: 1px solid #b42323;
          background: #b42323;
          color: white;
        }

        .seller-modal-cancel:hover {
          background: #f5f7f5;
        }

        .seller-modal-delete:hover {
          background: #941c1c;
        }

        @keyframes sellerModalIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 900px) {
          .seller-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .seller-dashboard {
            display: block;
          }

          .seller-sidebar {
            width: auto;
            padding: 18px;
          }

          .seller-subtitle {
            margin-bottom: 18px;
          }

          .seller-menu {
            display: flex;
            overflow-x: auto;
            gap: 6px;
          }

          .seller-menu button {
            white-space: nowrap;
          }

          .seller-home {
            width: auto;
          }

          .seller-main {
            padding: 20px 15px;
          }

          .seller-stats {
            gap: 10px;
          }

          .seller-stat {
            padding: 15px;
          }

          .seller-stat strong {
            font-size: 21px;
          }

          .seller-form {
            grid-template-columns: 1fr;
          }

          .seller-field.full {
            grid-column: auto;
          }

          .seller-panel {
            padding: 18px;
          }

          .seller-modal {
            padding: 22px;
          }

          .seller-modal-actions {
            flex-direction: column-reverse;
          }

          .seller-modal-cancel,
          .seller-modal-delete {
            width: 100%;
          }
        }
      `}</style>

      <aside className="seller-sidebar">
        <div className="seller-logo">LIVESTA</div>
        <div className="seller-subtitle">SELLER DASHBOARD</div>

        <button className="seller-home" onClick={onHome}>
          ← Back to Home
        </button>

        <nav className="seller-menu">
          {menuItems.map((item) => (
            <button
              key={item}
              className={activeTab === item ? 'active' : ''}
              onClick={() => {
                setActiveTab(item);
                if (item === 'Store Profile') fetchProfile();
              }}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="seller-main">
        <header className="seller-header">
          <div>
            <h1>
              {activeTab === 'Overview'
                ? 'Seller Overview'
                : activeTab}
            </h1>
            <p>Manage your livestock business on LIVESTA.</p>
          </div>
          <div className="seller-avatar">S</div>
        </header>

        {activeTab === 'Overview' && (
          <>
            <div className="seller-section-heading">
              <h2>Business Overview</h2>
              <button
                className="seller-secondary"
                onClick={refreshDashboard}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : '↻ Refresh'}
              </button>
            </div>

            <section className="seller-stats">
              {stats.map((stat) => (
                <div className="seller-stat" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>
                    {loadingListings || loadingOrders
                      ? '...'
                      : stat.value}
                  </strong>
                </div>
              ))}
            </section>

            <section className="seller-panel">
              <div className="seller-section-heading">
                <h2>Recent Orders</h2>
                <button
                  className="seller-secondary"
                  onClick={() => setActiveTab('Orders')}
                >
                  View All
                </button>
              </div>

              {loadingOrders ? (
                <div className="seller-empty">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="seller-empty">
                  <strong>No orders yet</strong>
                  Your customer orders will appear here.
                </div>
              ) : (
                orders.slice(0, 3).map((order) => (
                  <div className="seller-order-card" key={order.id}>
                    <h3>Order #{order.id}</h3>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className="seller-order-status">
                        {formatStatus(order.status)}
                      </span>
                    </p>
                    <p>
                      <strong>Total:</strong> ₦
                      {Number(order.total_amount || 0).toLocaleString()}
                    </p>
                    <p>
                      <strong>Date:</strong>{' '}
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString()
                        : 'Not available'}
                    </p>
                  </div>
                ))
              )}
            </section>

            <section className="seller-panel">
              <h2>Quick Actions</h2>
              <button
                className="seller-primary"
                onClick={() => setActiveTab('Add Livestock')}
              >
                + Add New Livestock
              </button>
            </section>
          </>
        )}

        {activeTab === 'My Listings' && (
          <section className="seller-panel">
            <div className="seller-section-heading">
              <h2>My Livestock Listings</h2>
              <button
                className="seller-secondary"
                onClick={fetchListings}
                disabled={loadingListings}
              >
                {loadingListings ? 'Loading...' : '↻ Refresh'}
              </button>
            </div>

            {message && (
              <div className="seller-order-message" role="status">
                {message}
              </div>
            )}

            {listingActionMessage && (
              <div className="seller-order-message" role="status">
                {listingActionMessage}
              </div>
            )}

            {listingActionError && (
              <div className="seller-order-message seller-error" role="alert">
                {listingActionError}
              </div>
            )}

            {loadingListings ? (
              <div className="seller-empty">Loading listings...</div>
            ) : listings.length === 0 ? (
              <div className="seller-empty">
                <strong>No listings found</strong>
                Your livestock listings will appear here.
              </div>
            ) : (
              listings.map((item) => {
                const isEditing =
                  String(editingListingId) === String(item.id);
                const isSaving =
                  String(savingListingId) === String(item.id);
                const isDeleting =
                  String(deletingListingId) === String(item.id);

                return (
                  <div className="seller-order-card" key={item.id}>
                    {item.image_url && (
                      <img
                        src={`${API}${item.image_url}`}
                        alt={item.name}
                        className="seller-photo-preview"
                      />
                    )}

                    {isEditing ? (
                      <form
                        className="seller-form"
                        onSubmit={(event) =>
                          handleUpdateListing(event, item.id)
                        }
                      >
                        <div className="seller-field full">
                          <label htmlFor={`edit-name-${item.id}`}>
                            Animal Name
                          </label>
                          <input
                            id={`edit-name-${item.id}`}
                            type="text"
                            value={editForm.name}
                            onChange={(event) =>
                              setEditForm((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="seller-field">
                          <label htmlFor={`edit-category-${item.id}`}>
                            Category
                          </label>
                          <select
                            id={`edit-category-${item.id}`}
                            value={editForm.category}
                            onChange={(event) =>
                              setEditForm((current) => ({
                                ...current,
                                category: event.target.value,
                              }))
                            }
                            required
                          >
                            <option value="">Select category</option>
                            <option value="goat">Goats</option>
                            <option value="cattle">Cattle</option>
                            <option value="sheep">Sheep</option>
                            <option value="pig">Pigs</option>
                            <option value="poultry">Poultry</option>
                            <option value="rabbit">Rabbits</option>
                          </select>
                        </div>

                        <div className="seller-field">
                          <label htmlFor={`edit-price-${item.id}`}>
                            Price (₦)
                          </label>
                          <input
                            id={`edit-price-${item.id}`}
                            type="number"
                            min="1"
                            value={editForm.price}
                            onChange={(event) =>
                              setEditForm((current) => ({
                                ...current,
                                price: event.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="seller-field">
                          <label htmlFor={`edit-quantity-${item.id}`}>
                            Quantity
                          </label>
                          <input
                            id={`edit-quantity-${item.id}`}
                            type="number"
                            min="0"
                            value={editForm.quantity}
                            onChange={(event) =>
                              setEditForm((current) => ({
                                ...current,
                                quantity: event.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="seller-field full">
                          <label htmlFor={`edit-location-${item.id}`}>
                            Location
                          </label>
                          <input
                            id={`edit-location-${item.id}`}
                            type="text"
                            value={editForm.location}
                            onChange={(event) =>
                              setEditForm((current) => ({
                                ...current,
                                location: event.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="seller-field full">
                          <label htmlFor={`edit-description-${item.id}`}>
                            Description
                          </label>
                          <textarea
                            id={`edit-description-${item.id}`}
                            value={editForm.description}
                            onChange={(event) =>
                              setEditForm((current) => ({
                                ...current,
                                description: event.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="seller-field full seller-order-actions">
                          <button
                            className="seller-primary"
                            type="submit"
                            disabled={isSaving}
                          >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            className="seller-secondary"
                            type="button"
                            onClick={cancelEditingListing}
                            disabled={isSaving}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <h3>{item.name}</h3>
                        <p>Category: {item.category}</p>
                        <p>
                          Price: ₦
                          {Number(item.price).toLocaleString()}
                        </p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Location: {item.location}</p>
                        <p>{item.description}</p>

                        <div className="seller-order-actions">
                          <button
                            className="seller-primary"
                            type="button"
                            onClick={() => startEditingListing(item)}
                            disabled={
                              deletingListingId !== null ||
                              editingListingId !== null
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="seller-secondary"
                            type="button"
                            onClick={() => handleDeleteListing(item)}
                            disabled={
                              isDeleting ||
                              deletingListingId !== null ||
                              editingListingId !== null
                            }
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}

            <button
              className="seller-primary"
              onClick={() => {
                setMessage('');
                setActiveTab('Add Livestock');
              }}
            >
              + Add Livestock
            </button>
          </section>
        )}
                {activeTab === 'Add Livestock' && (
          <section className="seller-panel">
            <div className="seller-section-heading">
              <h2>Add Livestock</h2>
            </div>

            {message && (
              <div className="seller-order-message" role="status">
                {message}
              </div>
            )}

            <form onSubmit={handleAddLivestock} className="seller-form">
              <div className="seller-field">
                <label htmlFor="livestock-name">Animal Name</label>
                <input
                  id="livestock-name"
                  name="name"
                  type="text"
                  placeholder="Enter animal name"
                  required
                />
              </div>

              <div className="seller-field">
                <label htmlFor="livestock-category">Category</label>
                <select id="livestock-category" name="category" required>
                  <option value="">Select category</option>
                  <option value="goat">Goats</option>
                  <option value="cattle">Cattle</option>
                  <option value="sheep">Sheep</option>
                  <option value="pig">Pigs</option>
                  <option value="poultry">Poultry</option>
                  <option value="rabbit">Rabbits</option>
                </select>
              </div>

              <div className="seller-field">
                <label htmlFor="livestock-price">Price (₦)</label>
                <input
                  id="livestock-price"
                  name="price"
                  type="number"
                  min="1"
                  placeholder="Enter price"
                  required
                />
              </div>

              <div className="seller-field">
                <label htmlFor="livestock-quantity">Quantity</label>
                <input
                  id="livestock-quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div className="seller-field">
                <label htmlFor="livestock-location">Location</label>
                <input
                  id="livestock-location"
                  name="location"
                  type="text"
                  placeholder="Enter location"
                  required
                />
              </div>

              <div className="seller-field full">
                <label htmlFor="livestock-description">Description</label>
                <textarea
                  id="livestock-description"
                  name="description"
                  placeholder="Describe your livestock"
                  rows="5"
                />
              </div>

              <div className="seller-field full">
                <label htmlFor="livestock-image">Livestock Image</label>
                <input
                  id="livestock-image"
                  name="image"
                  type="file"
                  accept="image/*"
                />
              </div>

              <div className="seller-field full">
                <button
                  className="seller-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? 'Adding...' : 'Add Livestock'}
                </button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'Orders' && (
          <section className="seller-panel">
            <div className="seller-section-heading">
              <h2>Orders</h2>
              <button
                className="seller-secondary"
                type="button"
                onClick={fetchOrders}
                disabled={loadingOrders}
              >
                {loadingOrders ? 'Loading...' : '↻ Refresh'}
              </button>
            </div>

            {orderMessage && (
              <div className="seller-order-message" role="status">
                {orderMessage}
              </div>
            )}

            {loadingOrders ? (
              <div className="seller-empty">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="seller-empty">
                <strong>No orders yet</strong>
                Your customer orders will appear here.
              </div>
            ) : (
              orders.map((order) => (
                <div className="seller-order-card" key={order.id}>
                  <h3>Order #{order.id}</h3>

                  <p>
                    <strong>Status:</strong>{' '}
                    <span className="seller-order-status">
                      {formatStatus(order.status)}
                    </span>
                  </p>

                  <p>
                    <strong>Total:</strong> ₦
                    {Number(order.total_amount || 0).toLocaleString()}
                  </p>

                  <p>
                    <strong>Date:</strong>{' '}
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString()
                      : 'Not available'}
                  </p>

                  <div className="seller-order-actions">
                    {getOrderActions(order.status).map((action) => (
                      <button
                        key={action.status}
                        className={
                          action.status === 'cancelled'
                            ? 'seller-secondary'
                            : 'seller-primary'
                        }
                        type="button"
                        onClick={() =>
                          handleUpdateOrderStatus(order.id, action.status)
                        }
                        disabled={updatingOrderId === order.id}
                      >
                        {updatingOrderId === order.id
                          ? 'Updating...'
                          : action.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        )}
                {activeTab === 'Notifications' && (
          <section className="seller-panel">
            <div className="seller-section-heading">
              <h2>Notifications</h2>

              <button
                className="seller-secondary"
                type="button"
                onClick={fetchNotifications}
                disabled={loadingNotifications}
              >
                {loadingNotifications ? 'Loading...' : '↻ Refresh'}
              </button>
            </div>

            {loadingNotifications ? (
              <div className="seller-empty">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="seller-empty">
                <strong>No notifications</strong>
                New order notifications will appear here.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  className="seller-order-card"
                  key={notification.id}
                >
                  <h3>
                    🔔 {notification.title}
                  </h3>

                  <p>
                    {notification.message}
                  </p>

                  <p>
                    <strong>Date:</strong>{' '}
                    {notification.created_at
                      ? new Date(
                          notification.created_at
                        ).toLocaleString()
                      : 'Not available'}
                  </p>

                  {!notification.is_read && (
                    <span className="seller-order-status">
                      New
                    </span>
                  )}
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === 'Store Profile' && (
          <section className="seller-panel">
            <div className="seller-section-heading">
              <h2>Store Profile</h2>
            </div>

            {loadingProfile ? (
              <div className="seller-empty">Loading store profile...</div>
            ) : (
              <>
                {profileMessage && (
                  <div className="seller-order-message" role="status">
                    {profileMessage}
                  </div>
                )}

                {profileError && (
                  <div
                    className="seller-order-message seller-error"
                    role="alert"
                  >
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="seller-form">
                  <div className="seller-field">
                    <label htmlFor="store-name">Store Name</label>
                    <input
                      id="store-name"
                      type="text"
                      value={profile.storeName}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          storeName: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="seller-field">
                    <label htmlFor="store-phone">Phone</label>
                    <input
                      id="store-phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="seller-field full">
                    <label htmlFor="store-location">Location</label>
                    <input
                      id="store-location"
                      type="text"
                      value={profile.location}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          location: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="seller-field full">
                    <label htmlFor="store-description">Description</label>
                    <textarea
                      id="store-description"
                      rows="5"
                      value={profile.description}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="seller-field full">
                    <button
                      className="seller-primary"
                      type="submit"
                      disabled={savingProfile}
                    >
                      {savingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        )}

        {deleteConfirmation && (
          <div
            className="seller-modal-overlay"
            onClick={() => setDeleteConfirmation(null)}
          >
            <div
              className="seller-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-listing-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="seller-modal-icon">!</div>

              <h2 id="delete-listing-title">Delete Listing?</h2>

              <p>
                Are you sure you want to delete{' '}
                <strong>
                  {deleteConfirmation.name || 'this listing'}
                </strong>
                ?
              </p>

              <p>This action cannot be undone.</p>

              <div className="seller-modal-actions">
                <button
                  type="button"
                  className="seller-modal-cancel"
                  onClick={() => setDeleteConfirmation(null)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="seller-modal-delete"
                  onClick={confirmDeleteListing}
                  disabled={deletingListingId !== null}
                >
                  {deletingListingId !== null ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}