import { useEffect, useState } from 'react';

export default function BuyerDashboard({
  user,
  livestock = [],
  cart = [],
  onAddToCart,
  onRemoveFromCart,
  onHome,
  onLogout,
  onOrderPlaced,
}) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [search, setSearch] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [liveLivestock, setLiveLivestock] = useState(livestock);
  const [livestockLoading, setLivestockLoading] = useState(false);
  const [livestockError, setLivestockError] = useState('');

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState('');
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState('pay_on_delivery');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  const tabs = ['Overview', 'Browse Livestock', 'My Orders', 'Cart'];

  useEffect(() => {
    const fetchLivestock = async () => {
      setLivestockLoading(true);
      setLivestockError('');

      try {
        const response = await fetch('http://localhost:3000/livestock');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Could not load livestock');
        }

        setLiveLivestock(
          (data.livestock || []).map((animal) => ({
            ...animal,
            image: animal.image_url
              ? `http://localhost:3000${animal.image_url}`
              : '',
          }))
        );
      } catch (error) {
        setLivestockError(error.message || 'Could not load livestock');
      } finally {
        setLivestockLoading(false);
      }
    };

    fetchLivestock();
  }, []);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');

    try {
      const token = localStorage.getItem('livestaToken');

      const response = await fetch('http://localhost:3000/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load orders');
      }

      setOrders(data.orders || []);
    } catch (error) {
      setOrdersError(error.message || 'Could not load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'My Orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const handleCancelOrder = (orderId) => {
    setOrderToCancel(orderId);
    setShowCancelPopup(true);
  };

  const confirmCancelOrder = async () => {
    if (orderToCancel == null) return;

    const orderId = orderToCancel;
    setShowCancelPopup(false);
    setCancellingOrderId(orderId);
    setCancelMessage('');

    try {
      const token = localStorage.getItem('livestaToken');

      const response = await fetch(
        `http://localhost:3000/orders/${orderId}/cancel`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not cancel order');
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          Number(order.id) === Number(orderId)
            ? { ...order, status: 'cancelled' }
            : order
        )
      );

      setCancelMessage(`Order #${orderId} cancelled successfully.`);
    } catch (error) {
      setCancelMessage(error.message || 'Could not cancel order.');
    } finally {
      setCancellingOrderId(null);
      setOrderToCancel(null);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setCheckoutMessage('Your cart is empty.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutMessage('');

    try {
      const token = localStorage.getItem('livestaToken');

      const groupedItems = cart.reduce((items, animal) => {
        if (!animal.id) {
          throw new Error('A cart item is missing its livestock ID.');
        }

        const existing = items.find(
          (item) => Number(item.livestockId) === Number(animal.id)
        );

        if (existing) {
          existing.quantity += 1;
        } else {
          items.push({
            livestockId: animal.id,
            quantity: 1,
          });
        }

        return items;
      }, []);

      for (const item of groupedItems) {
        const response = await fetch('http://localhost:3000/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            livestockId: item.livestockId,
            quantity: item.quantity,
            paymentMethod,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Could not place order.');
        }
      }

      setCheckoutMessage('Order placed successfully!');
      setActiveTab('My Orders');
      setOrders([]);
      setOrdersError('');
      onOrderPlaced?.();
    } catch (error) {
      setCheckoutMessage(error.message || 'Checkout failed.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const filteredLivestock = liveLivestock.filter((animal) => {
    const searchText = search.toLowerCase();

    return (
      animal.name?.toLowerCase().includes(searchText) ||
      animal.category?.toLowerCase().includes(searchText) ||
      animal.location?.toLowerCase().includes(searchText)
    );
  });

  const formatPrice = (price) =>
    `₦${Number(price || 0).toLocaleString('en-NG')}`;

  const renderLivestock = (items) => {
    if (livestockLoading) {
      return <div className="buyer-note">Loading livestock...</div>;
    }

    if (livestockError) {
      return <div className="buyer-note">{livestockError}</div>;
    }

    if (!items.length) {
      return (
        <div className="buyer-empty">
          <div className="buyer-empty-icon">🐐</div>
          <h3>No livestock found</h3>
          <p>Try another search or check back later.</p>
        </div>
      );
    }

    return (
      <div className="buyer-products">
        {items.map((animal, index) => (
          <article className="buyer-product" key={animal.id || index}>
            {animal.image ? (
              <img
                src={animal.image}
                alt={animal.name || 'Livestock'}
                className="buyer-product-image"
              />
            ) : (
              <div className="buyer-product-placeholder">🐐</div>
            )}

            <div className="buyer-product-content">
              <span className="buyer-category">
                {animal.category || 'Livestock'}
              </span>

              <h3>{animal.name || 'Livestock'}</h3>

              <p className="buyer-location">
                📍 {animal.location || 'Akwa Ibom'}
              </p>

              <button
                type="button"
                className="buyer-store-button"
                onClick={() => setSelectedStore(animal)}
              >
                View Store
              </button>

              <p className="buyer-price">{formatPrice(animal.price)}</p>

              <button
                type="button"
                className="buyer-primary-button"
                onClick={() => onAddToCart?.(animal)}
              >
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="buyer-dashboard">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .buyer-dashboard {
          min-height: 100vh;
          background: #f7f8f5;
          color: #202820;
          font-family: Arial, sans-serif;
        }

        .buyer-header {
          height: 72px;
          padding: 0 5%;
          background: #fff;
          border-bottom: 1px solid #e8ebe5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .buyer-brand {
          color: #245b38;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .buyer-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .buyer-header button {
          border: 1px solid #dce4da;
          background: #fff;
          color: #245b38;
          border-radius: 8px;
          padding: 10px 15px;
          cursor: pointer;
          font-weight: 600;
        }

        .buyer-layout {
          display: flex;
          min-height: calc(100vh - 72px);
        }

        .buyer-sidebar {
          width: 245px;
          flex-shrink: 0;
          background: #fff;
          border-right: 1px solid #e8ebe5;
          padding: 28px 16px;
        }

        .buyer-profile {
          padding: 8px 12px 24px;
          border-bottom: 1px solid #edf0eb;
          margin-bottom: 20px;
        }

        .buyer-avatar {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #e8f1e8;
          color: #245b38;
          font-size: 21px;
          font-weight: bold;
          margin-bottom: 12px;
        }

        .buyer-profile h3 {
          margin: 0 0 5px;
          font-size: 15px;
        }

        .buyer-profile p {
          margin: 0;
          color: #7a8279;
          font-size: 12px;
        }

        .buyer-nav-label {
          color: #929991;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 0 12px;
          margin-bottom: 10px;
        }

        .buyer-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .buyer-nav button {
          width: 100%;
          border: 0;
          border-radius: 8px;
          padding: 13px 12px;
          text-align: left;
          background: transparent;
          color: #596259;
          font-size: 14px;
          cursor: pointer;
        }

        .buyer-nav button.active {
          background: #eaf2e9;
          color: #245b38;
          font-weight: 700;
        }

        .buyer-main {
          flex: 1;
          min-width: 0;
          padding: 36px 5%;
        }

        .buyer-heading {
          margin-bottom: 28px;
        }

        .buyer-heading h1 {
          font-size: 27px;
          margin: 0 0 8px;
          color: #202820;
        }

        .buyer-heading p {
          color: #788078;
          margin: 0;
          font-size: 14px;
        }

        .buyer-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 32px;
        }

        .buyer-stat {
          background: #fff;
          border: 1px solid #e8ebe5;
          border-radius: 12px;
          padding: 22px;
        }

        .buyer-stat span {
          color: #7b837b;
          font-size: 13px;
        }

        .buyer-stat strong {
          display: block;
          font-size: 27px;
          margin-top: 12px;
          color: #245b38;
        }

        .buyer-section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin: 25px 0 18px;
        }

        .buyer-section-title h2 {
          font-size: 19px;
          margin: 0;
        }

        .buyer-section-title button {
          border: 0;
          background: transparent;
          color: #245b38;
          font-weight: 700;
          cursor: pointer;
        }

        .buyer-products {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 18px;
        }

        .buyer-product {
          background: #fff;
          border: 1px solid #e8ebe5;
          border-radius: 12px;
          overflow: hidden;
        }

        .buyer-product-image,
        .buyer-product-placeholder {
          width: 100%;
          height: 165px;
          object-fit: cover;
          background: #edf2eb;
        }

        .buyer-product-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }

        .buyer-product-content {
          padding: 16px;
        }

        .buyer-category {
          display: inline-block;
          background: #edf4eb;
          color: #326345;
          border-radius: 20px;
          padding: 5px 9px;
          font-size: 11px;
          font-weight: 700;
        }

        .buyer-product h3 {
          font-size: 16px;
          margin: 12px 0 8px;
        }

        .buyer-location {
          color: #7c847b;
          font-size: 12px;
          margin: 0 0 12px;
        }

        .buyer-price {
          font-size: 19px;
          font-weight: 800;
          color: #245b38;
          margin: 0 0 14px;
        }

        .buyer-primary-button {
          width: 100%;
          border: 0;
          border-radius: 8px;
          background: #245b38;
          color: #fff;
          padding: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .buyer-primary-button:hover {
          background: #19472b;
        }

        .buyer-search {
          width: 100%;
          max-width: 450px;
          border: 1px solid #dce3d9;
          border-radius: 9px;
          background: #fff;
          padding: 13px 15px;
          font-size: 14px;
          margin-bottom: 22px;
          outline-color: #245b38;
        }

        .buyer-empty {
          background: #fff;
          border: 1px dashed #dce3d9;
          border-radius: 12px;
          text-align: center;
          padding: 50px 20px;
          color: #737d73;
        }

        .buyer-empty-icon {
          font-size: 38px;
          margin-bottom: 10px;
        }

        .buyer-empty h3 {
          color: #263329;
          margin: 0 0 8px;
        }

        .buyer-empty p {
          margin: 0;
          font-size: 13px;
        }

        .buyer-cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 17px;
          background: #fff;
          border: 1px solid #e8ebe5;
          border-radius: 10px;
          margin-bottom: 12px;
        }

        .buyer-cart-item h3 {
          margin: 0 0 6px;
          font-size: 15px;
        }

        .buyer-cart-item p {
          margin: 0;
          color: #245b38;
          font-weight: 700;
        }

        .buyer-note {
          background: #fff;
          border: 1px solid #e8ebe5;
          padding: 20px;
          border-radius: 10px;
          color: #737d73;
          font-size: 14px;
        }

        .buyer-cancel-button {
          margin-top: 14px;
          padding: 10px 16px;
          background: #fff0f0;
          color: #c62828;
          border: 1px solid #ffcaca;
          border-radius: 7px;
          cursor: pointer;
          font-weight: bold;
        }

        .buyer-cancel-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .buyer-message {
          margin: 0 0 16px;
          padding: 12px 15px;
          border-radius: 8px;
          background: #eaf2e9;
          color: #245b38;
          font-size: 14px;
        }

        .buyer-error {
          background: #fff0f0;
          color: #c62828;
        }

        .buyer-store-button {
          display: block;
          width: 100%;
          margin: 0 0 12px;
          padding: 10px;
          border: 1px solid #245b38;
          border-radius: 8px;
          background: #fff;
          color: #245b38;
          font-weight: 600;
          cursor: pointer;
        }

        .buyer-store-button:hover {
          background: #e8f1e8;
        }

        .buyer-store-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.55);
        }

        .buyer-store-modal {
          position: relative;
          width: 100%;
          max-width: 460px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.2);
        }

        .buyer-store-close {
          position: absolute;
          top: 12px;
          right: 16px;
          border: 0;
          background: transparent;
          color: #333;
          font-size: 28px;
          cursor: pointer;
        }

        .buyer-store-icon {
          margin-bottom: 12px;
          font-size: 40px;
        }

        .buyer-store-modal h2 {
          margin: 0 0 5px;
          color: #245b38;
        }

        .buyer-store-subtitle {
          margin: 0 0 20px;
          color: #777;
        }

        .buyer-store-details {
          padding: 15px;
          border-radius: 8px;
          background: #f7f8f5;
          overflow-wrap: anywhere;
        }

        .buyer-store-details p {
          margin: 8px 0;
          line-height: 1.5;
        }

        .buyer-store-listing {
          margin: 18px 0;
        }

        .buyer-store-listing h3 {
          margin-bottom: 8px;
        }

        @media (max-width: 760px) {
          .buyer-header {
            padding: 0 4%;
          }

          .buyer-layout {
            flex-direction: column;
          }

          .buyer-sidebar {
            width: 100%;
            padding: 12px;
            border-right: 0;
            border-bottom: 1px solid #e8ebe5;
          }

          .buyer-profile {
            display: none;
          }

          .buyer-nav-label {
            display: none;
          }

          .buyer-nav {
            flex-direction: row;
            overflow-x: auto;
          }

          .buyer-nav button {
            white-space: nowrap;
            width: auto;
          }

          .buyer-main {
            padding: 25px 4%;
          }

          .buyer-stats {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .buyer-stat {
            padding: 16px;
          }

          .buyer-stat strong {
            font-size: 22px;
            margin-top: 6px;
          }
        }
      `}</style>

      <header className="buyer-header">
        <div className="buyer-brand">LIVESTA</div>

        <div className="buyer-header-actions">
          <button onClick={onHome}>Marketplace</button>
          <button onClick={onLogout}>Log out</button>
        </div>
      </header>

      <div className="buyer-layout">
        <aside className="buyer-sidebar">
          <div className="buyer-profile">
            <div className="buyer-avatar">
              {(user?.fullName || 'B').charAt(0).toUpperCase()}
            </div>
            <h3>{user?.fullName || 'Buyer'}</h3>
            <p>Buyer account</p>
          </div>

          <div className="buyer-nav-label">BUYER MENU</div>

          <nav className="buyer-nav">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Overview' && '▦ '}
                {tab === 'Browse Livestock' && '🐐 '}
                {tab === 'My Orders' && '▤ '}
                {tab === 'Cart' && '🛒 '}
                {tab}
                {tab === 'Cart' && ` (${cart.length})`}
              </button>
            ))}
          </nav>
        </aside>

        <main className="buyer-main">
          {activeTab === 'Overview' && (
            <>
              <div className="buyer-heading">
                <h1>Welcome, {user?.fullName || 'Buyer'}!</h1>
                <p>
                  Find livestock and manage your purchases in one place.
                </p>
              </div>

              <div className="buyer-stats">
                <div className="buyer-stat">
                  <span>Available livestock</span>
                  <strong>{liveLivestock.length}</strong>
                </div>

                <div className="buyer-stat">
                  <span>Items in cart</span>
                  <strong>{cart.length}</strong>
                </div>

                <div className="buyer-stat">
                  <span>My orders</span>
                  <strong>—</strong>
                </div>
              </div>

              <div className="buyer-section-title">
                <h2>Explore livestock</h2>
                <button onClick={() => setActiveTab('Browse Livestock')}>
                  Browse all →
                </button>
              </div>

              {renderLivestock(liveLivestock.slice(0, 3))}
            </>
          )}

          {activeTab === 'Browse Livestock' && (
            <>
              <div className="buyer-heading">
                <h1>Browse livestock</h1>
                <p>Explore livestock available on LIVESTA.</p>
              </div>

              <input
                className="buyer-search"
                type="search"
                placeholder="Search by name, category or location..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {renderLivestock(filteredLivestock)}
            </>
          )}

          {activeTab === 'My Orders' && (
            <>
              <div className="buyer-heading">
                <h1>My orders</h1>
                <p>Keep track of your livestock purchases.</p>
              </div>

              {cancelMessage && (
                <div
                  className={`buyer-message ${
                    cancelMessage.toLowerCase().includes('successfully')
                      ? ''
                      : 'buyer-error'
                  }`}
                >
                  {cancelMessage}
                </div>
              )}

              {ordersLoading ? (
                <div className="buyer-note">Loading your orders...</div>
              ) : ordersError ? (
                <div className="buyer-note buyer-error">
                  {ordersError}
                  <button
                    type="button"
                    onClick={fetchOrders}
                    style={{ marginLeft: 12 }}
                  >
                    Try again
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="buyer-empty">
                  <div className="buyer-empty-icon">📦</div>
                  <h3>Your orders will appear here</h3>
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div>
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="buyer-cart-item"
                      style={{
                        display: 'block',
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <h3>Order #{order.id}</h3>
                        <strong style={{ color: '#245b38' }}>
                          {String(order.status || 'pending').toUpperCase()}
                        </strong>
                      </div>

                      <p
                        style={{
                          color: '#788078',
                          margin: '8px 0',
                        }}
                      >
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString()
                          : 'Date unavailable'}
                      </p>

                      {(order.items || []).map((item, index) => (
                        <div
                          key={index}
                          style={{ margin: '12px 0' }}
                        >
                          <strong>{item.name || 'Livestock'}</strong>
                          <p
                            style={{
                              color: '#788078',
                              margin: '5px 0',
                            }}
                          >
                            {item.category} · Quantity: {item.quantity}
                          </p>
                          <p
                            style={{
                              color: '#245b38',
                              margin: 0,
                            }}
                          >
                            ₦
                            {Number(item.unitPrice || 0).toLocaleString(
                              'en-NG'
                            )}{' '}
                            each
                          </p>
                        </div>
                      ))}

                      <hr
                        style={{
                          border: 0,
                          borderTop: '1px solid #e8ebe5',
                        }}
                      />

                      <p style={{ margin: '12px 0 5px' }}>
                        Total:{' '}
                        <strong>
                          ₦
                          {Number(order.total_amount || 0).toLocaleString(
                            'en-NG'
                          )}
                        </strong>
                      </p>

                      <p style={{ color: '#788078', margin: 0 }}>
                        Payment:{' '}
                        {String(order.payment_method || '').replaceAll(
                          '_',
                          ' '
                        )}
                        {' · '}
                        {String(
                          order.payment_status || 'pending'
                        ).toUpperCase()}
                      </p>

                      {order.status === 'pending' && (
                        <button
                          type="button"
                          className="buyer-cancel-button"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrderId === order.id}
                        >
                          {cancellingOrderId === order.id
                            ? 'Cancelling...'
                            : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'Cart' && (
            <>
              <div className="buyer-heading">
                <h1>My cart</h1>
                <p>Review the livestock you have added.</p>
              </div>

              {cart.length === 0 ? (
                <div className="buyer-empty">
                  <div className="buyer-empty-icon">🛒</div>
                  <h3>Your cart is empty</h3>
                  <p>
                    Browse livestock and add items to your cart.
                  </p>
                  <br />
                  <button
                    className="buyer-primary-button"
                    style={{ maxWidth: 220 }}
                    onClick={() => setActiveTab('Browse Livestock')}
                  >
                    Browse livestock
                  </button>
                </div>
              ) : (
                <>
                  {cart.map((animal, index) => (
                    <div
                      className="buyer-cart-item"
                      key={animal.id || index}
                    >
                      <div>
                        <h3>{animal.name || 'Livestock'}</h3>
                        <p>{formatPrice(animal.price)}</p>
                      </div>

                      <span>{animal.category || 'Livestock'}</span>

                      <button
                        type="button"
                        onClick={() => onRemoveFromCart(index)}
                        style={{
                          background: '#fff0f0',
                          color: '#c62828',
                          border: '1px solid #ffcaca',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <div className="buyer-note">
                    <label>
                      Payment method:{' '}
                      <select
                        value={paymentMethod}
                        onChange={(event) =>
                          setPaymentMethod(event.target.value)
                        }
                        disabled={checkoutLoading}
                      >
                        <option value="pay_on_delivery">
                          Pay on Delivery
                        </option>
                        <option value="bank_transfer">
                          Bank Transfer
                        </option>
                        <option value="card">Card</option>
                      </select>
                    </label>

                    <br />
                    <br />

                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={checkoutLoading || cart.length === 0}
                    >
                      {checkoutLoading
                        ? 'Placing order...'
                        : 'Place Order'}
                    </button>

                    {checkoutMessage && <p>{checkoutMessage}</p>}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>

      {showCancelPopup && (
        <div
          className="buyer-store-overlay"
          onClick={() => {
            setShowCancelPopup(false);
            setOrderToCancel(null);
          }}
        >
          <section
            className="buyer-store-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="buyer-cancel-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="buyer-store-close"
              onClick={() => {
                setShowCancelPopup(false);
                setOrderToCancel(null);
              }}
              aria-label="Close cancellation confirmation"
            >
              ×
            </button>

            <div className="buyer-store-icon">⚠️</div>
            <h2 id="buyer-cancel-title">Cancel order?</h2>
            <p className="buyer-store-subtitle">
              Are you sure you want to cancel order #{orderToCancel}?
              This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                type="button"
                className="buyer-store-button"
                onClick={() => {
                  setShowCancelPopup(false);
                  setOrderToCancel(null);
                }}
              >
                Keep Order
              </button>

              <button
                type="button"
                className="buyer-primary-button"
                onClick={confirmCancelOrder}
              >
                Yes, Cancel Order
              </button>
            </div>
          </section>
        </div>
      )}

      {selectedStore && (
        <div
          className="buyer-store-overlay"
          onClick={() => setSelectedStore(null)}
        >
          <section
            className="buyer-store-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="buyer-store-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="buyer-store-close"
              onClick={() => setSelectedStore(null)}
              aria-label="Close store profile"
            >
              ×
            </button>

            <div className="buyer-store-icon">🏪</div>

            <h2 id="buyer-store-title">
              {selectedStore.seller_store_name || 'Seller Store'}
            </h2>

            <p className="buyer-store-subtitle">LIVESTA Seller</p>

            <div className="buyer-store-details">
              <p>
                <strong>Store location:</strong>{' '}
                {selectedStore.seller_location ||
                  selectedStore.location ||
                  'Not provided'}
              </p>

              <p>
                <strong>Phone:</strong>{' '}
                {selectedStore.seller_phone || 'Not provided'}
              </p>

              <p>
                <strong>About the store:</strong>{' '}
                {selectedStore.seller_description ||
                  'The seller has not added a store description yet.'}
              </p>
            </div>

            <div className="buyer-store-listing">
              <h3>Livestock listing</h3>
              <p>{selectedStore.name || 'Livestock'}</p>
              <p>{formatPrice(selectedStore.price)}</p>
            </div>

            <button
              type="button"
              className="buyer-primary-button"
              onClick={() => {
                onAddToCart?.(selectedStore);
                setSelectedStore(null);
              }}
            >
              Add to cart
            </button>
          </section>
        </div>
      )}
    </div>
  );
}